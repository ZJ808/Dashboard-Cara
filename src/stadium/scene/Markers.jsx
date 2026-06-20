import { useState } from 'react';
import { Html, Line } from '@react-three/drei';
import { CATEGORIES } from '../data/concessions';
import { LEVEL_RADIUS, LEVEL_HEIGHT, polarToVec, standPosition } from '../lib/geo';

export function ConcessionMarker({ stand, selected, dimmed, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const pos = standPosition(stand);
  const color = CATEGORIES[stand.category].color;
  const active = selected || hovered;
  const scale = selected ? 1.5 : hovered ? 1.3 : 1;

  return (
    <group position={pos}>
      <group
        scale={scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(stand.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Pin head */}
        <mesh position={[0, 5, 0]} castShadow>
          <sphereGeometry args={[2.4, 20, 20]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={active ? 0.9 : 0.35}
            opacity={dimmed && !active ? 0.35 : 1}
            transparent={dimmed && !active}
            roughness={0.4}
          />
        </mesh>
        {/* Pin stem */}
        <mesh position={[0, 2, 0]}>
          <coneGeometry args={[1.1, 4.5, 16]} />
          <meshStandardMaterial color={color} opacity={dimmed && !active ? 0.35 : 1} transparent={dimmed && !active} />
        </mesh>
      </group>

      {(selected || hovered) && (
        <Html center distanceFactor={170} position={[0, 11, 0]} zIndexRange={[20, 0]}>
          <div className="pointer-events-none select-none whitespace-nowrap rounded-md bg-slate-900/95 px-2.5 py-1 text-[13px] font-semibold text-white shadow-lg ring-1 ring-white/15">
            <span className="mr-1">{CATEGORIES[stand.category].icon}</span>
            {stand.name}
          </div>
        </Html>
      )}
    </group>
  );
}

export function OriginMarker({ origin }) {
  // A glowing beacon at the chosen seating section / gate.
  const pos = polarToVec(origin.angle, (LEVEL_RADIUS[origin.level] ?? 106) - 4, (LEVEL_HEIGHT[origin.level] ?? 15) + 2);
  return (
    <group position={pos}>
      <mesh position={[0, 6, 0]}>
        <sphereGeometry args={[2.6, 20, 20]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 6, 12]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} />
      </mesh>
      <Html center distanceFactor={170} position={[0, 12, 0]} zIndexRange={[20, 0]}>
        <div className="pointer-events-none select-none whitespace-nowrap rounded-md bg-cyan-500 px-2.5 py-1 text-[13px] font-bold text-slate-900 shadow-lg">
          📍 {origin.label}
        </div>
      </Html>
    </group>
  );
}

export function RoutePath({ points }) {
  if (!points || points.length < 2) return null;
  return (
    <Line
      points={points}
      color="#22d3ee"
      lineWidth={4}
      dashed
      dashSize={3}
      gapSize={2}
      transparent
      opacity={0.95}
    />
  );
}
