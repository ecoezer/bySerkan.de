export interface MenuItem {
  id: number;
  number: number;
  name: string;
  description?: string;
  price: number;
  allergens?: string;
  sizes?: PizzaSize[];
  isWunschPizza?: boolean;
  isPizza?: boolean;
  isPasta?: boolean;
  isSpezialitaet?: boolean;
  isBeerSelection?: boolean;
  isMeatSelection?: boolean;
  isMultipleSauceSelection?: boolean;
  hasSideDishSelection?: boolean;
  orderCount?: number;
}

export interface MenuSection {
  id: string;
  title: string;
  description: string;
  items: MenuItem[];
  order: number;
}

export interface PizzaSize {
  name: string;
  price: number;
  description?: string;
}

export type SelectedSize = PizzaSize;

export interface PizzaExtra {
  name: string;
  price: number;
}

export interface PastaType {
  name: string;
}

export interface SauceType {
  name: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  selectedSize?: PizzaSize;
  selectedIngredients?: string[];
  selectedExtras?: string[];
  selectedPastaType?: string;
  selectedSauce?: string;
  selectedSauces?: string[];
  selectedSideDish?: string;
  selectedExclusions?: string[];
}

export interface CustomerInfo {
  name: string;
  address: string;
  phone: string;
  note?: string;
}

export interface WunschPizzaIngredient {
  name: string;
  disabled?: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  note?: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: Date;
  deviceInfo: {
    userAgent: string;
    screenResolution: string;
    language: string;
    platform: string;
    deviceType?: 'mobile' | 'desktop';
    browser?: string;
    os?: string;
  };
  ipAddress?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  deliveryType?: 'pickup' | 'delivery';
  deliveryZone?: string;
}

export interface RawOrderItem {
  menuItemId: string;
  menuItemName: string;
  menuItemNumber: string;
  menuItemPrice?: number;
  menuItemIsMeatSelection?: boolean;
  menuItemIsPizza?: boolean;
  menuItemIsPasta?: boolean;
  quantity: number;
  selectedSize?: PizzaSize;
  selectedIngredients?: string[];
  selectedExtras?: string[];
  selectedPastaType?: string;
  selectedSauce?: string;
  selectedSideDish?: string;
  selectedExclusions?: string[];
}

export interface SupabaseOrderRow {
  id: string;
  created_at: string;
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  note?: string;
  items: RawOrderItem[];
  total_amount: number;
  status: Order['status'];
  delivery_type?: 'pickup' | 'delivery';
  delivery_zone?: string;
  device_info?: Order['deviceInfo'];
  ip_address?: string;
  monitor_status?: 'new' | 'accepted' | 'closed';
  updated_at?: string;
}