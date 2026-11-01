import clsx from 'clsx';

const navBtn =
  'w-9 h-9 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 text-sm disabled:opacity-30 disabled:hover:bg-slate-900 transition';

export function StepControls({
  current,
  total,
  playing,
  onPrev,
  onNext,
  onFirst,
  onLast,
  onTogglePlay,
  onSeek,
}: {
  current: number;
  total: number;
  playing: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
  onTogglePlay: () => void;
  onSeek: (i: number) => void;
}) {
  return (
    <div className="rounded-xl bg-slate-900/60 backdrop-blur border border-slate-800 p-3">
      <div className="flex items-center gap-2">
        <button onClick={onFirst} className={navBtn} disabled={current === 0} title="В начало">
          ⏮
        </button>
        <button onClick={onPrev} className={navBtn} disabled={current === 0} title="Назад">
          ⏪
        </button>

        {/* Большая кнопка Play */}
        <button
          onClick={onTogglePlay}
          className={clsx(
            'relative w-12 h-12 rounded-full flex items-center justify-center text-slate-950 font-bold text-lg transition shadow-lg',
            playing
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/40'
              : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/40 hover:scale-105'
          )}
          title={playing ? 'Пауза' : 'Воспроизвести'}
        >
          {playing && (
            <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping" />
          )}
          <span className="relative">{playing ? '⏸' : '▶'}</span>
        </button>

        <button onClick={onNext} className={navBtn} disabled={current === total - 1} title="Вперёд">
          ⏩
        </button>
        <button onClick={onLast} className={navBtn} disabled={current === total - 1} title="В конец">
          ⏭
        </button>

        <div className="ml-auto text-xs text-slate-400 whitespace-nowrap font-mono">
          {current + 1} / {total}
        </div>
      </div>

      {/* Таймлайн */}
      <div className="mt-3 flex items-center gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onSeek(i)}
            className={clsx(
              'flex-1 h-1.5 rounded-full transition-all duration-200',
              i < current
                ? 'bg-emerald-500/70'
                : i === current
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                : 'bg-slate-800 hover:bg-slate-700'
            )}
            title={`Шаг ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}