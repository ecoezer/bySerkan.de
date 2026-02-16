import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem, OrderItem, PizzaSize } from '../types';

// ---------------------------------------------------------------------------
// Item Selections
// ---------------------------------------------------------------------------

export interface ItemSelections {
  selectedSize?: PizzaSize;
  selectedIngredients?: string[];
  selectedExtras?: string[];
  selectedPastaType?: string;
  selectedSauce?: string;
  selectedExclusions?: string[];
  selectedSideDish?: string;
  selectedDrink?: string;
}

// ---------------------------------------------------------------------------
// Key helpers
// ---------------------------------------------------------------------------

function buildItemKey(itemId: number, sel: Partial<ItemSelections>): string {
  const parts = [
    itemId,
    sel.selectedSize?.name || 'default',
    sel.selectedIngredients?.length ? [...sel.selectedIngredients].sort().join(',') : 'none',
    sel.selectedExtras?.length ? [...sel.selectedExtras].sort().join(',') : 'none',
    sel.selectedPastaType || 'none',
    sel.selectedSauce || 'none',
    sel.selectedExclusions?.length ? [...sel.selectedExclusions].sort().join(',') : 'none',
    sel.selectedSideDish || 'none',
    sel.selectedDrink || 'none',
  ];
  return parts.join('-');
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface CartState {
  items: OrderItem[];
  addItem: (menuItem: MenuItem, selections?: ItemSelections) => void;
  removeItem: (id: number, selections?: ItemSelections) => void;
  updateQuantity: (id: number, quantity: number, selections?: ItemSelections) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (menuItem, sel = {}) =>
        set(state => {
          const currentItems = [...state.items];
          // Determine key based on input selections
          const newKey = buildItemKey(menuItem.id, sel);

          // Check if item already exists by generating key for each existing item
          const existingIndex = currentItems.findIndex(i => buildItemKey(i.menuItem.id, i) === newKey);

          if (existingIndex >= 0) {
            currentItems[existingIndex] = {
              ...currentItems[existingIndex],
              quantity: currentItems[existingIndex].quantity + 1,
            };
          } else {
            currentItems.push({
              menuItem,
              quantity: 1,
              ...sel, // Spread selections directly
              // Ensure arrays are at least empty arrays if undefined
              selectedIngredients: sel.selectedIngredients || [],
              selectedExtras: sel.selectedExtras || [],
              selectedExclusions: sel.selectedExclusions || [],
            });
          }

          return { items: currentItems };
        }),

      removeItem: (id, sel = {}) =>
        set(state => {
          const searchKey = buildItemKey(id, sel);
          return {
            items: state.items.filter(item => buildItemKey(item.menuItem.id, item) !== searchKey),
          };
        }),

      updateQuantity: (id, quantity, sel = {}) =>
        set(state => {
          const searchKey = buildItemKey(id, sel);

          if (quantity <= 0) {
            return {
              items: state.items.filter(item => buildItemKey(item.menuItem.id, item) !== searchKey),
            };
          }

          return {
            items: state.items.map(item =>
              buildItemKey(item.menuItem.id, item) === searchKey ? { ...item, quantity } : item
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, item) => {
          const basePrice = item.selectedSize?.price ?? item.menuItem.price;
          return sum + basePrice * item.quantity;
        }, 0),
    }),
    { name: 'cart-storage' }
  )
);