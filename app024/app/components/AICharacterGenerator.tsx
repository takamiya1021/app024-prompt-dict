'use client';

import { useState, useCallback } from 'react';
import type { FC, ChangeEvent, FormEvent } from 'react';
import { generateCharacter } from '../../lib/geminiService';
import type { CharacterFormValues } from './CharacterForm';

interface AICharacterGeneratorProps {
  onGenerate: (values: CharacterFormValues) => void;
  apiKey?: string;
}

const AICharacterGenerator: FC<AICharacterGeneratorProps> = ({ onGenerate, apiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePromptChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!apiKey) {
        setError('APIキーが設定されていません');
        return;
      }

      if (!prompt.trim()) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await generateCharacter(prompt.trim(), apiKey);
        onGenerate({
          name: result.name,
          appearance: result.appearance,
          personality: result.personality,
          background: result.background,
          tags: result.tags,
        });
      } catch (err) {
        setError('生成に失敗しました: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    },
    [prompt, apiKey, onGenerate]
  );

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-6">
      <div className="mb-4 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-purple-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-purple-300">AI自動生成</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="ai-prompt">
            簡単な設定を入力
          </label>
          <input
            id="ai-prompt"
            value={prompt}
            onChange={handlePromptChange}
            className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            placeholder="例: 元気な女子高生"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-900/30 px-4 py-2 text-sm text-red-300" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !prompt.trim() || !apiKey}
          className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold text-white transition-all hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '生成中...' : 'AI生成'}
        </button>
      </form>

      {!apiKey && !error && (
        <div className="mt-4 rounded-lg bg-yellow-900/30 px-4 py-2 text-sm text-yellow-300">
          APIキーを設定すると、AI生成機能が利用できます
        </div>
      )}
    </div>
  );
};

export default AICharacterGenerator;
