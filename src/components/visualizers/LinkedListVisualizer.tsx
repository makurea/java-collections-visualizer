import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import type { LinkedListState, Highlight } from '../../lib/types';

const colorStyles = {
  info: 'bg-sky-500/20 border-sky-400 text-sky-100 glow-info',
  success: 'bg-emerald-500/20 border-emerald-400 text-emerald-100 glow-success',
  warning: 'bg-amber-500/20 border-amber-400 text-amber-100 glow-warning',
  error: 'bg-rose-500/20 border-rose-400 text-rose-100 glow-error',
} as const;

function DoubleArrow({
  color,
  width = 44,
}: {
  color: string;
  width?: number;
}) {
  return (
    <svg
      width={width}
      height={56}
      viewBox={`0 0 ${width} 56`}
      className="shrink-0"
    >
      {/* next — сверху, вправо */}
      <line
        x1={0}
        y1={16}
        x2={width - 8}
        y2={16}
        stroke={color}
        strokeWidth={1.8}
      />
      <polygon
        points={`${width - 8},12 ${width},16 ${width - 8},20`}
        fill={color}
      />
      {/* prev — снизу, влево */}
      <line
        x1={8}
        y1={40}
        x2={width}
        y2={40}
        stroke={color}
        strokeWidth={1.8}
        opacity={0.7}
      />
      <polygon points={`8,36 0,40 8,44`} fill={color} opacity={0.7} />
      {/* подписи */}
      <text
        x={width / 2}
        y={9}
        textAnchor="middle"
        fill={color}
        fontSize={9}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={500}
      >
        next
      </text>
      <text
        x={width / 2}
        y={54}
        textAnchor="middle"
        fill={color}
        fontSize={9}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={500}
        opacity={0.7}
      >
        prev
      </text>
    </svg>
  );
}

export function LinkedListVisualizer({
  state,
  highlight,
}: {
  state: LinkedListState;
  highlight?: Highlight;
}) {
  const { nodes, headId, tailId } = state;
  const color = (highlight?.color || 'info') as keyof typeof colorStyles;
  const activeNode = highlight?.nodeIds || [];
  const lineColor =
    color === 'success'
      ? '#34d399'
      : color === 'warning'
      ? '#fbbf24'
      : color === 'error'
      ? '#fb7185'
      : '#38bdf8';

  return (
    <div className="flex flex-col items-center gap-2 py-4 min-h-[140px]">
      {nodes.length === 0 && (
        <div className="text-slate-500 text-sm">Список пуст</div>
      )}

      <div className="flex flex-wrap items-start gap-1 justify-center">
        <AnimatePresence initial={false}>
          {nodes.map((node, i) => {
            const isHead = node.id === headId;
            const isTail = node.id === tailId;
            const isHighlighted = activeNode.includes(node.id);
            const isLast = i === nodes.length - 1;

            return (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1"
              >
                <div className="flex flex-col items-center">
                  {/* head label */}
                  <div className="h-5 mb-0.5">
                    {isHead && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        head
                      </span>
                    )}
                  </div>

                  <div
                    className={clsx(
                      'px-4 py-2.5 rounded-xl border-2 font-mono text-base font-semibold min-w-[56px] text-center transition-all duration-300',
                      isHighlighted
                        ? colorStyles[color]
                        : 'border-slate-700 bg-slate-800/60 text-slate-100 shadow-md'
                    )}
                  >
                    {node.value}
                  </div>

                  {/* tail label */}
                  <div className="h-5 mt-0.5">
                    {isTail && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        tail
                      </span>
                    )}
                  </div>
                </div>

                {!isLast && (
                  <DoubleArrow
                    color={
                      isHighlighted && activeNode.includes(nodes[i + 1].id)
                        ? lineColor
                        : '#475569'
                    }
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}