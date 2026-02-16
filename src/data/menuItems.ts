import { MenuItem } from '../types';

export const drehspiessKalb: readonly MenuItem[] = [
  {
    id: 70,
    number: 70,
    name: "KEBAP-TELLER",
    description: "gem. Salat, Pommes, Kroketten oder Reis",
    price: 10.00,
    isSpezialitaet: true,
    isMultipleSauceSelection: true,
    hasSideDishSelection: true,
    allergens: "2,4,8,G,K,L"
  },
  {
    id: 71,
    number: 71,
    name: "KEBAP-TELLER SPEZIAL",
    description: "auf geröstetem Brot, hausgemachter Joghurtsauce dazu Pommes, Kroketten oder Reis",
    price: 11.00,
    isSpezialitaet: true,
    isMultipleSauceSelection: true,
    hasSideDishSelection: true,
    allergens: "2,4,8,A,G,K,L"
  },
  {
    id: 72,
    number: 72,
    name: "KEBAP-AUFLAUF",
    description: "Champignons, Hollandaise, Tomaten- oder Sahnesauce, Käse überbacken, dazu Pommes, Kroketten oder Reis & gem. Salat",
    price: 11.00,
    isSpezialitaet: true,
    isMultipleSauceSelection: true,
    hasSideDishSelection: true,
    allergens: "4,8,A,G,K,L"
  },
  {
    id: 73,
    number: 73,
    name: "DÜRÜM (in gerolltem Brotfladen)",
    description: "gem. Salat, Krautsalat (rot-weiß), Zwiebeln, Sauce",
    price: 7.00,
    isSpezialitaet: true,
    isMultipleSauceSelection: true,
    allergens: "2,4,8,A,G,K,L"
  },
  {
    id: 74,
    number: 74,
    name: "DÜRÜM Chef",
    description: "Pommes, Sauce und mit Käse gebacken",
    price: 8.00,
    isSpezialitaet: true,
    isMultipleSauceSelection: true,
    allergens: "2,4,8,A,G,K,L"
  },
  {
    id: 75,
    number: 75,
    name: "KEBAP-TASCHE",
    description: "gem. Salat, Krautsalat (rot-weiß), Zwiebeln, Sauce",
    price: 6.50,
    isSpezialitaet: true,
    isMultipleSauceSelection: true,
    allergens: "3,4,8,A,C,K,L"
  },
  {
    id: 76,
    number: 76,
    name: "KEBAP-TASCHE WEICHKÄSE",
    description: "Weichkäse, gem. Salat, Krautsalat (rot-weiß), Zwiebeln, Sauce",
    price: 7.50,
    isSpezialitaet: true,
    isMultipleSauceSelection: true,
    allergens: "4,8,A,G,K,L"
  },
  {
    id: 77,
    number: 77,
    name: "KEBAP-BOX",
    description: "Pommes, Sauce",
    price: 6.00,
    isSpezialitaet: true,
    isMultipleSauceSelection: true,
    allergens: "2,4,8,G,K,L"
  },
  {
    id: 78,
    number: 78,
    name: "VEGETARISCHE TASCHE",
    description: "gem. Salat, Weichkäse, Sauce",
    price: 6.00,
    isSpezialitaet: true,
    isMultipleSauceSelection: true,
    allergens: "A,G"
  },
  {
    id: 79,
    number: 79,
    name: "DÜRÜM VEGETARISCH",
    description: "gem. Salat, Krautsalat (rot-weiß), Weichkäse, Sauce",
    price: 7.00,
    isSpezialitaet: true,
    isMultipleSauceSelection: true,
    allergens: "A,C"
  },
  {
    id: 80,
    number: 80,
    name: "CHILIE-CHEESE-KEBAP-TASCHE",
    description: "gem. Salat, Krautsalat (rot-weiß), Zwiebeln, Jalapenos, Chilie-Cheese-Sauce",
    price: 6.50,
    isSpezialitaet: true,
    isMultipleSauceSelection: true,
    allergens: "2,3,4,8,A,G,K,L"
  }
];

