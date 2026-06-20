// Food & drink stands across Yankee Stadium.
//
// Stand names, section numbers, levels and menu *items* are drawn from the
// Yankees / Legends Hospitality 2024–2025 dining announcements and stadium
// guides (see README sources). Yankee Stadium does not publish concession
// prices, so all prices below are realistic NYC-ballpark *estimates*.
//
// Positions use the polar model (angle° clockwise from home plate + concourse
// level). Field-level angles follow the real 100-level numbering: sections
// increase clockwise, ~103–105 at the left-field corner, ~120 behind home,
// ~134–136 at the right-field corner. See sectionAngle() in lib/geo.js.
//
// category: 'food' | 'drink' | 'dessert' | 'specialty'

import { sectionAngle } from '../lib/geo';

export const CATEGORIES = {
  food: { label: 'Food', color: '#ef4444', icon: '🍔' },
  drink: { label: 'Drinks', color: '#3b82f6', icon: '🍺' },
  dessert: { label: 'Desserts', color: '#ec4899', icon: '🍦' },
  specialty: { label: 'Specialty', color: '#f59e0b', icon: '⭐' },
};

export const CONCESSIONS = [
  // ── Field Level (100) ─────────────────────────────────────────────
  {
    id: 'change-up-kitchen',
    name: 'Change-Up Kitchen',
    section: '105',
    category: 'specialty',
    level: 'field',
    angle: sectionAngle('field', 105),
    blurb: 'Legends’ gourmet counter — porchetta, lobster roll, rotisserie chicken and more.',
    menu: [
      { name: 'Porchetta Sandwich', price: 16.0 },
      { name: 'Lobster Roll', price: 26.0 },
      { name: 'Rotisserie Chicken', price: 17.0 },
      { name: "Lobel's Prime Pastrami Sandwich", price: 16.0 },
      { name: 'Nuchas Empanadas (2)', price: 12.0 },
    ],
  },
  {
    id: 'city-winery',
    name: 'City Winery Wine Bar',
    section: '106',
    category: 'drink',
    level: 'field',
    angle: sectionAngle('field', 106),
    blurb: 'Wines by the glass from the NYC urban winery, plus a cheese plate.',
    menu: [
      { name: 'Red Wine (glass)', price: 15.0 },
      { name: 'White Wine (glass)', price: 15.0 },
      { name: 'Rosé (glass)', price: 15.0 },
      { name: 'Sparkling (glass)', price: 16.0 },
      { name: 'Cheese Plate', price: 18.0 },
    ],
  },
  {
    id: '99-burger',
    name: '99 Burger',
    section: '107 / 115',
    category: 'food',
    level: 'field',
    angle: sectionAngle('field', 115),
    blurb: 'The Stadium’s signature burger: two American Wagyu patties, secret sauce, brioche.',
    menu: [
      { name: '99 Burger', price: 18.0, desc: 'Two 4oz American Wagyu patties, American cheese, caramelized onions, secret sauce, pickles' },
      { name: 'Bacon Crunchburger', price: 17.0 },
      { name: 'Crinkle Fries', price: 8.0 },
    ],
  },
  {
    id: 'mighty-quinns',
    name: "Mighty Quinn's BBQ",
    section: '132',
    category: 'food',
    level: 'field',
    angle: sectionAngle('field', 132),
    blurb: 'Slow-smoked Texalina-style brisket, pulled pork and BBQ chicken.',
    menu: [
      { name: 'Chopped Brisket Sandwich', price: 17.0 },
      { name: 'Pulled Pork Sandwich', price: 15.0 },
      { name: 'Crispy BBQ Chicken Sandwich', price: 15.0 },
      { name: 'Chicken Wings', price: 14.0 },
      { name: 'Loaded Baked Potato', price: 12.0 },
    ],
  },
  {
    id: 'lobels',
    name: "Lobel's of New York",
    section: '134',
    category: 'specialty',
    level: 'field',
    angle: sectionAngle('field', 134),
    blurb: 'Hand-carved USDA prime steak — a Yankee Stadium signature.',
    menu: [
      { name: 'USDA Prime Steak Sandwich', price: 19.0 },
      { name: 'BBQ Filet Tip Loaded Tater Tots', price: 14.0 },
      { name: 'Meatloaf Burger', price: 16.0 },
      { name: 'Roast Pork & Broccoli Rabe Sandwich', price: 15.0 },
      { name: 'Steak Topped Fries', price: 12.0 },
    ],
  },
  {
    id: 'nathans',
    name: "Nathan's Famous",
    section: '124',
    category: 'food',
    level: 'field',
    angle: sectionAngle('field', 124),
    blurb: 'The classic Coney Island natural-casing hot dog.',
    menu: [
      { name: 'Natural Casing Hot Dog', price: 7.5, desc: 'Red onions, kraut and mustard' },
      { name: 'Foot-Long Hot Dog', price: 10.0 },
      { name: 'Cheese Fries', price: 9.5 },
      { name: 'Crinkle-Cut Fries', price: 7.0 },
    ],
  },
  {
    id: 'pepsi-food-court',
    name: 'Pepsi Food Court',
    section: '125–127B',
    category: 'food',
    level: 'field',
    angle: sectionAngle('field', 126),
    blurb: 'Ballpark all-stars food court — dogs, pretzels, nachos and Pepsi fountain drinks.',
    menu: [
      { name: 'Hot Dog', price: 7.5 },
      { name: 'Jumbo Pretzel', price: 7.0 },
      { name: 'Nachos Supreme', price: 13.0 },
      { name: 'Pepsi Fountain Soda', price: 6.5 },
      { name: 'Bottled Water', price: 5.5 },
    ],
  },

  // ── Main Level (200) ──────────────────────────────────────────────
  {
    id: 'mac-truck',
    name: 'Mac Truck',
    section: '223',
    category: 'food',
    level: 'main',
    angle: sectionAngle('main', 223),
    blurb: 'Premium mac & cheese loaded with toppings.',
    menu: [
      { name: 'Classic Mac & Cheese', price: 12.0 },
      { name: 'Buffalo Chicken Mac', price: 15.0 },
      { name: 'BBQ Pulled Pork Mac', price: 15.0 },
      { name: 'Bacon Mac', price: 14.0 },
    ],
  },
  {
    id: 'brooklyn-dumpling',
    name: 'Brooklyn Dumpling Shop',
    section: '209',
    category: 'food',
    level: 'main',
    angle: sectionAngle('main', 209),
    blurb: 'Steamed and pan-fried dumplings and buns (new for 2025).',
    menu: [
      { name: 'Pork Soup Dumplings (6)', price: 14.0 },
      { name: 'Chicken Dumplings (6)', price: 13.0 },
      { name: 'Veggie Dumplings (6)', price: 12.0 },
      { name: 'Pork Bun', price: 7.0 },
    ],
  },
  {
    id: 'caribbean-food-delights',
    name: 'Caribbean Food Delights',
    section: '228',
    category: 'food',
    level: 'main',
    angle: sectionAngle('main', 228),
    blurb: 'Authentic Jamaican beef patties and coco bread (new for 2025).',
    menu: [
      { name: 'Jamaican Beef Patty', price: 9.0 },
      { name: 'Spicy Beef Patty', price: 9.0 },
      { name: 'Chicken Patty', price: 9.0 },
      { name: 'Coco Bread', price: 4.0 },
    ],
  },
  {
    id: 'carvel',
    name: 'Carvel',
    section: '220',
    category: 'dessert',
    level: 'main',
    angle: sectionAngle('main', 220),
    blurb: 'Soft-serve sundaes served in a souvenir batting helmet.',
    menu: [
      { name: 'Helmet Sundae', price: 12.0, desc: 'Soft-serve in a keepsake helmet' },
      { name: 'Soft-Serve Cone', price: 7.5 },
      { name: 'Chocolate Crunchies Cup', price: 9.0 },
    ],
  },
  {
    id: 'stella-landing',
    name: 'Stella Artois Landing',
    section: '200 Level · LF',
    category: 'drink',
    level: 'main',
    angle: 285,
    blurb: 'Left-field social bar pouring Stella Artois and Cidre.',
    menu: [
      { name: 'Stella Artois (16 oz)', price: 13.0 },
      { name: 'Stella Cidre (16 oz)', price: 13.0 },
      { name: 'Stella Artois (24 oz)', price: 18.0 },
    ],
  },
  {
    id: 'michelob-clubhouse',
    name: 'Michelob Ultra Clubhouse',
    section: '200 Level · RF',
    category: 'drink',
    level: 'main',
    angle: 78,
    blurb: 'Right-field clubhouse bar with light lagers and seltzers.',
    menu: [
      { name: 'Michelob Ultra (16 oz)', price: 12.0 },
      { name: 'Hard Seltzer', price: 13.0 },
      { name: 'Michelob Ultra (24 oz)', price: 17.0 },
    ],
  },

  // ── Terrace / Grandstand (300) ────────────────────────────────────
  {
    id: 'chickies-petes',
    name: "Chickie's & Pete's",
    section: '334',
    category: 'food',
    level: 'terrace',
    angle: sectionAngle('terrace', 334),
    blurb: 'Philadelphia’s legendary Crabfries® with white cheese sauce.',
    menu: [
      { name: 'Famous Crabfries®', price: 13.5 },
      { name: 'Crabfries + Cheese', price: 15.0 },
      { name: 'Chicken Tenders', price: 15.0 },
      { name: 'Cheesesteak', price: 16.5 },
    ],
  },
  {
    id: 'budweiser-deck',
    name: 'Budweiser Party Deck',
    section: '300 Level',
    category: 'drink',
    level: 'terrace',
    angle: 105,
    blurb: 'Upper-deck social bar with Budweiser and Bud Light on draft.',
    menu: [
      { name: 'Budweiser (16 oz)', price: 12.0 },
      { name: 'Bud Light (16 oz)', price: 12.0 },
      { name: 'Budweiser (24 oz)', price: 17.0 },
      { name: 'Hard Seltzer', price: 13.0 },
    ],
  },
  {
    id: 'cuzins-duzin',
    name: "Cuzin's Duzin",
    section: '300 Level',
    category: 'dessert',
    level: 'terrace',
    angle: 40,
    blurb: 'Hot, fresh mini-donuts tossed in cinnamon sugar.',
    menu: [
      { name: 'Mini Donuts (dozen)', price: 11.0 },
      { name: 'Donuts + Dipping Sauce', price: 13.0 },
      { name: 'Hot Chocolate', price: 6.0 },
    ],
  },

  // ── Bleachers / Outfield ──────────────────────────────────────────
  {
    id: 'kona-bleachers',
    name: 'Kona Bleachers Bar',
    section: 'LF Bleachers',
    category: 'drink',
    level: 'bleacher',
    angle: 210,
    blurb: 'Left-field bleachers bar pouring Kona Big Wave and craft drafts.',
    menu: [
      { name: 'Kona Big Wave (16 oz)', price: 14.0 },
      { name: 'Craft Draft (16 oz)', price: 15.0 },
      { name: 'Bottled Water', price: 5.5 },
    ],
  },
  {
    id: 'batters-eye-deck',
    name: "Mastercard Batter's Eye Deck",
    section: 'Center Field',
    category: 'drink',
    level: 'bleacher',
    angle: 180,
    blurb: 'Center-field social deck with drafts and quick bites.',
    menu: [
      { name: 'Domestic Draft (16 oz)', price: 12.0 },
      { name: 'Jumbo Pretzel', price: 7.0 },
      { name: 'Fountain Soda', price: 6.5 },
    ],
  },
];

// Convenience: price range per stand for list summaries.
export function priceRange(stand) {
  const prices = stand.menu.map((m) => m.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
