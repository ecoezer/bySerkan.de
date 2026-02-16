import { supabase } from '../lib/supabase';
import { TABLE } from '../lib/config';
import type { Order, SupabaseOrderRow } from '../types';
import { mapSupabaseRowToOrder } from './orderMapper';
import { logServiceError } from '../lib/errors';

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
        .from(TABLE.ORDERS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logServiceError('orderMonitorService.fetchOrders', error);
        return;
      }

      const orders = (data as SupabaseOrderRow[]).map(row => this.mapRowToMonitorOrder(row));

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
            const newOrder = this.mapRowToMonitorOrder(payload.new as SupabaseOrderRow);
            if (!this.seenOrderIds.has(newOrder.id)) {
              this.seenOrderIds.add(newOrder.id);
              if (newOrder.monitorStatus === 'new') {
                onNewOrder(newOrder);
              }
            }
          }
          fetchOrders();
        }
      )
      .subscribe();
  }

  /** Extends the shared mapper with monitor-specific fields */
  private mapRowToMonitorOrder(row: SupabaseOrderRow): MonitorOrder {
    return {
      ...mapSupabaseRowToOrder(row),
      monitorStatus: row.monitor_status || 'new',
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
        .from(TABLE.ORDERS)
        .update({
          monitor_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
    } catch (error) {
      logServiceError('orderMonitorService.updateOrderStatus', error);
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
