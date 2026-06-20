import { CATEGORIES } from '../data/concessions';
import { formatDistance, formatDuration } from '../lib/geo';

const LEVEL_LABELS = {
  field: 'Field Level',
  main: 'Main Level',
  terrace: 'Terrace / Grandstand',
  bleacher: 'Bleachers',
};

export default function DetailPanel({ stand, route, onClose }) {
  if (!stand) return null;
  const cat = CATEGORIES[stand.category];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className="relative px-5 pb-4 pt-5"
        style={{ background: `linear-gradient(135deg, ${cat.color}33, transparent)` }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full bg-slate-800/80 px-2 py-0.5 text-slate-300 hover:bg-slate-700"
        >
          ✕
        </button>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
          style={{ backgroundColor: cat.color }}
        >
          {cat.icon} {cat.label}
        </span>
        <h2 className="mt-2 text-xl font-bold text-white">{stand.name}</h2>
        <p className="mt-1 text-sm text-slate-300">{stand.blurb}</p>
        <p className="mt-1 text-xs text-slate-400">📍 {LEVEL_LABELS[stand.level]}</p>
      </div>

      {/* Route */}
      <div className="border-y border-slate-800 bg-slate-900/60 px-5 py-3">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Walking route
        </h3>
        {route ? (
          <div>
            <div className="flex items-baseline gap-4">
              <div>
                <div className="text-2xl font-bold text-cyan-400">
                  {formatDuration(route.seconds)}
                </div>
                <div className="text-xs text-slate-400">{formatDistance(route.meters)}</div>
              </div>
              <div className="flex-1 text-xs text-slate-400">from {route.fromLabel}</div>
            </div>
            <ol className="mt-3 space-y-1.5">
              {route.legs.map((leg, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-cyan-400">
                    {i + 1}
                  </span>
                  <span className="flex-1">{leg.label}</span>
                  <span className="text-xs text-slate-500">{formatDistance(leg.meters)}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Pick <span className="font-semibold text-slate-200">your seat</span> or{' '}
            <span className="font-semibold text-slate-200">your location</span> to see the
            walk here.
          </p>
        )}
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Menu & pricing
        </h3>
        <ul className="divide-y divide-slate-800">
          {stand.menu.map((item, i) => (
            <li key={i} className="flex items-start justify-between gap-3 py-2">
              <div>
                <div className="text-sm font-medium text-slate-100">{item.name}</div>
                {item.desc && <div className="text-xs text-slate-400">{item.desc}</div>}
              </div>
              <div className="shrink-0 font-semibold text-emerald-400">
                ${item.price.toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
