import type { Order, OrderItem, RawOrderItem, SupabaseOrderRow } from '../types';

/**
 * Maps a raw Supabase order item JSON to a typed OrderItem.
 */
function mapRawItem(item: RawOrderItem): OrderItem {
    return {
        menuItem: {
            id: parseInt(String(item.menuItemId)),
            number: parseInt(String(item.menuItemNumber)),
            name: item.menuItemName,
            price: item.menuItemPrice ?? 0,
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
}

/**
 * Maps a Supabase order row to the application Order type.
 * Single source of truth — used by both orderService and orderMonitorService.
 */
export function mapSupabaseRowToOrder(row: SupabaseOrderRow): Order {
    return {
        id: row.id,
        customerName: row.customer_name,
        customerAddress: row.customer_address,
        customerPhone: row.customer_phone,
        note: row.note,
        items: (row.items || []).map(mapRawItem),
        totalAmount: parseFloat(String(row.total_amount)),
        createdAt: new Date(row.created_at),
        deviceInfo: row.device_info,
        ipAddress: row.ip_address,
        status: row.status,
        deliveryType: row.delivery_type || 'delivery',
        deliveryZone: row.delivery_zone || 'Unknown',
    };
}
