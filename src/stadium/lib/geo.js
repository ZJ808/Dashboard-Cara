// Geometry & routing helpers for the Yankee Stadium explorer.
//
// The stadium is modeled as a circular bowl. Positions are expressed in two
// ways:
//   1. A logical polar model (angle in degrees + level index) used to estimate
//      real walking distances/times in meters.
//   2. A 3D scene position (x, y, z in scene units ≈ meters) used for rendering
//      and for drawing the on-screen walking path.
//
// All distances returned by the route helpers are estimates intended to give a
// realistic sense of scale — they are not survey-accurate.

export const DEG = Math.PI / 180;

// Average walking speeds (meters / second).
export const SPEED_OUTDOOR = 1.4; // open sidewalk
export const SPEED_INDOOR = 1.15; // crowded concourse

// Concourse ring radius (scene units ≈ meters) for each seating level.
export const LEVEL_RADIUS = {
  field: 94,
  main: 106,
  terrace: 118,
  bleacher: 100,
};

// Height of each concourse above the field (scene units ≈ meters).
export const LEVEL_HEIGHT = {
  field: 4,
  main: 15,
  terrace: 27,
  bleacher: 8,
};

// Ordered for level-change distance penalties.
export const LEVEL_ORDER = ['field', 'main', 'terrace', 'bleacher'];

export function levelIndex(level) {
  const i = LEVEL_ORDER.indexOf(level);
  return i === -1 ? 0 : i;
}

// Convert a polar (angle°, radius, height) location to a 3D scene vector.
// Home plate sits at angle 0 (front of the model); angle increases clockwise.
export function polarToVec(angleDeg, radius, height = 0) {
  const a = angleDeg * DEG;
  return [radius * Math.sin(a), height, -radius * Math.cos(a)];
}

// Map a real Yankee Stadium section number to an angle (degrees clockwise from
// home plate) on the polar model. Sections increase clockwise; each level's
// "behind home plate" anchor differs (≈120 field, ≈214 main, ≈320 terrace),
// and adjacent sections are ~4.5° apart. Approximate but consistent.
const LEVEL_HOME_SECTION = { field: 120, main: 214, terrace: 320, bleacher: 220 };
const DEG_PER_SECTION = 4.5;

export function sectionAngle(level, num) {
  const home = LEVEL_HOME_SECTION[level] ?? 120;
  return (((num - home) * DEG_PER_SECTION) % 360 + 360) % 360;
}

// 3D scene position of a stand on its concourse ring, pushed slightly outward
// so the pin reads clearly against the seating bowl.
export function standPosition(stand) {
  return polarToVec(
    stand.angle,
    (LEVEL_RADIUS[stand.level] ?? 106) + 3,
    (LEVEL_HEIGHT[stand.level] ?? 15) + 2
  );
}

// Smallest absolute angular difference in degrees (0–180).
export function angleDiff(a, b) {
  const d = Math.abs(((a - b) % 360 + 360) % 360);
  return d > 180 ? 360 - d : d;
}

// Haversine great-circle distance in meters between two {lat, lng} points.
export function haversine(p1, p2) {
  const R = 6371000;
  const dLat = (p2.lat - p1.lat) * DEG;
  const dLng = (p2.lng - p1.lng) * DEG;
  const lat1 = p1.lat * DEG;
  const lat2 = p2.lat * DEG;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Estimate an indoor walking route from a seating origin to a concession stand.
// `origin` and `dest` are { angle, level } objects.
// Returns { meters, seconds, legs } where legs describe the route narrative.
export function indoorRoute(origin, dest) {
  const seatToConcourse = 22; // up the aisle + through the vomitory
  const destRadius = LEVEL_RADIUS[dest.level] ?? LEVEL_RADIUS.main;
  const arc = (angleDiff(origin.angle, dest.angle) * DEG) * destRadius;
  const levelGap = Math.abs(levelIndex(origin.level) - levelIndex(dest.level));
  const levelChange = levelGap * 55; // ramp / escalator run per level

  const meters = seatToConcourse + arc + levelChange;
  const seconds = meters / SPEED_INDOOR + levelGap * 25; // wait/transit per level

  const legs = [
    { label: 'Exit to concourse', meters: Math.round(seatToConcourse) },
  ];
  if (levelGap > 0) {
    legs.push({
      label: `Change ${levelGap} level${levelGap > 1 ? 's' : ''} (ramp/escalator)`,
      meters: Math.round(levelChange),
    });
  }
  legs.push({ label: 'Walk the concourse', meters: Math.round(arc) });

  return { meters: Math.round(meters), seconds: Math.round(seconds), legs };
}

// Estimate an outdoor route from the user's GPS position to the nearest gate.
// Returns { meters, seconds, gate } or null if no gates provided.
export function outdoorRoute(userLatLng, gates) {
  if (!gates?.length) return null;
  let best = null;
  for (const gate of gates) {
    const straight = haversine(userLatLng, gate);
    const meters = straight * 1.3; // street circuity factor
    if (!best || meters < best.meters) {
      best = { meters: Math.round(meters), gate, straight: Math.round(straight) };
    }
  }
  best.seconds = Math.round(best.meters / SPEED_OUTDOOR);
  return best;
}

// Build a 3D polyline (array of [x,y,z]) tracing the indoor walking route from
// a seating origin to a stand, for rendering in the scene. Mirrors the legs in
// indoorRoute(): up to the concourse, change levels, arc around the ring.
export function makeIndoorPathPoints(origin, dest) {
  const lift = 1.2; // float the line just above surfaces
  const oR = LEVEL_RADIUS[origin.level] ?? LEVEL_RADIUS.main;
  const oH = (LEVEL_HEIGHT[origin.level] ?? 15) + lift;
  const dR = LEVEL_RADIUS[dest.level] ?? LEVEL_RADIUS.main;
  const dH = (LEVEL_HEIGHT[dest.level] ?? 15) + lift;

  const pts = [];
  pts.push(polarToVec(origin.angle, oR - 7, oH + 3)); // at the seat
  pts.push(polarToVec(origin.angle, oR, oH)); // onto the concourse
  if (origin.level !== dest.level) {
    pts.push(polarToVec(origin.angle, dR, dH)); // ramp/escalator transfer
  }
  // Arc along the destination ring, shortest direction.
  const delta = (((dest.angle - origin.angle) % 360) + 540) % 360 - 180;
  const steps = 14;
  for (let i = 1; i <= steps; i++) {
    pts.push(polarToVec(origin.angle + delta * (i / steps), dR, dH));
  }
  pts.push(polarToVec(dest.angle, dR + 4, dH + 2)); // at the stand
  return pts;
}

export function formatDistance(m) {
  if (m == null) return '—';
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}

export function formatDuration(s) {
  if (s == null) return '—';
  if (s < 60) return `${Math.round(s)} sec`;
  const min = Math.round(s / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return r ? `${h} hr ${r} min` : `${h} hr`;
}
