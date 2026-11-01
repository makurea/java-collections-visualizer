import type { CollectionDefinition } from '../lib/types';
import { CodeExample } from './CodeExample';

function Card({
  icon,
  title,
  accent,
  children,
}: {
  icon: string;
  title: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-900/40 backdrop-blur border border-slate-800 p-5">
      <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-slate-100">
        <span className="text-xl">{icon}</span>
        <span className={accent}>{title}</span>
      </h2>
      {children}
    </div>
  );
}

function BulletList({
  items,
  marker,
  markerClass,
}: {
  items: string[];
  marker: string;
  markerClass: string;
}) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-slate-300 leading-relaxed">
          <span className={`${markerClass} shrink-0 font-mono text-xs mt-0.5`}>
            {marker}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function TheorySection({ collection }: { collection: CollectionDefinition }) {
  const { theory } = collection;

  return (
    <div className="space-y-4">
      <Card icon="💡" title="Что это?" accent="text-emerald-400">
        <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
          {theory.what}
        </p>
      </Card>

      <Card icon="⚙️" title="Как устроено внутри" accent="text-sky-400">
        <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
          {theory.internals}
        </p>
      </Card>

      <Card icon="🎯" title="Когда использовать" accent="text-amber-400">
        <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
          {theory.whenToUse}
        </p>
      </Card>

      {(theory.pros?.length || theory.cons?.length) && (
        <div className="grid md:grid-cols-2 gap-4">
          {theory.pros?.length ? (
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/30 p-5">
              <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-emerald-400">
                <span className="text-xl">✅</span> Плюсы
              </h2>
              <BulletList
                items={theory.pros}
                marker="+"
                markerClass="text-emerald-400 font-bold"
              />
            </div>
          ) : null}
          {theory.cons?.length ? (
            <div className="rounded-xl bg-rose-500/5 border border-rose-500/30 p-5">
              <h2 className="text-base font-bold mb-3 flex items-center gap-2 text-rose-400">
                <span className="text-xl">⚠️</span> Минусы
              </h2>
              <BulletList
                items={theory.cons}
                marker="−"
                markerClass="text-rose-400 font-bold"
              />
            </div>
          ) : null}
        </div>
      )}

      {theory.commonMistakes?.length ? (
        <Card icon="🐛" title="Частые ошибки" accent="text-orange-400">
          <BulletList
            items={theory.commonMistakes}
            marker="✗"
            markerClass="text-orange-400"
          />
        </Card>
      ) : null}

      {theory.comparison?.length ? (
        <Card icon="🔍" title="Сравнение с аналогами" accent="text-violet-400">
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {theory.comparison.map((c, i) => (
                  <tr
                    key={i}
                    className={i > 0 ? 'border-t border-slate-800/60' : ''}
                  >
                    <td className="px-3 py-2 font-mono text-xs text-emerald-400 whitespace-nowrap align-top">
                      {c.name}
                    </td>
                    <td className="px-3 py-2 text-slate-300 text-sm leading-relaxed">
                      {c.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      <Card icon="📊" title="Сложность операций" accent="text-amber-400">
        <div className="rounded-lg border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/60">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Операция
                </th>
                <th className="text-right px-3 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Big-O
                </th>
              </tr>
            </thead>
            <tbody>
              {theory.complexity.map((c, i) => (
                <tr key={i} className="border-t border-slate-800/60">
                  <td className="px-3 py-2 font-mono text-xs text-slate-300">
                    {c.op}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-xs font-mono font-medium">
                      {c.bigO}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card icon="💻" title="Пример на Java" accent="text-sky-400">
        <CodeExample code={theory.codeSample} />
      </Card>

      {theory.keyTakeaways?.length ? (
        <Card icon="🎓" title="Что запомнить" accent="text-emerald-400">
          <BulletList
            items={theory.keyTakeaways}
            marker="★"
            markerClass="text-emerald-400"
          />
        </Card>
      ) : null}
    </div>
  );
}