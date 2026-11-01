import type { VisualState, Highlight } from '../../lib/types';
import { ArrayVisualizer } from './ArrayVisualizer';
import { LinkedListVisualizer } from './LinkedListVisualizer';
import { HashVisualizer } from './HashVisualizer';
import { TreeVisualizer } from './TreeVisualizer';

function Legend({ kind }: { kind: string }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-800/60">
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" /> ячейка
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-sky-500/40 border border-sky-400" /> читаем
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-400" /> перемещаем
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-400" /> результат
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded bg-rose-500/40 border border-rose-400" /> ошибка
      </span>
      {kind === 'hash' && (
        <span className="flex items-center gap-1.5">
          <span className="text-slate-600 font-mono text-xs">∅</span> пустой бакет
        </span>
      )}
      {kind === 'linked' && (
        <span className="flex items-center gap-1.5">
          <span className="text-slate-500 font-mono text-[10px]">next / prev</span> связи
        </span>
      )}
      {kind === 'tree' && (
        <>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 border-2 border-rose-400" /> красный
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-900 border-2 border-slate-500" /> чёрный
          </span>
        </>
      )}
    </div>
  );
}

export function Visualizer({
  state,
  highlight,
}: {
  state: VisualState;
  highlight?: Highlight;
}) {
  return (
    <div>
      {state.kind === 'array' && <ArrayVisualizer state={state} highlight={highlight} />}
      {state.kind === 'linked' && <LinkedListVisualizer state={state} highlight={highlight} />}
      {state.kind === 'hash' && <HashVisualizer state={state} highlight={highlight} />}
      {state.kind === 'tree' && <TreeVisualizer state={state} highlight={highlight} />}
      {!['array', 'linked', 'hash', 'tree'].includes(state.kind) && (
        <div className="text-rose-400 text-center py-8 text-sm font-mono">
          Неизвестный тип: {String((state as any).kind)}
        </div>
      )}
      <Legend kind={state.kind} />
    </div>
  );
}