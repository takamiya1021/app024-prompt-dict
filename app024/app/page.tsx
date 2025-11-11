'use client';

import { useEffect, useState } from 'react';
import { useCharacterStore } from '../store/useCharacterStore';
import { loadState } from '../lib/storage';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import TagFilter from './components/TagFilter';
import CharacterGrid from './components/CharacterGrid';
import CharacterForm, { type CharacterFormValues } from './components/CharacterForm';
import ExportDialog from './components/ExportDialog';
import ImportDialog from './components/ImportDialog';
import VersionHistoryDialog from './components/VersionHistoryDialog';
import AICharacterGenerator from './components/AICharacterGenerator';
import AIImageGenerator from './components/AIImageGenerator';
import ApiKeySettings from './components/ApiKeySettings';
import { copyToClipboard } from '../lib/clipboard';
import { buildPromptContext } from '../lib/promptGenerator';
import type { Character } from '../types';

type DialogMode = 'none' | 'create' | 'edit' | 'export' | 'import' | 'version' | 'ai-generate' | 'ai-image' | 'settings';

export default function Home() {
  const [dialogMode, setDialogMode] = useState<DialogMode>('none');
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Load API key from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('gemini_api_key');
      setApiKey(storedKey);
    }
  }, [dialogMode]); // Reload when dialog closes

  const {
    characters,
    selectedCharacterId,
    selectedTags,
    searchQuery,
    addCharacter,
    updateCharacter,
    setSelectedCharacter,
    setSelectedTags,
    setSearchQuery,
    filteredCharacters,
    allTags,
    importCharacters,
    exportCharacters,
  } = useCharacterStore();

  // LocalStorageからの初期データ読み込みと自動保存設定
  useEffect(() => {
    // 初期データ読み込みはattachStorePersistenceで行われるため不要
    // 自動保存の設定
    const { attachStorePersistence } = require('../lib/storage');
    const unsubscribe = attachStorePersistence(useCharacterStore);
    return () => {
      unsubscribe();
    };
  }, []);

  const handleCreateCharacter = () => {
    setDialogMode('create');
    setEditingCharacterId(null);
  };

  const handleEditCharacter = (id: string) => {
    setDialogMode('edit');
    setEditingCharacterId(id);
    setSelectedCharacter(id);
  };

  const handleFormSubmit = (values: CharacterFormValues) => {
    if (dialogMode === 'create') {
      const newCharacter: Character = {
        id: `char_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name: values.name,
        appearance: values.appearance,
        personality: values.personality,
        background: values.background,
        tags: values.tags,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addCharacter(newCharacter);
    } else if (dialogMode === 'edit' && editingCharacterId) {
      updateCharacter(editingCharacterId, {
        name: values.name,
        appearance: values.appearance,
        personality: values.personality,
        background: values.background,
        tags: values.tags,
        updatedAt: new Date(),
      });
    }
    setDialogMode('none');
    setEditingCharacterId(null);
  };

  const handleFormCancel = () => {
    setDialogMode('none');
    setEditingCharacterId(null);
  };

  const handleCopyPrompt = async (id: string) => {
    const character = characters.find((c) => c.id === id);
    if (!character) return;

    const context = buildPromptContext(character);
    const prompt = context.summary; // デフォルトプロンプトを使用

    const success = await copyToClipboard(prompt);
    if (success) {
      setCopyFeedback(`「${character.name}」のプロンプトをコピーしました`);
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleImport = (characters: Character[]) => {
    characters.forEach((char) => addCharacter(char));
    setDialogMode('none');
  };

  const filtered = filteredCharacters();
  const tags = allTags();

  const editingCharacter = editingCharacterId
    ? characters.find((c) => c.id === editingCharacterId)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* ヘッダー */}
        <Header characterCount={characters.length} onCreateCharacter={handleCreateCharacter} />

        {/* 検索・フィルター */}
        <div className="mt-8 flex flex-col gap-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <TagFilter tags={tags} selected={selectedTags} onToggle={handleToggleTag} />
        </div>

        {/* アクションボタン */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setDialogMode('ai-generate')}
            className="rounded-full border border-purple-500 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-purple-700 hover:to-blue-700"
          >
            ✨ AI生成
          </button>
          <button
            type="button"
            onClick={() => setDialogMode('settings')}
            className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white transition hover:border-purple-400"
          >
            ⚙️ API設定
          </button>
          <button
            type="button"
            onClick={() => setDialogMode('export')}
            className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white transition hover:border-purple-400"
          >
            エクスポート
          </button>
          <button
            type="button"
            onClick={() => setDialogMode('import')}
            className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white transition hover:border-purple-400"
          >
            インポート
          </button>
        </div>

        {/* キャラクター一覧 */}
        <div className="mt-8">
          <CharacterGrid
            characters={filtered}
            selectedId={selectedCharacterId}
            onSelect={handleEditCharacter}
            onCopyPrompt={handleCopyPrompt}
          />
        </div>

        {/* コピーフィードバック */}
        {copyFeedback && (
          <div className="fixed bottom-8 right-8 rounded-xl bg-green-500 px-6 py-3 text-white shadow-lg">
            {copyFeedback}
          </div>
        )}
      </div>

      {/* ダイアログ - 作成/編集フォーム */}
      {(dialogMode === 'create' || dialogMode === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-slate-900 p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {dialogMode === 'create' ? '新規キャラクター作成' : 'キャラクター編集'}
              </h2>
              {dialogMode === 'edit' && editingCharacter && (
                <button
                  type="button"
                  onClick={() => setDialogMode('ai-image')}
                  className="rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-pink-700 hover:to-purple-700"
                >
                  🖼️ 画像生成
                </button>
              )}
            </div>

            {/* サムネイルプレビュー */}
            {editingCharacter?.thumbnail && (
              <div className="mb-6 flex flex-col items-center gap-3">
                <div className="text-sm font-medium text-slate-300">現在のサムネイル</div>
                <div className="relative h-48 w-48 overflow-hidden rounded-2xl border-2 border-purple-500/50 bg-slate-800">
                  <img
                    src={editingCharacter.thumbnail}
                    alt={editingCharacter.name}
                    className="h-full w-full object-cover"
                  />
                  {/* 削除ボタン */}
                  <button
                    type="button"
                    onClick={() => {
                      if (editingCharacter) {
                        updateCharacter(editingCharacter.id, {
                          thumbnail: undefined,
                          updatedAt: new Date(),
                        });
                      }
                    }}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500/90 text-white transition hover:bg-red-600"
                    title="サムネイルを削除"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-slate-400">✕ボタンで削除 / 🖼️画像生成で変更</p>
              </div>
            )}

            <CharacterForm
              initial={
                editingCharacter
                  ? {
                      name: editingCharacter.name,
                      appearance: editingCharacter.appearance,
                      personality: editingCharacter.personality,
                      background: editingCharacter.background,
                      tags: editingCharacter.tags,
                    }
                  : undefined
              }
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              submitLabel={dialogMode === 'create' ? '作成' : '更新'}
            />
          </div>
        </div>
      )}

      {/* ダイアログ - エクスポート */}
      <ExportDialog
        open={dialogMode === 'export'}
        characters={characters}
        onClose={() => setDialogMode('none')}
      />

      {/* ダイアログ - インポート */}
      <ImportDialog
        open={dialogMode === 'import'}
        onImport={handleImport}
        onClose={() => setDialogMode('none')}
      />

      {/* ダイアログ - バージョン履歴 */}
      {editingCharacterId && (
        <VersionHistoryDialog
          open={dialogMode === 'version'}
          versions={editingCharacter?.versionHistory ?? []}
          currentVersion={editingCharacter?.version ?? 1}
          onRestore={(version) => {
            const { restoreVersion } = useCharacterStore.getState();
            restoreVersion(editingCharacterId, version);
          }}
          onSaveSnapshot={() => {
            const { saveVersion } = useCharacterStore.getState();
            saveVersion(editingCharacterId, 'manual-snapshot');
          }}
          onClose={() => setDialogMode('none')}
        />
      )}

      {/* ダイアログ - AI生成 */}
      {dialogMode === 'ai-generate' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-slate-900 p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">AI キャラクター生成</h2>
              <button
                onClick={() => setDialogMode('none')}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <AICharacterGenerator
              onGenerate={(values) => {
                const newCharacter: Character = {
                  id: `char_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                  name: values.name,
                  appearance: values.appearance,
                  personality: values.personality,
                  background: values.background,
                  tags: values.tags,
                  version: 1,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
                addCharacter(newCharacter);
                setDialogMode('none');
                setCopyFeedback(`「${values.name}」を作成しました`);
                setTimeout(() => setCopyFeedback(null), 3000);
              }}
              apiKey={apiKey || undefined}
            />
          </div>
        </div>
      )}

      {/* ダイアログ - API設定 */}
      {dialogMode === 'settings' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-slate-900 p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">API設定</h2>
              <button
                onClick={() => setDialogMode('none')}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <ApiKeySettings onClose={() => setDialogMode('none')} />
          </div>
        </div>
      )}

      {/* ダイアログ - AI画像生成 */}
      {dialogMode === 'ai-image' && editingCharacter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-slate-900 p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">AI画像生成 - {editingCharacter.name}</h2>
              <button
                onClick={() => setDialogMode('edit')}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <AIImageGenerator
              character={editingCharacter}
              onSelectImage={(imageData) => {
                updateCharacter(editingCharacter.id, {
                  thumbnail: imageData,
                  updatedAt: new Date(),
                });
                setDialogMode('edit');
                setCopyFeedback('画像を設定しました');
                setTimeout(() => setCopyFeedback(null), 3000);
              }}
              apiKey={apiKey || undefined}
              baseImage={editingCharacter.thumbnail}
            />
          </div>
        </div>
      )}
    </div>
  );
}
