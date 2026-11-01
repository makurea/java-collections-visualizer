import { Link } from 'react-router-dom';
import type { CollectionDefinition } from '../lib/types';

export function CollectionCard({ collection }: { collection: CollectionDefinition }) {
  return (
    <Link
      to={`/collection/${collection.slug}`}
      className="block p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 transition group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{collection.icon}</div>
        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">
          {collection.javaInterface}
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-400">
        {collection.name}
      </h3>
      <p className="text-sm text-slate-400 mb-3">{collection.shortDescription}</p>
      <div className="text-emerald-400 text-sm">Изучить →</div>
    </Link>
  );
}