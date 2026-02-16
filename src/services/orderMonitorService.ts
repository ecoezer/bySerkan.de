import { supabase } from '../lib/supabase';
import { Order } from '../types';

export type OrderStatus = 'new' | 'accepted' | 'closed';

export interface MonitorOrder extends Order {
  monitorStatus: OrderStatus;
}

type OrderCallback = (orders: MonitorOrder[]) => void;
type NewOrderCallback = (order: MonitorOrder) => void;

class OrderMonitorService {
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private seenOrderIds = new Set<string>();
  private isFirstLoad = true;

  startListening(
    onOrdersUpdate: OrderCallback,
    onNewOrder: NewOrderCallback
  ): void {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orders = (data as any[]).map(this.mapRowToOrder);

      if (this.isFirstLoad) {
        orders.forEach(o => this.seenOrderIds.add(o.id));
        this.isFirstLoad = false;
        console.log('Initial orders loaded. Sound notifications now active.');
      }

      onOrdersUpdate(this.sortOrders(orders));
    };

    fetchOrders();

    this.channel = supabase
      .channel('orders-monitor')
      .on(
        'postgres_changes',
        { event: '*', table: 'orders', schema: 'public' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newOrder = this.mapRowToOrder(payload.new as any);
            if (!this.seenOrderIds.has(newOrder.id)) {
              this.seenOrderIds.add(newOrder.id);
              if (newOrder.monitorStatus === 'new') {
                onNewOrder(newOrder);
              }
            }
          }
          // Refresh list on any change
          fetchOrders();
        }
      )
      .subscribe();
  }

  // Use explicit type for row, but we need to cast input from Supabase which is generic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapRowToOrder(row: any): MonitorOrder {
    return {
      id: row.id,
      customerName: row.customer_name,
      customerAddress: row.customer_address,
      customerPhone: row.customer_phone,
      note: row.note,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: (row.items || []).map((item: any) => ({
        menuItem: {
          id: item.menuItemId,
          number: item.menuItemNumber,
          name: item.menuItemName,
          price: item.menuItemPrice,
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
      })),
      totalAmount: parseFloat(row.total_amount),
      createdAt: new Date(row.created_at),
      deviceInfo: row.device_info,
      ipAddress: row.ip_address,
      status: row.status,
      deliveryType: row.delivery_type,
      deliveryZone: row.delivery_zone,
      monitorStatus: row.monitor_status || 'new'
    };
  }

  private sortOrders(orders: MonitorOrder[]): MonitorOrder[] {
    return orders.sort((a, b) => {
      const statusOrder = { new: 0, accepted: 1, closed: 2 };
      if (a.monitorStatus !== b.monitorStatus) {
        return statusOrder[a.monitorStatus] - statusOrder[b.monitorStatus];
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  stopListening(): void {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.seenOrderIds.clear();
    this.isFirstLoad = true;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          monitor_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async acceptOrder(orderId: string): Promise<void> {
    await this.updateOrderStatus(orderId, 'accepted');
  }

  async closeOrder(orderId: string): Promise<void> {
    await this.updateOrderStatus(orderId, 'closed');
  }
}

export const orderMonitorService = new OrderMonitorService();
