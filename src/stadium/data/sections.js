// Selectable seating sections used as a walking-route starting point.
//
// These are real Yankee Stadium sections; angles are derived from the 100/200/
// 300-level numbering via sectionAngle() (sections increase clockwise from home
// plate). A curated subset spanning every level and field position — not the
// full section list.

import { sectionAngle } from '../lib/geo';

function sec(num, level, area) {
  return {
    id: `sec-${level}-${num}`,
    name: `Section ${num}`,
    num,
    level,
    area,
    angle: sectionAngle(level, num),
  };
}

export const SECTIONS = [
  // ── Field Level (100s) ────────────────────────────────────────────
  sec(120, 'field', 'Behind home plate'),
  sec(124, 'field', '1st base side'),
  sec(132, 'field', 'Right field corner'),
  sec(112, 'field', '3rd base side'),
  sec(105, 'field', 'Left field corner'),

  // ── Main Level (200s) ─────────────────────────────────────────────
  sec(214, 'main', 'Behind home plate'),
  sec(220, 'main', '1st base side'),
  sec(228, 'main', 'Right field'),
  sec(209, 'main', '3rd base side'),

  // ── Terrace / Grandstand (300s) ───────────────────────────────────
  sec(320, 'terrace', 'Behind home plate'),
  sec(326, 'terrace', '1st base side'),
  sec(309, 'terrace', '3rd base side'),

  // ── Bleachers (outfield) ──────────────────────────────────────────
  { id: 'sec-bleacher-rf', name: 'RF Bleachers', num: 203, level: 'bleacher', area: 'Right-center field', angle: 150 },
  { id: 'sec-bleacher-lf', name: 'LF Bleachers', num: 237, level: 'bleacher', area: 'Left-center field', angle: 215 },
];
