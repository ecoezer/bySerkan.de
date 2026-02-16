import { supabase } from '../lib/supabase';
import type { Order, OrderItem, CustomerInfo } from '../types';
import { getMenuItemPrice } from '../utils/menuPriceHelper';

const ORDERS_TABLE = 'orders';

const detectDeviceType = (): 'mobile' | 'desktop' => {
  const ua = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ? 'mobile' : 'desktop';
};

const detectBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('SamsungBrowser') > -1) return 'Samsung Internet';
  if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
  if (ua.indexOf('Trident') > -1) return 'Internet Explorer';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  return 'Unknown';
};

const detectOS = (): string => {
  const ua = navigator.userAgent;
  if (ua.indexOf('Windows') > -1) return 'Windows';
  if (ua.indexOf('Mac') > -1) return 'macOS';
  if (ua.indexOf('Linux') > -1) return 'Linux';
  if (ua.indexOf('Android') > -1) return 'Android';
  if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
  return 'Unknown';
};

const extractDeliveryZone = (address: string): string => {
  const match = address.match(/\d{5}/);
  if (match) {
    return match[0];
  }
  const parts = address.split(',');
  return parts[parts.length - 1]?.trim() || 'Unknown';
};

export async function createOrder(
  items: OrderItem[],
  customerInfo: CustomerInfo,
  totalAmount: number
): Promise<string> {
  const deviceInfo = {
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    platform: navigator.platform,
    deviceType: detectDeviceType(),
    browser: detectBrowser(),
    os: detectOS(),
  };

  let ipAddress: string | undefined;
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    ipAddress = ipData.ip;
  } catch (error) {
    console.error('Failed to fetch IP address:', error);
  }

  const orderData = {
    customer_name: customerInfo.name,
    customer_address: customerInfo.address,
    customer_phone: customerInfo.phone,
    note: customerInfo.note || '',
    items: items.map(item => ({
      menuItemId: item.menuItem.id,
      menuItemName: item.menuItem.name,
      menuItemNumber: item.menuItem.number,
      menuItemPrice: item.menuItem.price,
      menuItemIsMeatSelection: item.menuItem.isMeatSelection || false,
      menuItemIsPizza: item.menuItem.isPizza || false,
      menuItemIsPasta: item.menuItem.isPasta || false,
      quantity: item.quantity,
      selectedSize: item.selectedSize || null,
      selectedIngredients: item.selectedIngredients || [],
      selectedExtras: item.selectedExtras || [],
      selectedPastaType: item.selectedPastaType || null,
      selectedSauce: item.selectedSauce || null,
      selectedSideDish: item.selectedSideDish || null,
      selectedExclusions: item.selectedExclusions || [],
    })),
    total_amount: totalAmount,
    device_info: deviceInfo,
    ip_address: ipAddress || 'unknown',
    status: 'pending',
    delivery_type: 'delivery',
    delivery_zone: extractDeliveryZone(customerInfo.address),
  };

  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .insert(orderData)
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((row: any) => {
    interface RawOrderItem {
      menuItemId: string;
      menuItemName: string;
      menuItemNumber: string;
      menuItemPrice?: number;
      menuItemIsMeatSelection?: boolean;
      menuItemIsPizza?: boolean;
      menuItemIsPasta?: boolean;
      quantity: number;
      selectedSize?: string;
      selectedIngredients?: string[];
      selectedExtras?: string[];
      selectedPastaType?: string;
      selectedSauce?: string;
      selectedSideDish?: string;
      selectedExclusions?: string[];
    }
    const items = row.items.map((item: RawOrderItem) => {
      const price = item.menuItemPrice || getMenuItemPrice(parseInt(item.menuItemId), item.menuItemName);

      return {
        menuItem: {
          id: item.menuItemId,
          number: item.menuItemNumber,
          name: item.menuItemName,
          price: price,
          isMeatSelection: item.menuItemIsMeatSelection || false,
          isPizza: item.menuItemIsPizza || false,
          isPasta: item.menuItemIsPasta || false,
        },
        quantity: item.quantity,
        selectedSize: item.selectedSize || undefined,
        selectedIngredients: item.selectedIngredients || undefined,
        selectedExtras: item.selectedExtras || undefined,
        selectedPastaType: item.selectedPastaType || undefined,
        selectedSauce: item.selectedSauce || undefined,
        selectedSideDish: item.selectedSideDish || undefined,
        selectedExclusions: item.selectedExclusions || undefined,
      };
    });

    return {
      id: row.id,
      customerName: row.customer_name,
      customerAddress: row.customer_address,
      customerPhone: row.customer_phone,
      note: row.note,
      items,
      totalAmount: parseFloat(row.total_amount),
      createdAt: new Date(row.created_at),
      deviceInfo: row.device_info,
      ipAddress: row.ip_address,
      status: row.status,
      deliveryType: row.delivery_type || 'delivery',
      deliveryZone: row.delivery_zone || 'Unknown',
    } as Order;
  });
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const { error } = await supabase
    .from(ORDERS_TABLE)
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;
}

export async function deleteOrder(orderId: string): Promise<void> {
  const { error } = await supabase
    .from(ORDERS_TABLE)
    .delete()
    .eq('id', orderId);

  if (error) throw error;
}
