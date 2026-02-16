import { supabase } from '../lib/supabase';
import type { Order, OrderItem, CustomerInfo } from '../types';
import { getMenuItemPrice } from '../utils/menuPriceHelper';

const ORDERS_TABLE = 'orders';

export async function createOrder(
  items: OrderItem[],
  customerInfo: CustomerInfo,
  totalAmount: number
): Promise<string> {
  // let ipAddress: string | undefined; // Declare ipAddress if it were to be used
  try {
    // Optional: Fetch IP address if needed, or remove completely if not used.
    // const ipResponse = await fetch('https://api.ipify.org?format=json');
    // const ipData = await ipResponse.json();
    // ipAddress = ipData.ip;
  } catch (error) {
    console.warn('Failed to fetch IP address:', error);
  }

  const orderData = {
    customer_name: customerInfo.name,
    customer_address: customerInfo.address,
    customer_phone: customerInfo.phone,
    // note column missing in DB
    // note: customerInfo.note || '', 
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
    // device_info: deviceInfo,
    // ip_address: ipAddress || 'unknown',
    status: 'pending',
    // delivery_type and delivery_zone columns differ from DB schema or are missing
    // storing zone in address string is sufficient for now
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data || []).map((row: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = row.items.map((item: any) => {
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
