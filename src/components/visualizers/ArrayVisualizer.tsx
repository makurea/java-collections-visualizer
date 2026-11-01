import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { ArrayState, Highlight } from '../../lib/types';

const colorStyles = {
  info: 'bg-sky-500/20 border-sky-400 text-sky-100 glow-info',
  success: 'bg-emerald-500/20 border-emerald-400 text-emerald-100 glow-success',
  warning: 'bg-amber-500/20 border-amber-400 text-amber-100 glow-warning',
  error: 'bg-rose-500/20 border-rose-400 text-rose-100 glow-error',
};

export function ArrayVisualizer({
  state,
  highlight,
}: {
  state: ArrayState;
  highlight?: Highlight;
}) {
  const { elements, capacity, indices } = state;
  const total = Math.max(capacity, elements.length);
  const showAll = total <= 16;
  const displayCells = showAll ? total : 16;
  const color = highlight?.color || 'info';

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {/* Индикаторы size / capacity */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">size</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono font-semibold">
            {elements.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">capacity</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono font-semibold">
            {capacity}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: displayCells }).map((_, i) => {
          const val = i < elements.length ? elements[i] : null;
          const filled = val !== null;
          const isHighlighted = highlight?.indices?.includes(i);

          return (
            <div key={i} className="flex flex-col items-center">
              <div
                className={clsx(
                  'relative w-14 h-14 rounded-xl border-2 flex items-center justify-center font-mono text-lg font-semibold transition-all duration-300',
                  !filled && 'border-dashed border-slate-800 bg-slate-900/30 text-slate-700',
                  filled && !isHighlighted && 'border-slate-700 bg-slate-800/60 text-slate-100 shadow-md',
                  isHighlighted && colorStyles[color]
                )}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={String(val ?? 'empty') + i}
                    initial={{ opacity: 0, scale: 0.5, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {val !== null ? String(val) : ''}
                  </motion.span>
                </AnimatePresence>
              </div>
              {indices && (
                <div
                  className={clsx(
                    'text-[10px] mt-1.5 font-mono font-medium transition-colors',
                    isHighlighted ? 'text-slate-300' : 'text-slate-600'
                  )}
                >
                  {i}
                </div>
              )}
            </div>
          );
        })}
        {!showAll && <div className="self-center text-slate-500 px-2">…</div>}
      </div>
    </div>
  );
}