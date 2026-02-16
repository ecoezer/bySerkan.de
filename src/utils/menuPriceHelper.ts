import * as menuData from '../data/menuItems';
import { MenuItem } from '../types';

const allMenuItems: MenuItem[] = [];

Object.values(menuData).forEach((value) => {
  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (typeof item === 'object' && item !== null && 'id' in item && 'price' in item) {
        allMenuItems.push(item as MenuItem);
      }
    });
  }
});

export function getMenuItemPrice(itemId: number, itemName?: string): number {
  const item = allMenuItems.find(i => i.id === itemId);

  if (item) {
    return item.price;
  }

  if (itemName) {
    const itemByName = allMenuItems.find(i => i.name === itemName);
    if (itemByName) {
      return itemByName.price;
    }
  }

  return 0;
}

export function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`;
}
