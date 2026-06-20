import { CATEGORIES } from '../data/concessions';
import { SECTIONS } from '../data/sections';

const LEVEL_LABELS = {
  field: 'Field Level',
  main: 'Main Level',
  terrace: 'Terrace / Grandstand',
  bleacher: 'Bleachers',
};

export default function ControlPanel({
  originMode,
  onOriginMode,
  sectionId,
  onSectionId,
  gps,
  onUseLocation,
  search,
  onSearch,
  activeCategories,
  onToggleCategory,
}) {
  return (
    <div className="space-y-4">
      {/* ── Starting point ─────────────────────────────────────── */}
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Start from
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOriginMode('section')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              originMode === 'section'
                ? 'bg-cyan-500 text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🪑 My seat
          </button>
          <button
            onClick={onUseLocation}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              originMode === 'gps'
                ? 'bg-cyan-500 text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📡 My location
          </button>
        </div>

        {originMode === 'section' && (
          <select
            value={sectionId ?? ''}
            onChange={(e) => onSectionId(e.target.value || null)}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
          >
            <option value="">Choose a section…</option>
            {['field', 'main', 'terrace', 'bleacher'].map((lvl) => (
              <optgroup key={lvl} label={LEVEL_LABELS[lvl]}>
                {SECTIONS.filter((s) => s.level === lvl).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.area}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        )}

        {originMode === 'gps' && (
          <p className="mt-2 text-xs text-slate-400">
            {gps.status === 'loading' && '⏳ Getting your location…'}
            {gps.status === 'error' && (
              <span className="text-amber-400">⚠ {gps.error}</span>
            )}
            {gps.status === 'ready' && gps.coords && (
              <span className="text-emerald-400">
                ✓ Location found ({gps.coords.lat.toFixed(4)}, {gps.coords.lng.toFixed(4)})
              </span>
            )}
          </p>
        )}
      </div>

      {/* ── Search ─────────────────────────────────────────────── */}
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search food, drinks, items…"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500"
        />
      </div>

      {/* ── Category filters ───────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CATEGORIES).map(([key, cat]) => {
          const on = activeCategories.has(key);
          return (
            <button
              key={key}
              onClick={() => onToggleCategory(key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                on ? 'text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              style={on ? { backgroundColor: cat.color } : undefined}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
