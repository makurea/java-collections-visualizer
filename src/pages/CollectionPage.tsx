import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { collections } from '../content';
import type { Frame } from '../lib/types';
import { TheorySection } from '../components/TheorySection';
import { OperationList } from '../components/OperationList';
import { InputPanel } from '../components/InputPanel';
import { StepControls } from '../components/StepControls';
import { CodeExample } from '../components/CodeExample';
import { Visualizer } from '../components/visualizers';
import { categoryAccent, accentText } from '../lib/colors';

const descColor: Record<string, string> = {
  info: 'border-sky-500/50 bg-sky-500/5',
  success: 'border-emerald-500/50 bg-emerald-500/5',
  warning: 'border-amber-500/50 bg-amber-500/5',
  error: 'border-rose-500/50 bg-rose-500/5',
};

export function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const collection = collections.find((c) => c.slug === slug);
  const accent = collection ? categoryAccent(collection.category) : 'emerald';

  const [tab, setTab] = useState<'theory' | 'practice'>('practice');
  const [params, setParams] = useState<Record<string, any>>({});
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const opSlug = searchParams.get('op') || collection?.operations[0]?.slug;
  const operation = collection?.operations.find((o) => o.slug === opSlug);

  // 1) Сброс параметров при смене операции
  useEffect(() => {
    if (!operation) return;
    const defaults: Record<string, any> = {};
    for (const p of operation.params) defaults[p.name] = p.default;
    setParams(defaults);
    setCurrentStep(0);
    setPlaying(false);
  }, [operation?.slug]);

  // 2) АВТО-пересчёт кадров
  useEffect(() => {
    if (!operation || !collection) return;
    if (operation.params.length > 0 && Object.keys(params).length === 0) return;
    try {
      const baseState = operation.initialState
        ? operation.initialState()
        : collection.initialState();
      const newFrames = operation.buildFrames(baseState, params);
      console.log('BUILD FRAMES:', { opSlug: operation.slug, params, count: newFrames.length, first: newFrames[0] });
      setFrames(newFrames);
      setCurrentStep(0);
      setPlaying(false);
    } catch (err) {
      console.error('BUILD FRAMES ERROR:', err);
    }
  }, [params, operation?.slug, collection]);

  // 3) Автоплей
  useEffect(() => {
    if (!playing || frames.length === 0) return;
    if (currentStep >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setCurrentStep((s) => s + 1), 900);
    return () => clearTimeout(t);
  }, [playing, currentStep, frames.length]);

  // 4) Клавиатура
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (frames.length === 0 || tab !== 'practice') return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentStep((s) => Math.min(s + 1, frames.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentStep((s) => Math.max(s - 1, 0));
      } else if (e.key === ' ') {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [frames.length, tab]);

  if (!collection) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🚫</div>
        <p className="text-slate-400 mb-4">Коллекция не найдена (slug: {slug})</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-sm"
        >
          ← На главную
        </button>
      </div>
    );
  }

  const currentFrame = frames[currentStep];

  return (
    <div>
      {/* ============ ДЕБАГ-ПАНЕЛЬ (удалить после фикса) ============ */}
      <div className="mb-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/40 text-[11px] font-mono text-amber-200 leading-relaxed">
        <div className="font-bold mb-1">🐛 DEBUG</div>
        <div>slug: {slug} · collection: {collection.slug}</div>
        <div>operations: {collection.operations?.length ?? 'NONE'}</div>
        <div>opSlug: {opSlug ?? 'NONE'} · operation: {operation?.slug ?? 'NONE'}</div>
        <div>params: {JSON.stringify(params)}</div>
        <div>frames: {frames.length} · step: {currentStep} · tab: {tab}</div>
        <div>state.kind: {currentFrame?.state?.kind ?? 'NO FRAME'}</div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-slate-500 hover:text-slate-300 mb-3 transition"
        >
          ← Все коллекции
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-4xl shrink-0">
            {collection.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-3xl font-extrabold tracking-tight">
                {collection.name}
              </h1>
              <span
                className={clsx(
                  'text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800',
                  accentText[accent]
                )}
              >
                {collection.javaInterface}
              </span>
            </div>
            <p className="text-slate-400 text-sm">{collection.shortDescription}</p>
          </div>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-900/60 backdrop-blur border border-slate-800">
          <button
            onClick={() => setTab('practice')}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition',
              tab === 'practice'
                ? 'bg-slate-800 text-emerald-400 shadow'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            🎮 Практика
          </button>
          <button
            onClick={() => setTab('theory')}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition',
              tab === 'theory'
                ? 'bg-slate-800 text-emerald-400 shadow'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            📖 Теория
          </button>
        </div>
      </div>

      {tab === 'theory' ? (
        <TheorySection collection={collection} />
      ) : (
        <div className="grid md:grid-cols-[280px_1fr] gap-5 items-start">
          <aside className="md:sticky md:top-20 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto pr-1">
            <OperationList
              operations={collection.operations}
              current={operation?.slug}
              onSelect={(s) => setSearchParams({ op: s })}
            />
          </aside>

          <section className="min-w-0 space-y-4">
            {operation ? (
              <>
                <div className="rounded-xl bg-slate-900/60 backdrop-blur border border-slate-800 p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <code className="text-emerald-400 text-sm font-mono font-semibold break-all">
                      {operation.signature}
                    </code>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-mono">
                      {operation.complexity}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {operation.description}
                  </p>
                </div>

                <InputPanel params={operation.params} values={params} onChange={setParams} />

                {frames.length > 0 && currentFrame ? (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-slate-900/40 backdrop-blur border border-slate-800 p-4 min-h-[300px] overflow-auto">
                      <Visualizer
                        state={currentFrame.state}
                        highlight={currentFrame.highlight}
                      />
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className={clsx(
                          'rounded-xl border-l-4 p-4',
                          descColor[currentFrame.highlight?.color || 'info']
                        )}
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                          Шаг {currentStep + 1}
                        </div>
                        <p className="text-slate-200 text-sm leading-relaxed">
                          {currentFrame.description}
                        </p>

                        {currentFrame.pseudoCode && (
                          <pre className="mt-3 p-3 rounded-lg bg-slate-950/70 text-[11px] font-mono overflow-x-auto">
                            {currentFrame.pseudoCode.lines.map((line, i) => (
                              <div
                                key={i}
                                className={clsx(
                                  'whitespace-pre px-2 py-0.5 -mx-2 rounded transition-colors',
                                  i === currentFrame.pseudoCode!.activeLine
                                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                                    : 'text-slate-500'
                                )}
                              >
                                {line || ' '}
                              </div>
                            ))}
                          </pre>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    <StepControls
                      current={currentStep}
                      total={frames.length}
                      playing={playing}
                      onPrev={() => setCurrentStep((s) => Math.max(0, s - 1))}
                      onNext={() =>
                        setCurrentStep((s) => Math.min(frames.length - 1, s + 1))
                      }
                      onFirst={() => setCurrentStep(0)}
                      onLast={() => setCurrentStep(frames.length - 1)}
                      onTogglePlay={() => setPlaying((p) => !p)}
                      onSeek={setCurrentStep}
                    />
                  </div>
                ) : (
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-sm text-rose-300">
                    ⚠️ Кадры не сгенерированы (frames = {frames.length}). Смотрите консоль —
                    там должен быть <code>BUILD FRAMES</code> или <code>BUILD FRAMES ERROR</code>.
                  </div>
                )}

                <CodeExample code={operation.codeSample} />
              </>
            ) : (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-sm text-rose-300">
                ⚠️ operation не найден. opSlug = <code>{opSlug ?? 'null'}</code>,
                operations.length = <code>{collection.operations?.length ?? 0}</code>.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}