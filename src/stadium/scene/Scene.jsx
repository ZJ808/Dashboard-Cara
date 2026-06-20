import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Html } from '@react-three/drei';
import StadiumModel from './StadiumModel';
import { ConcessionMarker, OriginMarker, RoutePath } from './Markers';
import { CONCESSIONS } from '../data/concessions';
import { makeIndoorPathPoints } from '../lib/geo';

function Loader() {
  return (
    <Html center>
      <div className="rounded bg-slate-900/90 px-4 py-2 text-sm text-white">
        Loading stadium…
      </div>
    </Html>
  );
}

export default function Scene({
  visibleStands,
  selectedId,
  origin, // { angle, level, label } | null
  routeDest, // stand object | null
  onSelect,
  onDeselect,
}) {
  const visibleIds = useMemo(() => new Set(visibleStands.map((s) => s.id)), [visibleStands]);
  const filtering = visibleStands.length !== CONCESSIONS.length;

  const routePoints = useMemo(() => {
    if (!origin || !routeDest) return null;
    return makeIndoorPathPoints(origin, routeDest);
  }, [origin, routeDest]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 130, 200], fov: 45, near: 1, far: 2000 }}
      onPointerMissed={onDeselect}
    >
      <color attach="background" args={['#0a1020']} />
      <Sky distance={4500} sunPosition={[100, 80, 60]} turbidity={6} rayleigh={1.5} />
      <fog attach="fog" args={['#0a1020', 380, 900]} />

      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#cfe0ff', '#1b2233', 0.6]} />
      <directionalLight
        position={[120, 180, 80]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-220}
        shadow-camera-right={220}
        shadow-camera-top={220}
        shadow-camera-bottom={-220}
      />

      <Suspense fallback={<Loader />}>
        <StadiumModel />

        {CONCESSIONS.map((stand) => (
          <ConcessionMarker
            key={stand.id}
            stand={stand}
            selected={stand.id === selectedId}
            dimmed={filtering && !visibleIds.has(stand.id)}
            onSelect={onSelect}
          />
        ))}

        {origin && <OriginMarker origin={origin} />}
        {routePoints && <RoutePath points={routePoints} />}
      </Suspense>

      <OrbitControls
        target={[0, 12, 0]}
        enablePan
        enableDamping
        dampingFactor={0.08}
        minDistance={70}
        maxDistance={520}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
