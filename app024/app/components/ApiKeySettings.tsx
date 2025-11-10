'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FC, ChangeEvent, FormEvent } from 'react';

interface ApiKeySettingsProps {
  onClose?: () => void;
}

const ApiKeySettings: FC<ApiKeySettingsProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('gemini_api_key');
      if (storedKey) {
        setApiKey(storedKey);
      }
    }
  }, []);

  const handleApiKeyChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
    setSaved(false);
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (typeof window !== 'undefined') {
        if (apiKey.trim()) {
          localStorage.setItem('gemini_api_key', apiKey.trim());
        } else {
          localStorage.removeItem('gemini_api_key');
        }
        setSaved(true);

        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose?.();
        }, 2000);
      }
    },
    [apiKey, onClose]
  );

  const toggleShowKey = useCallback(() => {
    setShowKey((prev) => !prev);
  }, []);

  const clearApiKey = useCallback(() => {
    setApiKey('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gemini_api_key');
    }
    setSaved(false);
  }, []);

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-purple-300">API Settings</h3>
        <p className="mt-2 text-sm text-slate-400">
          Gemini APIキーを設定して、AI機能を利用できるようにします
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="gemini-api-key">
            Gemini API Key
          </label>
          <div className="relative">
            <input
              id="gemini-api-key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={handleApiKeyChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 pr-24 text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
              placeholder="AIzaSy..."
            />
            <button
              type="button"
              onClick={toggleShowKey}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300 hover:bg-slate-700"
            >
              {showKey ? '隠す' : '表示'}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            APIキーは{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              Google AI Studio
            </a>{' '}
            から取得できます
          </p>
        </div>

        {saved && (
          <div className="rounded-lg bg-green-900/30 px-4 py-2 text-sm text-green-300" role="status">
            APIキーを保存しました
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold text-white transition-all hover:from-purple-600 hover:to-blue-600"
          >
            保存
          </button>
          <button
            type="button"
            onClick={clearApiKey}
            className="rounded-xl border border-slate-600 bg-slate-800/50 px-6 py-3 font-semibold text-slate-300 transition-all hover:bg-slate-700"
          >
            クリア
          </button>
        </div>
      </form>

      <div className="mt-6 rounded-lg bg-yellow-900/20 p-4">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-300">
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
          注意事項
        </h4>
        <ul className="space-y-1 text-xs text-yellow-200/80">
          <li>• APIキーはブラウザのLocalStorageに保存されます</li>
          <li>• テキスト生成（gemini-2.0-flash-exp）: 無料枠 1日1,000回</li>
          <li>• 画像生成（Imagen 3）: 課金必須（無料枠なし）</li>
          <li>• APIキーは外部に送信されません</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiKeySettings;
