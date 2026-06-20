import { useMemo } from 'react';
import * as THREE from 'three';
import { polarToVec } from '../lib/geo';

// A stylized, recognizable 3D Yankee Stadium: a tiered navy bowl around a green
// field, capped with the iconic white frieze and ringed by light towers. Built
// procedurally from primitives — not a survey-accurate model.

const NAVY = '#16243f';
const NAVY_LIGHT = '#22335a';
const SEAT_BLUE = '#1c2c4c';
const WHITE = '#f4f6fb';
const GRASS = '#2f6d3a';
const GRASS_DARK = '#2a6033';
const DIRT = '#b07a4a';

// One seating tier rendered as an open, sloped frustum (cone) shell.
function Tier({ bottomRadius, topRadius, height, y, color }) {
  return (
    <mesh position={[0, y + height / 2, 0]} receiveShadow castShadow>
      <cylinderGeometry args={[topRadius, bottomRadius, height, 96, 1, true]} />
      <meshStandardMaterial
        color={color}
        side={THREE.DoubleSide}
        roughness={0.9}
        metalness={0.05}
      />
    </mesh>
  );
}

// Flat walkable concourse ring between/behind tiers.
function Concourse({ innerRadius, outerRadius, y }) {
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <ringGeometry args={[innerRadius, outerRadius, 96]} />
      <meshStandardMaterial color={NAVY_LIGHT} roughness={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function LightTower({ angle }) {
  const base = polarToVec(angle, 134, 0);
  const topY = 56;
  return (
    <group position={base}>
      <mesh position={[0, topY / 2, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.9, topY, 8]} />
        <meshStandardMaterial color="#3a4050" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, topY, 0]}>
        <boxGeometry args={[10, 4, 1.2]} />
        <meshStandardMaterial color="#cfd6e4" emissive="#fff7d6" emissiveIntensity={1.4} />
      </mesh>
      <pointLight position={[0, topY, 6]} intensity={120} distance={260} decay={1.6} color="#fff4d6" />
    </group>
  );
}

export default function StadiumModel() {
  // Foul lines from home plate.
  const foulLines = useMemo(() => {
    const home = polarToVec(0, 8, 0.3);
    const right = polarToVec(43, 58, 0.3);
    const left = polarToVec(-43, 58, 0.3);
    return [
      [new THREE.Vector3(...home), new THREE.Vector3(...right)],
      [new THREE.Vector3(...home), new THREE.Vector3(...left)],
    ];
  }, []);

  return (
    <group>
      {/* Ground apron */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <circleGeometry args={[200, 64]} />
        <meshStandardMaterial color="#1b2233" roughness={1} />
      </mesh>

      {/* Field — grass disc with mowing-stripe accent + infield dirt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[60, 64]} />
        <meshStandardMaterial color={GRASS} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[20, 40, 64]} />
        <meshStandardMaterial color={GRASS_DARK} roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {/* Infield dirt around home plate */}
      <mesh position={polarToVec(0, 26, 0.05)} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[24, 48]} />
        <meshStandardMaterial color={DIRT} roughness={1} />
      </mesh>
      {/* Pitcher's mound + home plate */}
      <mesh position={polarToVec(0, 18, 0.1)}>
        <sphereGeometry args={[2.2, 16, 12]} />
        <meshStandardMaterial color={DIRT} roughness={1} />
      </mesh>

      {/* Foul lines */}
      {foulLines.map((pts, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={WHITE} />
        </line>
      ))}

      {/* Seating tiers */}
      <Tier bottomRadius={60} topRadius={92} height={13} y={0} color={SEAT_BLUE} />
      <Tier bottomRadius={94} topRadius={112} height={13} y={14} color={NAVY} />
      <Tier bottomRadius={114} topRadius={128} height={13} y={27} color={SEAT_BLUE} />

      {/* Concourses (walkable rings) */}
      <Concourse innerRadius={92} outerRadius={96} y={4} />
      <Concourse innerRadius={104} outerRadius={108} y={15} />
      <Concourse innerRadius={116} outerRadius={120} y={27} />

      {/* Iconic white frieze around the top rim */}
      <mesh position={[0, 41, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[128, 1.8, 8, 96]} />
        <meshStandardMaterial color={WHITE} roughness={0.6} />
      </mesh>
      {/* Frieze scallops suggested by a thin inner ring */}
      <mesh position={[0, 40, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[126, 130, 96]} />
        <meshStandardMaterial color={WHITE} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Light towers */}
      {[55, 125, 235, 305].map((a) => (
        <LightTower key={a} angle={a} />
      ))}
    </group>
  );
}
