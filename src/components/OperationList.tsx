import clsx from 'clsx';
import type { OperationDefinition } from '../lib/types';

export function OperationList({
  operations,
  current,
  onSelect,
}: {
  operations: OperationDefinition[];
  current?: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
        Операции · {operations.length}
      </h2>
      {operations.map((op) => {
        const active = current === op.slug;
        return (
          <button
            key={op.slug}
            onClick={() => onSelect(op.slug)}
            className={clsx(
              'w-full text-left p-3 rounded-xl border transition-all duration-200 group',
              active
                ? 'bg-gradient-to-br from-emerald-500/15 to-teal-500/5 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span
                className={clsx(
                  'font-mono text-xs break-all leading-relaxed',
                  active ? 'text-emerald-300' : 'text-slate-300'
                )}
              >
                {op.signature}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1.5">
              <span
                className={clsx(
                  'text-xs',
                  active ? 'text-slate-200' : 'text-slate-500'
                )}
              >
                {op.title}
              </span>
              <span
                className={clsx(
                  'text-[10px] px-1.5 py-0.5 rounded font-mono whitespace-nowrap',
                  active
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-slate-800 text-amber-400/90'
                )}
              >
                {op.complexity}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}