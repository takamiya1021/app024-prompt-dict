'use client';

import type { FC } from 'react';

interface PromptPreviewProps {
  prompts: Record<string, string>;
  current: string;
  onChangeTemplate: (templateId: string) => void;
  onCopy: (prompt: string) => void;
  templates: { id: string; name: string }[];
}

const PromptPreview: FC<PromptPreviewProps> = ({ prompts, current, onChangeTemplate, onCopy, templates }) => {
  const currentPrompt = prompts[current] ?? '';

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-slate-900/60 p-6 text-white shadow-lg">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">プロンプトプレビュー</h3>
          <p className="text-sm text-slate-400">テンプレートを切り替えて、生成結果をすぐ確認できます。</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-300" htmlFor="prompt-template">
            テンプレート
          </label>
          <select
            id="prompt-template"
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-purple-400 focus:outline-none"
            value={current}
            onChange={(event) => onChangeTemplate(event.target.value)}
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
        {currentPrompt || 'プロンプトがまだ設定されていません。'}
      </pre>

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
          onClick={() => onCopy(currentPrompt)}
          disabled={!currentPrompt}
        >
          コピー
        </button>
      </div>
    </section>
  );
};

export default PromptPreview;
