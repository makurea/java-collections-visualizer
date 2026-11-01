import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { HashState, Highlight } from '../../lib/types';

const activeStyles = {
  info: {
    bucket: 'border-sky-400 bg-sky-500/15 text-sky-100 glow-info',
    node: 'border-sky-400 bg-sky-500/15 glow-info',
    line: '#38bdf8',
  },
  success: {
    bucket: 'border-emerald-400 bg-emerald-500/15 text-emerald-100 glow-success',
    node: 'border-emerald-400 bg-emerald-500/15 glow-success',
    line: '#34d399',
  },
  warning: {
    bucket: 'border-amber-400 bg-amber-500/15 text-amber-100 glow-warning',
    node: 'border-amber-400 bg-amber-500/15 glow-warning',
    line: '#fbbf24',
  },
  error: {
    bucket: 'border-rose-400 bg-rose-500/15 text-rose-100 glow-error',
    node: 'border-rose-400 bg-rose-500/15 glow-error',
    line: '#fb7185',
  },
} as const;

const ROW_H = 52;
const BUCKET_SIZE = 44;
const ARROW_W = 36;

function HArrow({ color, width = ARROW_W }: { color: string; width?: number }) {
  return (
    <svg
      width={width}
      height={ROW_H}
      viewBox={`0 0 ${width} ${ROW_H}`}
      className="shrink-0"
    >
      <line
        x1={0}
        y1={ROW_H / 2}
        x2={width - 8}
        y2={ROW_H / 2}
        stroke={color}
        strokeWidth={2}
      />
      <polygon
        points={`${width - 8},${ROW_H / 2 - 4} ${width},${ROW_H / 2} ${width - 8},${
          ROW_H / 2 + 4
        }`}
        fill={color}
      />
    </svg>
  );
}

function EmptyConnector() {
  return (
    <svg
      width={ARROW_W}
      height={ROW_H}
      viewBox={`0 0 ${ARROW_W} ${ROW_H}`}
      className="shrink-0"
    >
      <line
        x1={0}
        y1={ROW_H / 2}
        x2={ARROW_W}
        y2={ROW_H / 2}
        stroke="#334155"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
    </svg>
  );
}

function StatBadge({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-slate-500">{label}</span>
      <span
        className={clsx(
          'px-2 py-0.5 rounded-md font-mono font-semibold',
          accent
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-slate-800 text-slate-300'
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function HashVisualizer({
  state,
  highlight,
}: {
  state: HashState;
  highlight?: Highlight;
}) {
  const color = (highlight?.color || 'info') as keyof typeof activeStyles;
  const styles = activeStyles[color];
  const activeBuckets = highlight?.indices || [];
  const totalEntries = state.buckets.reduce((a, b) => a + b.entries.length, 0);
  const hasAnyCollision = state.buckets.some((b) => b.entries.length > 1);

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Инфо-бар */}
      <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
        <StatBadge label="capacity" value={String(state.capacity)} />
        <StatBadge label="элементов" value={String(totalEntries)} accent />
        {hasAnyCollision && (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-medium">
            ⚠️ есть коллизии
          </span>
        )}
      </div>

      {/* Основная диаграмма */}
      <div className="overflow-x-auto pb-2">
        <div className="flex flex-col gap-1 min-w-max mx-auto">
          {state.buckets.map((bucket) => {
            const isActive = activeBuckets.includes(bucket.index);
            const hasEntries = bucket.entries.length > 0;
            const activeLine = isActive ? styles.line : '#475569';

            return (
              <div
                key={bucket.index}
                className="flex items-center"
                style={{ height: ROW_H }}
              >
                {/* Бакет */}
                <motion.div
                  layout
                  className={clsx(
                    'rounded-lg border-2 flex items-center justify-center font-mono text-xs font-semibold transition-all duration-300 shrink-0',
                    isActive
                      ? styles.bucket
                      : 'border-slate-700 bg-slate-900/60 text-slate-400'
                  )}
                  style={{ width: BUCKET_SIZE, height: BUCKET_SIZE }}
                >
                  {bucket.index}
                </motion.div>

                {/* Соединитель: пунктир для пустого, стрелка для заполненного */}
                {hasEntries ? (
                  <HArrow color={activeLine} />
                ) : (
                  <>
                    <EmptyConnector />
                    <span className="text-slate-700 font-mono text-sm pl-0.5 select-none">
                      ∅
                    </span>
                  </>
                )}

                {/* Цепочка элементов в бакете */}
                {hasEntries && (
                  <div className="flex items-center">
                    {bucket.entries.map((entry, i) => (
                      <div
                        key={`${bucket.index}-${i}-${entry.key}`}
                        className="flex items-center"
                      >
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.2 }}
                          className={clsx(
                            'rounded-lg border-2 px-3 py-1 font-mono text-xs text-center transition-all duration-300',
                            isActive
                              ? styles.node
                              : 'border-slate-700 bg-slate-800/70'
                          )}
                          style={{ minWidth: 88, height: 42 }}
                          title={`hash = ${entry.hash}`}
                        >
                          <div
                            className={clsx(
                              'font-semibold leading-tight',
                              isActive ? 'text-slate-100' : 'text-emerald-400'
                            )}
                          >
                            {entry.key}
                          </div>
                          {entry.value !== undefined && (
                            <div
                              className={clsx(
                                'text-[10px] mt-0.5 leading-tight',
                                isActive ? 'text-slate-300' : 'text-amber-400'
                              )}
                            >
                              {entry.value}
                            </div>
                          )}
                        </motion.div>

                        {/* next-стрелка между элементами цепочки */}
                        {i < bucket.entries.length - 1 && (
                          <div className="relative">
                            <HArrow color={activeLine} width={28} />
                            <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-500 select-none">
                              next
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    {bucket.entries.length > 1 && (
                      <span className="ml-2 text-[10px] text-amber-400 whitespace-nowrap font-medium">
                        ⚠️ коллизия
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}