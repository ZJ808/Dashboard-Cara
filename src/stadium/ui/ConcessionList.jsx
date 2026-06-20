import { CATEGORIES, priceRange } from '../data/concessions';
import { formatDistance, formatDuration } from '../lib/geo';

const LEVEL_LABELS = {
  field: 'Field',
  main: 'Main',
  terrace: 'Terrace',
  bleacher: 'Bleachers',
};

export default function ConcessionList({ stands, selectedId, routes, onSelect }) {
  if (stands.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-slate-500">
        No stands match your filters.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {stands.map((stand) => {
        const cat = CATEGORIES[stand.category];
        const { min, max } = priceRange(stand);
        const route = routes?.[stand.id];
        const selected = stand.id === selectedId;
        return (
          <li key={stand.id}>
            <button
              onClick={() => onSelect(stand.id)}
              className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                selected
                  ? 'border-cyan-500 bg-slate-800'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-semibold text-slate-100">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {stand.name}
                </span>
                <span className="shrink-0 text-xs text-slate-400">
                  {LEVEL_LABELS[stand.level]}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400">
                  {cat.icon} ${min.toFixed(0)}–${max.toFixed(0)}
                </span>
                {route && (
                  <span className="font-medium text-cyan-400">
                    🚶 {formatDuration(route.seconds)} · {formatDistance(route.meters)}
                  </span>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
