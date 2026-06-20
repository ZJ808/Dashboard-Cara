import { useMemo, useState } from 'react';
import Scene from './scene/Scene';
import ControlPanel from './ui/ControlPanel';
import ConcessionList from './ui/ConcessionList';
import DetailPanel from './ui/DetailPanel';
import { CONCESSIONS, CATEGORIES } from './data/concessions';
import { SECTIONS } from './data/sections';
import { GATES, STADIUM, DATA_NOTE } from './data/stadium';
import { indoorRoute, outdoorRoute } from './lib/geo';

const ALL_CATEGORIES = new Set(Object.keys(CATEGORIES));

function matchesSearch(stand, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    stand.name.toLowerCase().includes(needle) ||
    stand.blurb.toLowerCase().includes(needle) ||
    stand.menu.some((m) => m.name.toLowerCase().includes(needle))
  );
}

export default function StadiumExplorer() {
  const [selectedId, setSelectedId] = useState(null);
  const [originMode, setOriginMode] = useState('none'); // 'none' | 'section' | 'gps'
  const [sectionId, setSectionId] = useState(null);
  const [gps, setGps] = useState({ status: 'idle', coords: null, error: null });
  const [search, setSearch] = useState('');
  const [activeCategories, setActiveCategories] = useState(new Set(ALL_CATEGORIES));

  const selectedSection = useMemo(
    () => SECTIONS.find((s) => s.id === sectionId) || null,
    [sectionId]
  );

  // Nearest gate to the visitor's GPS position (for the outdoor leg).
  const gpsGate = useMemo(
    () => (gps.coords ? outdoorRoute(gps.coords, GATES) : null),
    [gps.coords]
  );

  // The active starting point as a scene origin (beacon + path anchor).
  const sceneOrigin = useMemo(() => {
    if (originMode === 'section' && selectedSection) {
      return {
        angle: selectedSection.angle,
        level: selectedSection.level,
        label: selectedSection.name,
      };
    }
    if (originMode === 'gps' && gpsGate) {
      return { angle: gpsGate.gate.angle, level: 'field', label: gpsGate.gate.name };
    }
    return null;
  }, [originMode, selectedSection, gpsGate]);

  // Compute a route from the active origin to every stand.
  const routes = useMemo(() => {
    const out = {};
    for (const stand of CONCESSIONS) {
      if (originMode === 'section' && selectedSection) {
        const r = indoorRoute(selectedSection, stand);
        out[stand.id] = {
          ...r,
          fromLabel: `${selectedSection.name} (${selectedSection.area})`,
        };
      } else if (originMode === 'gps' && gpsGate) {
        const indoor = indoorRoute(
          { angle: gpsGate.gate.angle, level: 'field' },
          stand
        );
        out[stand.id] = {
          meters: gpsGate.meters + indoor.meters,
          seconds: gpsGate.seconds + indoor.seconds,
          fromLabel: 'your current location',
          legs: [
            { label: `Walk to ${gpsGate.gate.name}`, meters: gpsGate.meters },
            { label: 'Enter the stadium', meters: 0 },
            ...indoor.legs,
          ],
        };
      }
    }
    return out;
  }, [originMode, selectedSection, gpsGate]);

  const visibleStands = useMemo(() => {
    const list = CONCESSIONS.filter(
      (s) => activeCategories.has(s.category) && matchesSearch(s, search)
    );
    // When a route is active, sort nearest-first.
    if (Object.keys(routes).length) {
      list.sort((a, b) => (routes[a.id]?.seconds ?? 1e9) - (routes[b.id]?.seconds ?? 1e9));
    }
    return list;
  }, [activeCategories, search, routes]);

  const selectedStand = useMemo(
    () => CONCESSIONS.find((s) => s.id === selectedId) || null,
    [selectedId]
  );
  const selectedRoute = selectedStand ? routes[selectedStand.id] : null;

  function handleUseLocation() {
    setOriginMode('gps');
    if (!('geolocation' in navigator)) {
      setGps({ status: 'error', coords: null, error: 'Geolocation is not supported by this browser.' });
      return;
    }
    setGps({ status: 'loading', coords: null, error: null });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setGps({
          status: 'ready',
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
        }),
      (err) =>
        setGps({
          status: 'error',
          coords: null,
          error: err.code === 1 ? 'Location permission denied.' : 'Could not get your location.',
        }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  function toggleCategory(key) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      // Never allow an empty filter (would hide everything confusingly).
      return next.size === 0 ? new Set(ALL_CATEGORIES) : next;
    });
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0">
        <Scene
          visibleStands={visibleStands}
          selectedId={selectedId}
          origin={sceneOrigin}
          routeDest={sceneOrigin ? selectedStand : null}
          onSelect={setSelectedId}
          onDeselect={() => setSelectedId(null)}
        />
      </div>

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4">
        <div className="pointer-events-auto rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2 shadow-lg backdrop-blur">
          <h1 className="flex items-center gap-2 text-base font-extrabold tracking-tight">
            <span className="text-xl">⚾</span> {STADIUM.name}
            <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              Food &amp; Drink
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            3D concourse explorer · {CONCESSIONS.length} stands · drag to orbit, scroll to zoom
          </p>
        </div>
      </header>

      {/* ── Left control + list panel ────────────────────────────── */}
      <aside className="absolute left-4 top-24 bottom-16 z-20 flex w-[calc(100%-2rem)] max-w-80 flex-col gap-3 sm:w-80">
        <div className="pointer-events-auto rounded-xl border border-white/10 bg-slate-900/85 p-4 shadow-xl backdrop-blur">
          <ControlPanel
            originMode={originMode}
            onOriginMode={setOriginMode}
            sectionId={sectionId}
            onSectionId={setSectionId}
            gps={gps}
            onUseLocation={handleUseLocation}
            search={search}
            onSearch={setSearch}
            activeCategories={activeCategories}
            onToggleCategory={toggleCategory}
          />
        </div>
        <div className="pointer-events-auto min-h-0 flex-1 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/85 p-3 shadow-xl backdrop-blur">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {visibleStands.length} place{visibleStands.length === 1 ? '' : 's'}
            </span>
            {sceneOrigin && (
              <span className="text-[11px] text-cyan-400">sorted by walk time</span>
            )}
          </div>
          <ConcessionList
            stands={visibleStands}
            selectedId={selectedId}
            routes={routes}
            onSelect={setSelectedId}
          />
        </div>
      </aside>

      {/* ── Right detail drawer ──────────────────────────────────── */}
      {selectedStand && (
        <aside className="pointer-events-auto absolute right-4 top-24 bottom-16 z-30 w-[calc(100%-2rem)] max-w-80 overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur sm:w-80">
          <DetailPanel
            stand={selectedStand}
            route={selectedRoute}
            onClose={() => setSelectedId(null)}
          />
        </aside>
      )}

      {/* ── Footer note ──────────────────────────────────────────── */}
      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-2">
        <p className="mx-auto max-w-3xl text-center text-[10px] leading-tight text-slate-500">
          {DATA_NOTE}
        </p>
      </footer>
    </div>
  );
}