// Re-exporting empty arrays for other categories for now, as they were wiped
export const pizzas: readonly MenuItem[] = [];
export const snacks: readonly MenuItem[] = [];
export const vegetarischeGerichte: readonly MenuItem[] = [];
export const croques: readonly MenuItem[] = [];
export const salads: readonly MenuItem[] = [];
export const dips: readonly MenuItem[] = [];
export const drinks: readonly MenuItem[] = [];

// Configuration Arrays
export const sauceTypes = [
  'Zaziki',
  'Cocktail-Soße',
  'Scharfe Soße',
  'Joghurt-Soße',
  'Knoblauch-Soße',
  'Kräuter-Soße',
  'Curry-Soße',
  'Hollandaise',
  'ohne Soße'
];

export const saladSauceTypes = [
  'Joghurt-Dressing',
  'Essig & Öl',
  'Cocktail-Dressing',
  'ohne Dressing'
];

export const pommesSauceTypes = [
  'Ketchup',
  'Mayonnaise',
  'Joppiesauce',
  'Süßsauer'
];

export const meatTypes = [
  'Kalb',
  'Hähnchen',
  'Gemischt (Kalb & Hähnchen)',
  'Nur Fleisch (ohne Salat)'
];

export const saladExclusionOptions = [
  'ohne Zwiebeln',
  'ohne Tomaten',
  'ohne Gurken',
  'ohne Eisbergsalat',
  'ohne Rotkohl',
  'ohne Weißkohl',
  'ohne Weichkäse',
  'ohne Mais',
  'ohne Peperoni',
  'ohne Soße',
  'Ohne Beilagen bzw. Salate'
];

export const sideDishOptions = [
  'Pommes frites',
  'Reis',
  'Kroketten'
];

export const pastaTypes = [
  'Spaghetti',
  'Rigatoni',
  'Tortellini',
  'Gnocchi',
  'Penne'
];

export const wunschPizzaIngredients = [
  { name: 'Salami', price: 1.00 },
  { name: 'Schinken', price: 1.00 },
  { name: 'Pilze', price: 1.00 },
  { name: 'Paprika', price: 1.00 },
  { name: 'Zwiebeln', price: 1.00 },
  { name: 'Thunfisch', price: 1.50 },
  { name: 'Spinat', price: 1.00 },
  { name: 'Brokkoli', price: 1.00 },
  { name: 'Ei', price: 1.00 },
  { name: 'Mozzarella', price: 1.50 },
  { name: 'Gorgonzola', price: 1.50 },
  { name: 'Weichkäse', price: 1.50 },
  { name: 'Oliven', price: 1.00 },
  { name: 'Peperoni', price: 1.00 },
  { name: 'Mais', price: 1.00 },
  { name: 'Ananas', price: 1.00 },
  { name: 'Spargel', price: 1.00 },
  { name: 'Artischocken', price: 1.00 },
  { name: 'Sardellen', price: 1.50 },
  { name: 'Meeresfrüchte', price: 2.00 },
  { name: 'Krabben', price: 2.00 },
  { name: 'Hähnchen', price: 2.00 },
  { name: 'Kalb', price: 2.00 },
  { name: 'Sucuk', price: 1.50 },
  { name: 'Jalapenos', price: 1.00 },
  { name: 'Hollandaise', price: 1.00 },
  { name: 'BBQ-Sauce', price: 1.00 },
  { name: 'Curry-Sauce', price: 1.00 }
];

export const beerTypes = [
  'Pils',
  'Weizen',
  'Alster',
  'Alt'
];

export const pizzaExtras = [
  'Salami',
  'Schinken',
  'Pilze',
  'Paprika',
  'Zwiebeln',
  'Thunfisch',
  'Spinat',
  'Brokkoli',
  'Ei',
  'Mozzarella',
  'Gorgonzola',
  'Weichkäse',
  'Oliven',
  'Peperoni',
  'Mais',
  'Ananas',
  'Spargel',
  'Artischocken',
  'Sardellen',
  'Meeresfrüchte',
  'Krabben',
  'Hähnchen',
  'Kalb',
  'Sucuk',
  'Jalapenos',
  'Hollandaise',
  'BBQ-Sauce',
  'Curry-Sauce'
];