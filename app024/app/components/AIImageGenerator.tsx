'use client';

import { useState, useCallback } from 'react';
import type { FC } from 'react';
import { generateImageVariations } from '../../lib/imagenService';
import type { Character } from '../../types';

interface AIImageGeneratorProps {
  character: Character;
  onSelectImage: (imageData: string) => void;
  apiKey?: string;
}

const AIImageGenerator: FC<AIImageGeneratorProps> = ({ character, onSelectImage, apiKey }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [agreedToCharges, setAgreedToCharges] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);

  const handleGenerate = useCallback(async () => {
    if (!apiKey) {
      setError('APIキーが設定されていません');
      return;
    }

    if (!agreedToCharges) {
      setError('課金に同意してください');
      return;
    }

    setLoading(true);
    setError(null);
    setImages([]);

    try {
      // Generate prompt from character data
      const prompt = `${character.appearance}, ${character.personality}`.trim();

      const result = await generateImageVariations(prompt, 4, apiKey);

      setImages(result.images);
      setEstimatedCost(result.cost || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : '画像生成に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [character, apiKey, agreedToCharges]);

  const handleSelectImage = useCallback(
    (imageData: string) => {
      onSelectImage(imageData);
    },
    [onSelectImage]
  );

  return (
    <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-900/20 to-orange-900/20 p-6">
      <div className="mb-4 flex items-center gap-2">
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
        <h3 className="text-lg font-semibold text-red-300">AI画像生成（Imagen 3）</h3>
      </div>

      {/* 課金警告 */}
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
          <h4 className="font-semibold">⚠️ 課金対象機能（無料枠なし）</h4>
        </div>
        <ul className="space-y-1 text-sm text-red-200/90">
          <li>• 1回の生成で4枚の画像を作成します</li>
          <li>• 推定コスト: 約$0.16 USD (4枚)</li>
          <li>• GCP Billingが有効化されている必要があります</li>
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

      {error && (
        <div className="mb-4 rounded-lg bg-red-900/50 px-4 py-2 text-sm text-red-300" role="alert">
          {error}
        </div>
      )}

      {/* 生成ボタン */}
      <button
        onClick={handleGenerate}
        disabled={loading || !apiKey || !agreedToCharges}
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
