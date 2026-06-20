// Food & drink stands across Yankee Stadium.
//
// Each stand is positioned on the polar model (angle° clockwise from home
// plate + concourse level). Brands reflect concessions that have appeared at
// Yankee Stadium; menus and prices are illustrative samples (USD).
//
// category: 'food' | 'drink' | 'dessert' | 'specialty'

export const CATEGORIES = {
  food: { label: 'Food', color: '#ef4444', icon: '🍔' },
  drink: { label: 'Drinks', color: '#3b82f6', icon: '🍺' },
  dessert: { label: 'Desserts', color: '#ec4899', icon: '🍦' },
  specialty: { label: 'Specialty', color: '#f59e0b', icon: '⭐' },
};

export const CONCESSIONS = [
  // ── Field Level (100s) ────────────────────────────────────────────
  {
    id: 'nathans',
    name: "Nathan's Famous",
    category: 'food',
    level: 'field',
    angle: 25,
    blurb: 'The classic Coney Island hot dog, a ballpark staple.',
    menu: [
      { name: 'Nathan’s Hot Dog', price: 7.5 },
      { name: 'Foot-Long Hot Dog', price: 10.0 },
      { name: 'Cheese Fries', price: 9.5 },
      { name: 'Crinkle-Cut Fries', price: 7.0 },
      { name: 'Bottled Soda', price: 6.5 },
    ],
  },
  {
    id: 'lobels',
    name: "Lobel's of New York",
    category: 'specialty',
    level: 'field',
    angle: 60,
    blurb: 'Hand-carved USDA prime steak sandwich — a Yankee Stadium signature.',
    menu: [
      { name: 'Prime Steak Sandwich', price: 18.0, desc: 'On a toasted roll with caramelized onions' },
      { name: 'Steak Sandwich Combo', price: 24.0, desc: 'With fries & soda' },
      { name: 'Side of Fries', price: 7.5 },
    ],
  },
  {
    id: 'bronx-burger',
    name: 'Bronx Burger Co.',
    category: 'food',
    level: 'field',
    angle: 300,
    blurb: 'Smash burgers ground fresh, with classic and loaded options.',
    menu: [
      { name: 'Classic Cheeseburger', price: 15.0 },
      { name: 'Bronx Bomber (double)', price: 18.5, desc: 'Double patty, bacon, special sauce' },
      { name: 'Veggie Burger', price: 14.0 },
      { name: 'Hand-Cut Fries', price: 7.5 },
    ],
  },
  {
    id: 'pat-lafrieda',
    name: 'Pat LaFrieda',
    category: 'specialty',
    level: 'field',
    angle: 330,
    blurb: 'Famed butcher’s filet mignon steak sandwich on a sesame roll.',
    menu: [
      { name: 'Filet Mignon Steak Sandwich', price: 19.0, desc: 'Monterey Jack, caramelized onions, au jus' },
      { name: 'Chicken Sandwich', price: 15.5 },
      { name: 'Truffle Fries', price: 11.0 },
    ],
  },
  {
    id: 'beers-world-fl',
    name: 'Beers of the World',
    category: 'drink',
    level: 'field',
    angle: 85,
    blurb: 'Rotating taps of domestic, craft and import beers.',
    menu: [
      { name: 'Domestic Draft (16 oz)', price: 12.0 },
      { name: 'Craft Draft (16 oz)', price: 15.0 },
      { name: 'Import Draft (24 oz)', price: 18.0 },
      { name: 'Hard Seltzer', price: 13.0 },
    ],
  },

  // ── Main Level (200s) ─────────────────────────────────────────────
  {
    id: 'chickies-petes',
    name: "Chickie's & Pete's",
    category: 'food',
    level: 'main',
    angle: 50,
    blurb: 'Philadelphia’s legendary Crabfries® with white cheese sauce.',
    menu: [
      { name: 'Famous Crabfries®', price: 13.5 },
      { name: 'Crab Fries + Cheese', price: 15.0 },
      { name: 'Chicken Tenders', price: 15.0 },
      { name: 'Cheesesteak', price: 16.5 },
    ],
  },
  {
    id: 'mighty-quinns',
    name: "Mighty Quinn's BBQ",
    category: 'food',
    level: 'main',
    angle: 105,
    blurb: 'Slow-smoked brisket and pulled pork, Texalina style.',
    menu: [
      { name: 'Brisket Sandwich', price: 17.0 },
      { name: 'Pulled Pork Sandwich', price: 15.0 },
      { name: 'Burnt Ends', price: 16.0 },
      { name: 'Mac & Cheese', price: 8.0 },
    ],
  },
  {
    id: 'parm',
    name: 'Parm',
    category: 'food',
    level: 'main',
    angle: 340,
    blurb: 'Italian-American classics — chicken parm heroes and garlic bread.',
    menu: [
      { name: 'Chicken Parm Hero', price: 16.0 },
      { name: 'Meatball Parm', price: 15.0 },
      { name: 'Garlic Bread', price: 7.0 },
      { name: 'Caesar Salad', price: 11.0 },
    ],
  },
  {
    id: 'bareburger',
    name: 'Bareburger',
    category: 'food',
    level: 'main',
    angle: 290,
    blurb: 'Organic burgers with plant-based and gluten-free options.',
    menu: [
      { name: 'Organic Beef Burger', price: 16.0 },
      { name: 'Impossible™ Burger', price: 16.5 },
      { name: 'Sweet Potato Fries', price: 8.0 },
    ],
  },
  {
    id: 'goose-island',
    name: 'Goose Island Beer Co.',
    category: 'drink',
    level: 'main',
    angle: 20,
    blurb: 'Chicago craft brewery taproom with IPAs and seasonals.',
    menu: [
      { name: 'Goose IPA (16 oz)', price: 14.0 },
      { name: '312 Urban Wheat (16 oz)', price: 14.0 },
      { name: 'Seasonal Draft (24 oz)', price: 19.0 },
    ],
  },
  {
    id: 'jim-beam',
    name: 'Jim Beam Suite Bar',
    category: 'drink',
    level: 'main',
    angle: 0,
    blurb: 'Full cocktail bar — bourbon classics and frozen drinks.',
    menu: [
      { name: 'Bourbon & Cola', price: 16.0 },
      { name: 'Classic Margarita', price: 16.0 },
      { name: 'Frozen Lemonade (spiked)', price: 17.0 },
      { name: 'House Wine (glass)', price: 14.0 },
    ],
  },
  {
    id: 'carvel',
    name: 'Carvel',
    category: 'dessert',
    level: 'main',
    angle: 75,
    blurb: 'Soft-serve sundaes served in a souvenir batting helmet.',
    menu: [
      { name: 'Helmet Sundae', price: 12.0, desc: 'Soft-serve in a keepsake helmet' },
      { name: 'Soft-Serve Cone', price: 7.5 },
      { name: 'Chocolate Crunchies Cup', price: 9.0 },
    ],
  },

  // ── Terrace / Grandstand (300s) ───────────────────────────────────
  {
    id: 'triple-play',
    name: 'Triple Play Grill',
    category: 'food',
    level: 'terrace',
    angle: 15,
    blurb: 'Ballpark all-stars: dogs, sausages, pretzels and nachos.',
    menu: [
      { name: 'Hot Dog', price: 7.0 },
      { name: 'Sausage & Peppers', price: 12.0 },
      { name: 'Jumbo Pretzel', price: 7.0 },
      { name: 'Nachos Supreme', price: 13.0 },
      { name: 'Fountain Soda', price: 6.5 },
    ],
  },
  {
    id: 'cuzins-duzin',
    name: "Cuzin's Duzin",
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
  {
    id: 'beers-world-tr',
    name: 'Beers of the World',
    category: 'drink',
    level: 'terrace',
    angle: 320,
    blurb: 'Upper-deck taproom with a wide draft selection.',
    menu: [
      { name: 'Domestic Draft (16 oz)', price: 12.0 },
      { name: 'Craft Draft (16 oz)', price: 15.0 },
      { name: 'Bottled Water', price: 5.5 },
      { name: 'Bottled Soda', price: 6.5 },
    ],
  },
  {
    id: 'kosher-grill',
    name: 'Kosher Grill',
    category: 'food',
    level: 'terrace',
    angle: 295,
    blurb: 'Glatt kosher hot dogs, knishes and fries.',
    menu: [
      { name: 'Kosher Hot Dog', price: 8.5 },
      { name: 'Potato Knish', price: 7.0 },
      { name: 'Kosher Fries', price: 7.0 },
    ],
  },

  // ── Bleachers ─────────────────────────────────────────────────────
  {
    id: 'bleacher-bar',
    name: 'Bleacher Beer Garden',
    category: 'drink',
    level: 'bleacher',
    angle: 175,
    blurb: 'Outfield beer garden behind the bleachers.',
    menu: [
      { name: 'Domestic Draft (24 oz)', price: 16.0 },
      { name: 'Craft Can (16 oz)', price: 14.0 },
      { name: 'Hard Seltzer', price: 13.0 },
      { name: 'Bottled Water', price: 5.5 },
    ],
  },
  {
    id: 'bleacher-dogs',
    name: 'Bleacher Creatures Grill',
    category: 'food',
    level: 'bleacher',
    angle: 200,
    blurb: 'Quick-serve dogs, burgers and fries for the outfield faithful.',
    menu: [
      { name: 'Hot Dog', price: 7.0 },
      { name: 'Cheeseburger', price: 13.0 },
      { name: 'Fries', price: 7.0 },
      { name: 'Fountain Soda', price: 6.5 },
    ],
  },
];

// Convenience: price range per stand for list summaries.
export function priceRange(stand) {
  const prices = stand.menu.map((m) => m.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
