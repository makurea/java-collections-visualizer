import type { OperationParam } from '../lib/types';

export function InputPanel({
  params,
  values,
  onChange,
}: {
  params: OperationParam[];
  values: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
}) {
  if (params.length === 0) {
    return (
      <div className="px-4 py-3 rounded-xl bg-slate-900/60 backdrop-blur border border-slate-800 text-xs text-slate-500 flex items-center gap-2">
        <span>⚡</span>
        <span>У этой операции нет параметров — визуализация сразу показывает результат</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-slate-900/60 backdrop-blur border border-slate-800">
      <div className="flex flex-wrap gap-3 items-end">
        {params.map((p) => (
          <div key={p.name} className="flex-1 min-w-[140px]">
            <label className="block text-[11px] font-medium text-slate-500 mb-1.5 uppercase tracking-wider">
              {p.label}
            </label>
            <input
              type={p.type === 'number' ? 'number' : 'text'}
              value={values[p.name] ?? p.default}
              onChange={(e) =>
                onChange({
                  ...values,
                  [p.name]: p.type === 'number' ? Number(e.target.value) : e.target.value,
                })
              }
              min={p.min}
              max={p.max}
              className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 transition outline-none text-sm font-mono text-slate-100"
            />
          </div>
        ))}
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          обновляется автоматически
        </div>
      </div>
    </div>
  );
}