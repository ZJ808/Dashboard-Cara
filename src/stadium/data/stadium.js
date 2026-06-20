// Yankee Stadium metadata.
//
// Real-world coordinates for the venue at 1 E 161 St, Bronx, NY 10451. Gate
// coordinates are approximate and used to estimate walking distance from a
// visitor's GPS location to the nearest entrance.

export const STADIUM = {
  name: 'Yankee Stadium',
  address: '1 E 161 St, The Bronx, NY 10451',
  center: { lat: 40.8296, lng: -73.9262 },
};

// Each gate has a real-ish lat/lng plus its position on the polar model
// (angle°, level: 'field') so an outdoor route can continue indoors.
export const GATES = [
  { id: 'gate-2', name: 'Gate 2', subtitle: 'Behind home plate', lat: 40.82812, lng: -73.92655, angle: 0 },
  { id: 'gate-4', name: 'Gate 4', subtitle: 'Third base / E 161 St', lat: 40.82905, lng: -73.92760, angle: 290 },
  { id: 'gate-6', name: 'Gate 6', subtitle: 'Center field / River Ave', lat: 40.83045, lng: -73.92580, angle: 180 },
  { id: 'gate-8', name: 'Gate 8', subtitle: 'First base / E 157 St', lat: 40.82875, lng: -73.92505, angle: 70 },
];

// Disclaimer surfaced in the UI so the data isn't mistaken for live/official.
export const DATA_NOTE =
  'Stand names, sections and menu items are based on the Yankees / Legends ' +
  '2024–2025 dining announcements; prices are estimates (the Yankees do not ' +
  'publish concession prices). The 3D model is a stylized rendering and ' +
  'distances/walking times are approximate.';
