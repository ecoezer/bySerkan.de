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
  selectedDrink?: string;
}

export interface CustomerInfo {
  name: string;
  address: string;
  phone: string;
  note?: string;
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

export interface CategoryRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
}

export interface MenuItemRow {
  id: string;
  category_id?: string;
  category_slug?: string;
  number: number;
  name: string;
  description: string;
  price: string; // Supabase returns numeric/decimal as string usually? Or number? menuService parses it: parseFloat(item.price)
  allergens: string;
  sizes: PizzaSize[];
  is_wunsch_pizza: boolean;
  is_pizza: boolean;
  is_pasta: boolean;
  is_spezialitaet: boolean;
  is_beer_selection: boolean;
  is_meat_selection: boolean;
  is_multiple_sauce_selection: boolean;
  has_side_dish_selection: boolean;
  order_count: number;
}

export type TimePeriod = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'all';

export interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrder: number;
  pickupVsDelivery: { pickup: number; delivery: number };
  topProducts: Array<{ name: string; quantity: number; revenue: number; percentage: number }>;
  deviceStats: {
    mobile: number;
    desktop: number;
    ios: number;
    android: number;
  };
  browsers: Array<{ name: string; count: number }>;
  peakHours: Array<{ hour: string; orders: number; revenue: number }>;
  deliveryZones: Array<{ zone: string; orders: number; revenue: number; avgOrder: number }>;
  dailyTrend: Array<{ date: string; orders: number; revenue: number }>;
}

export interface DaySchedule {
  isOpen: boolean;
  open: string;
  close: string;
}

export interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface AddressSettings {
  street: string;
  city: string;
  zip: string;
  phone: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  zipCode: string;
  minOrder: number;
  deliveryFee: number;
}

export interface StoreSettings {
  isOpen: boolean;
  isDeliveryAvailable: boolean;
  isPickupAvailable: boolean;
  pausedDateDelivery?: string | null;
  pausedDatePickup?: string | null;
  schedule: WeekSchedule;
  deliverySchedule: WeekSchedule;
  address: AddressSettings;
  deliveryZones: DeliveryZone[];
}