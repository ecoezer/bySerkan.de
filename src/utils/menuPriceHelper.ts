import * as menuData from '../data/menuItems';
import { MenuItem } from '../types';

/** Lazily-initialized cache of all menu items */
let allMenuItems: MenuItem[] | null = null;

function getAllMenuItems(): MenuItem[] {
  if (allMenuItems) return allMenuItems;

  const items: MenuItem[] = [];
  Object.values(menuData).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === 'object' && item !== null && 'id' in item && 'price' in item) {
          items.push(item as MenuItem);
        }
      });
    }
  });
  allMenuItems = items;
  return items;
}

export function getMenuItemPrice(itemId: number, itemName?: string): number {
  const items = getAllMenuItems();
  const item = items.find(i => i.id === itemId);

  if (item) {
    return item.price;
  }

  if (itemName) {
    const itemByName = items.find(i => i.name === itemName);
    if (itemByName) {
      return itemByName.price;
    }
  }

  return 0;
}

export function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`;
}
