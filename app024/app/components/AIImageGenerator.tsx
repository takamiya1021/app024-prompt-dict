'use client';

import { useState, useCallback } from 'react';
import type { FC } from 'react';
import { generateImageVariations, type ImageModel } from '../../lib/imagenService';
import type { Character } from '../../types';

interface AIImageGeneratorProps {
  character: Character;
  onSelectImage: (imageData: string) => void;
  apiKey?: string;
  baseImage?: string; // 既存画像（編集モード用）
}

const AIImageGenerator: FC<AIImageGeneratorProps> = ({ character, onSelectImage, apiKey, baseImage }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [agreedToCharges, setAgreedToCharges] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [selectedModel, setSelectedModel] = useState<ImageModel>('gemini-flash-exp');
  const [editPrompt, setEditPrompt] = useState('');

  // 既存画像がある場合は編集モード
  const isEditMode = !!baseImage;

  // モデル情報
  const modelInfo = {
    'imagen-4': {
      name: 'Imagen 4',
      cost: 0.16,
      description: '高品質・新規画像生成向き',
      requiresCharges: true,
    },
    'gemini-flash-exp': {
      name: 'nano banana',
      cost: 0.0,
      description: '無料枠25枚/日（5 RPM制限）',
      requiresCharges: false,
    },
  };

  const currentModelInfo = modelInfo[selectedModel];

  const handleGenerate = useCallback(async () => {
    if (!apiKey) {
      setError('APIキーが設定されていません');
      return;
    }

    // 編集モードでImagen 4を選択している場合はエラー
    if (isEditMode && selectedModel === 'imagen-4') {
      setError('画像編集はnano bananaのみ対応しています');
      return;
    }

    if (currentModelInfo.requiresCharges && !agreedToCharges) {
      setError('課金に同意してください');
      return;
    }

    setLoading(true);
    setError(null);
    setImages([]);

    try {
      // Generate prompt from character data
      const prompt = isEditMode
        ? editPrompt.trim() || `${character.appearance}, ${character.personality}`.trim()
        : `${character.appearance}, ${character.personality}`.trim();

      const result = await generateImageVariations(prompt, 4, apiKey, selectedModel, baseImage);

      setImages(result.images);
      setEstimatedCost(result.cost || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : '画像生成に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [character, apiKey, agreedToCharges, selectedModel, currentModelInfo.requiresCharges, isEditMode, baseImage, editPrompt]);

  const handleSelectImage = useCallback(
    (imageData: string) => {
      onSelectImage(imageData);
    },
    [onSelectImage]
  );

  return (
    <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-900/20 to-orange-900/20 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-300">
            AI画像{isEditMode ? '編集' : '生成'}（{currentModelInfo.name}）
          </h3>
        </div>
      </div>

      {/* 編集モード表示 */}
      {isEditMode && baseImage && (
        <div className="mb-4 rounded-lg border border-blue-500/50 bg-blue-900/20 p-4">
          <div className="mb-2 flex items-center gap-2 text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <h4 className="font-semibold">✏️ 画像編集モード</h4>
          </div>
          <div className="flex items-center gap-3">
            <img src={baseImage} alt="編集元画像" className="h-20 w-20 rounded-lg object-cover" />
            <p className="text-sm text-blue-200/90">
              この画像を元に編集します（nano banana専用）
            </p>
          </div>
        </div>
      )}

      {/* 編集プロンプト入力 */}
      {isEditMode && (
        <div className="mb-4 rounded-lg border border-purple-500/50 bg-purple-900/20 p-4">
          <label className="mb-2 block text-sm font-semibold text-purple-300">
            編集指示（どう変更するか）
          </label>
          <textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="例: 髪を短くして、笑顔にして、背景を明るくして"
            className="w-full rounded-lg border border-purple-500/30 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            rows={3}
          />
          <p className="mt-2 text-xs text-purple-200/70">
            空欄の場合はキャラクター設定（外見・性格）を使って編集します
          </p>
        </div>
      )}

      {/* モデル選択スイッチ */}
      <div className="mb-4 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-300">モデル選択</h4>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedModel('gemini-flash-exp')}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              selectedModel === 'gemini-flash-exp'
                ? 'bg-green-500 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            <div className="font-semibold">nano banana</div>
            <div className="text-xs opacity-80">✅ 無料枠25枚/日</div>
          </button>
          <button
            onClick={() => !isEditMode && setSelectedModel('imagen-4')}
            disabled={isEditMode}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              selectedModel === 'imagen-4'
                ? 'bg-purple-500 text-white'
                : isEditMode
                ? 'cursor-not-allowed bg-slate-800 text-slate-600'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
            title={isEditMode ? '編集モードでは使用できません' : undefined}
          >
            <div className="font-semibold">Imagen 4</div>
            <div className="text-xs opacity-80">💎 高品質{isEditMode ? '（編集不可）' : ''}</div>
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">{currentModelInfo.description}</p>
      </div>

      {/* 課金警告・情報 */}
      {currentModelInfo.requiresCharges ? (
        <div className="mb-6 rounded-lg border-2 border-red-500/50 bg-red-900/30 p-4">
          <div className="mb-2 flex items-center gap-2 text-red-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <h4 className="font-semibold">⚠️ 課金対象機能</h4>
          </div>
          <ul className="space-y-1 text-sm text-red-200/90">
            <li>• 1回の生成で4枚の画像を作成します</li>
            <li>• 推定コスト: 約${currentModelInfo.cost.toFixed(2)} USD (4枚)</li>
            <li>• 安全性フィルターによりブロックされる場合があります</li>
          </ul>

          <label className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={agreedToCharges}
              onChange={(e) => setAgreedToCharges(e.target.checked)}
              className="h-4 w-4 rounded border-red-500 bg-red-900/50 text-red-500 focus:ring-2 focus:ring-red-500"
            />
            <span className="text-sm text-red-200">上記の課金に同意します</span>
          </label>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border-2 border-green-500/50 bg-green-900/30 p-4">
          <div className="mb-2 flex items-center gap-2 text-green-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <h4 className="font-semibold">✅ 無料枠で利用可能</h4>
          </div>
          <ul className="space-y-1 text-sm text-green-200/90">
            <li>• 無料枠: 25枚/日まで（5 RPM制限）</li>
            <li>• 1回の生成で4枚の画像を作成します</li>
            <li>• 安全性フィルターによりブロックされる場合があります</li>
          </ul>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300" role="alert">
          {error}
        </div>
      )}

      {/* 生成ボタン */}
      <button
        onClick={handleGenerate}
        disabled={loading || !apiKey || (currentModelInfo.requiresCharges && !agreedToCharges)}
        className="mb-6 w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-6 py-3 font-semibold text-white transition-all hover:from-red-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? '生成中...' : '画像を生成'}
      </button>

      {/* 生成された画像 */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-300">
              生成された画像（{images.length}枚）
            </h4>
            {estimatedCost > 0 && (
              <span className="text-xs text-red-400">推定コスト: ${estimatedCost.toFixed(2)}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-700 bg-slate-900/50 transition-all hover:border-purple-500"
                onClick={() => handleSelectImage(image)}
              >
                <img
                  src={image}
                  alt={`Generated ${index + 1}`}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white">
                    選択
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!apiKey && (
        <div className="mt-4 rounded-lg bg-yellow-900/30 px-4 py-2 text-sm text-yellow-300">
          APIキーを設定すると、画像生成機能が利用できます
        </div>
      )}
    </div>
  );
};

export default AIImageGenerator;
