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
import { copyToClipboard } from '../lib/clipboard';
import { buildPromptContext } from '../lib/promptGenerator';
import type { Character } from '../types';

type DialogMode = 'none' | 'create' | 'edit' | 'export' | 'import' | 'version';

export default function Home() {
  const [dialogMode, setDialogMode] = useState<DialogMode>('none');
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

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
        <div className="mt-6 flex gap-3">
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
            <h2 className="mb-6 text-2xl font-bold text-white">
              {dialogMode === 'create' ? '新規キャラクター作成' : 'キャラクター編集'}
            </h2>
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
    </div>
  );
}
