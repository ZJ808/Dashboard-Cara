# ⚾ Yankee Stadium · 3D Food & Drink Explorer

An interactive, Google-Earth-style 3D model of Yankee Stadium for exploring
every food and drink stand — with full menus, pricing, and the estimated
**distance and walking time** to each stand from either your **current GPS
location** or a **specific seating section**.

## Features

- **Manipulatable 3D stadium** — orbit, pan and zoom a stylized model of the
  bowl, field, concourses and the iconic white frieze (built with
  [Three.js](https://threejs.org/) via
  [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) and
  [drei](https://github.com/pmndrs/drei)).
- **Concession map** — each stand is a clickable 3D pin, color-coded by
  category (food / drinks / desserts / specialty).
- **Menus & pricing** — every stand opens a detail panel with its full menu and
  sample prices.
- **Walking routes** — choose *My seat* (pick a section) or *My location*
  (browser geolocation) and the app estimates the distance, walking time, and a
  step-by-step route to any stand. The route is drawn as a path on the 3D model
  and the stand list re-sorts nearest-first.
- **Search & filter** — find stands by name or menu item and filter by category.

## How routing is estimated

- **From a seat:** distance to the concourse, any level changes
  (ramp/escalator), and the arc walked around the concourse ring to the stand.
- **From your location:** great-circle (haversine) distance to the nearest gate
  with a street-circuity factor, then the indoor walk from that gate.

Walking times use ~1.4 m/s outdoors and ~1.15 m/s on crowded concourses.

> **Note:** Concession locations, menus and prices are *illustrative samples*
> for demonstration and may not match current in-stadium offerings. The 3D model
> is a recognizable stylization, not a survey-accurate reproduction. Distances
> and times are estimates.

## Tech stack

React 19 · Vite · Tailwind CSS v4 · Three.js / React Three Fiber / drei

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run preview  # preview the production build
npm run lint     # eslint
```

## Project structure

```
src/
  App.jsx                     # renders the explorer
  stadium/
    StadiumExplorer.jsx       # state, routing, layout
    scene/
      Scene.jsx               # R3F canvas, lights, controls
      StadiumModel.jsx        # procedural 3D stadium
      Markers.jsx             # concession pins, origin beacon, route path
    ui/
      ControlPanel.jsx        # origin selection, search, category filters
      ConcessionList.jsx      # stand list with walk times
      DetailPanel.jsx         # menu, pricing, route breakdown
    data/
      concessions.js          # stands + menus + pricing
      sections.js             # selectable seating sections
      stadium.js              # venue metadata + gates
    lib/
      geo.js                  # geometry, distance & route math
```
