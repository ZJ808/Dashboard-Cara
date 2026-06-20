// Representative seating sections a visitor can choose as a starting point.
// `angle` is degrees clockwise from home plate (0); `level` keys into the
// geometry tables in lib/geo.js. This is a curated subset of the bowl, not the
// full section list, chosen to span every level and field position.

export const SECTIONS = [
  // ── Field Level (100s) ────────────────────────────────────────────
  { id: 'sec-015', name: 'Section 15', level: 'field', angle: 5, area: 'Home plate' },
  { id: 'sec-020', name: 'Section 20', level: 'field', angle: 45, area: 'Behind 1st base' },
  { id: 'sec-027', name: 'Section 27', level: 'field', angle: 80, area: 'Right field line' },
  { id: 'sec-110', name: 'Section 110', level: 'field', angle: 315, area: 'Behind 3rd base' },
  { id: 'sec-105', name: 'Section 105', level: 'field', angle: 285, area: 'Left field line' },

  // ── Main Level (200s) ─────────────────────────────────────────────
  { id: 'sec-214b', name: 'Section 214B', level: 'main', angle: 0, area: 'Home plate' },
  { id: 'sec-220', name: 'Section 220', level: 'main', angle: 55, area: '1st base side' },
  { id: 'sec-228', name: 'Section 228', level: 'main', angle: 110, area: 'Right field' },
  { id: 'sec-234', name: 'Section 234', level: 'main', angle: 300, area: '3rd base side' },

  // ── Terrace / Grandstand (300s) ───────────────────────────────────
  { id: 'sec-320', name: 'Section 320', level: 'terrace', angle: 30, area: '1st base side' },
  { id: 'sec-314', name: 'Section 314', level: 'terrace', angle: 0, area: 'Home plate' },
  { id: 'sec-409', name: 'Section 409', level: 'terrace', angle: 320, area: '3rd base side' },

  // ── Bleachers ─────────────────────────────────────────────────────
  { id: 'sec-201bl', name: 'Bleachers 201', level: 'bleacher', angle: 150, area: 'Right-center field' },
  { id: 'sec-239bl', name: 'Bleachers 239', level: 'bleacher', angle: 210, area: 'Left-center field' },
];
