import { useState } from 'react';

export function CodeExample({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/70 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          <span className="ml-2 text-xs font-medium text-slate-400">Пример</span>
        </div>
        <button
          onClick={copy}
          className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition font-medium"
        >
          {copied ? '✓ Скопировано' : 'Копировать'}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto font-mono text-slate-300 leading-relaxed">
        <code className="whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}