import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { TreeState, TreeNode, Highlight } from '../../lib/types';

const NODE_R = 22;
const H_SPACING = 56;
const V_SPACING = 78;

function computePositions(nodes: TreeNode[], rootId: string | null) {
  const map = new Map<string, TreeNode>();
  for (const n of nodes) map.set(n.id, n);
  const result: { node: TreeNode; x: number; y: number }[] = [];
  let counter = 0;

  function walk(id: string | null, depth: number) {
    if (!id) return;
    const node = map.get(id);
    if (!node) return;
    walk(node.leftId, depth + 1);
    result.push({ node, x: counter++, y: depth });
    walk(node.rightId, depth + 1);
  }
  walk(rootId, 0);
  return result;
}

export function TreeVisualizer({ state, highlight }: { state: TreeState; highlight?: Highlight }) {
  const positioned = computePositions(state.nodes, state.rootId);

  if (positioned.length === 0) {
    return (
      <div className="text-center text-slate-500 text-sm py-10">
        <div className="text-4xl mb-2">🌱</div>
        Дерево пусто
      </div>
    );
  }

  const maxX = Math.max(...positioned.map((p) => p.x));
  const maxY = Math.max(...positioned.map((p) => p.y));
  const width = (maxX + 1) * H_SPACING + NODE_R * 2;
  const height = (maxY + 1) * V_SPACING + NODE_R * 2;

  const pos = new Map(positioned.map((p) => [p.node.id, p]));
  const activeNodes = new Set(highlight?.nodeIds || []);
  const hc = highlight?.color || 'info';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-600 border-2 border-rose-400" />
          красный узел
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-900 border-2 border-slate-600" />
          чёрный узел
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
          узлов: {state.nodes.length}
        </span>
      </div>

      <div className="overflow-x-auto max-w-full">
        <svg width={width} height={height} className="min-w-max">
          {/* рёбра */}
          {positioned.map(({ node, x, y }) => {
            const cx = x * H_SPACING + NODE_R;
            const cy = y * V_SPACING + NODE_R;
            const lines = [];
            for (const [childId, side] of [[node.leftId, 'L'], [node.rightId, 'R']] as const) {
              if (!childId) continue;
              const child = pos.get(childId);
              if (!child) continue;
              const isActiveEdge =
                activeNodes.has(node.id) && activeNodes.has(childId);
              lines.push(
                <line
                  key={`${node.id}-${side}`}
                  x1={cx}
                  y1={cy}
                  x2={child.x * H_SPACING + NODE_R}
                  y2={child.y * V_SPACING + NODE_R}
                  stroke={isActiveEdge ? '#34d399' : '#334155'}
                  strokeWidth={isActiveEdge ? 3 : 2}
                  className="transition-all"
                />
              );
            }
            return <g key={`e-${node.id}`}>{lines}</g>;
          })}

          {/* узлы */}
          {positioned.map(({ node, x, y }) => {
            const cx = x * H_SPACING + NODE_R;
            const cy = y * V_SPACING + NODE_R;
            const isActive = activeNodes.has(node.id);
            const isRed = node.color === 'red';
            const strokeColor = isActive
              ? hc === 'success' ? '#34d399' : hc === 'error' ? '#fb7185' : hc === 'warning' ? '#fbbf24' : '#38bdf8'
              : isRed ? '#f87171' : '#64748b';

            return (
              <motion.g
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={NODE_R}
                  fill={isRed ? '#b91c1c' : '#0f172a'}
                  stroke={strokeColor}
                  strokeWidth={isActive ? 3 : 2}
                />
                <text
                  x={cx}
                  y={cy + 5}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={13}
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight={700}
                >
                  {node.key}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}