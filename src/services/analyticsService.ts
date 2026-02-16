/**
 * Analytics data service — fetches orders for the dashboard
 * and delegates mapping to the shared orderMapper.
 */
import { supabase } from '../lib/supabase';
import { TABLE } from '../lib/config';
import { mapSupabaseRowToOrder } from './orderMapper';
import { logServiceError } from '../lib/errors';
import type { Order } from '../types';
import type { SupabaseOrderRow } from '../types';

/** Fetch all orders for analytics (no pagination — admin-only). */
export async function fetchAllOrdersForAnalytics(): Promise<Order[]> {
    try {
        const { data, error } = await supabase
            .from(TABLE.ORDERS)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data as SupabaseOrderRow[] ?? []).map(mapSupabaseRowToOrder);
    } catch (error) {
        logServiceError('analyticsService.fetchAllOrders', error);
        throw error;
    }
}
