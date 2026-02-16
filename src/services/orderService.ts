import { supabase } from '../lib/supabase';
import { TABLE } from '../lib/config';
import type { Order, OrderItem, CustomerInfo, SupabaseOrderRow } from '../types';
import { mapSupabaseRowToOrder } from './orderMapper';



export async function createOrder(
  items: OrderItem[],
  customerInfo: CustomerInfo,
  totalAmount: number
): Promise<string> {
  const orderData = {
    customer_name: customerInfo.name,
    customer_address: customerInfo.address,
    customer_phone: customerInfo.phone,
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
    status: 'pending',
  };

  const { data, error } = await supabase
    .from(TABLE.ORDERS)
    .insert(orderData)
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from(TABLE.ORDERS)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data as SupabaseOrderRow[] || []).map(mapSupabaseRowToOrder);
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const { error } = await supabase
    .from(TABLE.ORDERS)
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;
}

export async function deleteOrder(orderId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE.ORDERS)
    .delete()
    .eq('id', orderId);

  if (error) throw error;
}
