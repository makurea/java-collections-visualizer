import { useState } from 'react';
import { collections } from '../content';
import { CollectionCard } from '../components/CollectionCard';

const categories = [
  { key: 'list', title: 'Списки', emoji: '📋' },
  { key: 'set', title: 'Множества', emoji: '🎯' },
  { key: 'map', title: 'Мапы', emoji: '🗺️' },
  { key: 'queue', title: 'Очереди', emoji: '📬' },
];

export function HomePage() {
  const [query, setQuery] = useState('');
  const filtered = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.shortDescription.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      {/* HERO */}
      <section className="relative text-center mb-14 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Интерактивный учебник
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight leading-tight">
          <span className="bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Визуализатор
          </span>
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Java Collections
          </span>
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Смотри, как работают коллекции изнутри — пошагово, с анимацией и
          пояснениями на русском
        </p>

        {/* Поиск */}
        <div className="max-w-md mx-auto relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
            🔍
          </div>
          <input
            type="text"
            placeholder="Поиск коллекции..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/70 backdrop-blur border border-slate-800 hover:border-slate-700 focus:border-emerald-500 transition outline-none text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </section>

      {/* Сетка коллекций */}
      {categories.map((cat) => {
        const items = filtered.filter((c) => c.category === cat.key);
        if (items.length === 0) return null;
        return (
          <section key={cat.key} className="mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>{cat.emoji}</span>
              <span>{cat.title}</span>
              <span className="text-sm font-normal text-slate-500">
                · {items.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((c) => (
                <CollectionCard key={c.slug} collection={c} />
              ))}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🤔</div>
          <p className="text-slate-500">
            Ничего не найдено по запросу «{query}»
          </p>
        </div>
      )}
    </div>
  );
}