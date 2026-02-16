import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Monitor,
  Clock,
  MapPin
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Order } from '../types';

type TimePeriod = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'all';

interface Analytics {
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

const AnalyticsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('all');

  const calculateStats = useCallback((ordersList: Order[]) => {
    const totalRevenue = ordersList.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = ordersList.length;
    const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const pickup = ordersList.filter(o => o.deliveryType === 'pickup').length;
    const delivery = ordersList.filter(o => o.deliveryType === 'delivery').length;

    const productMap = new Map<string, { quantity: number; revenue: number }>();
    ordersList.forEach(order => {
      order.items.forEach(item => {
        const key = `${item.menuItem.name}${item.selectedSize ? ` (${item.selectedSize.name})` : ''}`;
        const price = item.selectedSize?.price || item.menuItem.price;
        const itemRevenue = price * item.quantity;

        const existing = productMap.get(key);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += itemRevenue;
        } else {
          productMap.set(key, { quantity: item.quantity, revenue: itemRevenue });
        }
      });
    });

    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const deviceStats = {
      mobile: ordersList.filter(o => o.deviceInfo.deviceType === 'mobile').length,
      desktop: ordersList.filter(o => o.deviceInfo.deviceType === 'desktop').length,
      ios: ordersList.filter(o => o.deviceInfo.os === 'iOS').length,
      android: ordersList.filter(o => o.deviceInfo.os === 'Android').length,
    };

    const browserMap = new Map<string, number>();
    ordersList.forEach(order => {
      const browser = order.deviceInfo.browser || 'Unknown';
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
    });
    const browsers = Array.from(browserMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const hourMap = new Map<number, { orders: number; revenue: number }>();
    ordersList.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      const existing = hourMap.get(hour);
      if (existing) {
        existing.orders++;
        existing.revenue += order.totalAmount;
      } else {
        hourMap.set(hour, { orders: 1, revenue: order.totalAmount });
      }
    });
    const peakHours = Array.from(hourMap.entries())
      .map(([hour, data]) => ({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        orders: data.orders,
        revenue: data.revenue
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    const zoneMap = new Map<string, { orders: number; revenue: number }>();
    ordersList.forEach(order => {
      const zone = order.deliveryZone || 'Unknown';
      const existing = zoneMap.get(zone);
      if (existing) {
        existing.orders++;
        existing.revenue += order.totalAmount;
      } else {
        zoneMap.set(zone, { orders: 1, revenue: order.totalAmount });
      }
    });
    const deliveryZones = Array.from(zoneMap.entries())
      .map(([zone, data]) => ({
        zone,
        orders: data.orders,
        revenue: data.revenue,
        avgOrder: data.revenue / data.orders
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const dateMap = new Map<string, { orders: number; revenue: number }>();
    ordersList.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = dateMap.get(date);
      if (existing) {
        existing.orders++;
        existing.revenue += order.totalAmount;
      } else {
        dateMap.set(date, { orders: 1, revenue: order.totalAmount });
      }
    });
    const dailyTrend = Array.from(dateMap.entries())
      .map(([date, data]) => ({ date, orders: data.orders, revenue: data.revenue }))
      .slice(-7);

    setAnalytics({
      totalRevenue,
      totalOrders,
      averageOrder,
      pickupVsDelivery: { pickup, delivery },
      topProducts,
      deviceStats,
      browsers,
      peakHours,
      deliveryZones,
      dailyTrend
    });
  }, []);

  const filterOrdersByPeriod = useCallback(() => {
    if (!orders.length) return;

    let filtered = [];
    let start: Date | null = null;
    let end: Date | null = null;
    const now = new Date();

    switch (selectedPeriod) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'yesterday': {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        start = new Date(yesterday.setHours(0, 0, 0, 0));
        end = new Date(yesterday.setHours(23, 59, 59, 999));
        break;
      }
      case 'week': {
        const current = new Date();
        const first = current.getDate() - current.getDay() + 1;
        start = new Date(current.setDate(first));
        start.setHours(0, 0, 0, 0);
        end = new Date();
        break;
      }
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date();
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date();
        break;
      case 'all':
        filtered = orders;
        break;
    }

    if (selectedPeriod !== 'all' && start && end) {
      filtered = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= start! && orderDate <= end!;
      });
    }

    setFilteredOrders(filtered);
    calculateStats(filtered);
  }, [orders, selectedPeriod, calculateStats]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Map Supabase data to Order interface
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedOrders: Order[] = (data || []).map((row: any) => ({
          id: row.id,
          items: row.items,
          totalAmount: parseFloat(row.total_amount),
          status: row.status,
          deliveryType: row.delivery_type || 'delivery',
          deliveryZone: row.delivery_zone,
          createdAt: new Date(row.created_at),
          customerName: row.customer_name,
          customerAddress: row.customer_address,
          customerPhone: row.customer_phone,
          note: row.note,
          deviceInfo: row.device_info || {},
          ipAddress: row.ip_address
        }));

        setOrders(mappedOrders);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  useEffect(() => {
    filterOrdersByPeriod();
  }, [filterOrdersByPeriod]);

  const exportToCSV = () => {
    if (filteredOrders.length === 0) return;

    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Address', 'Items', 'Total', 'Status', 'Zone', 'Device Type', 'Browser'];
    const rows = filteredOrders.map(order => [
      order.id,
      new Date(order.createdAt).toLocaleString('de-DE', { hour12: false }),
      order.customerName,
      order.customerPhone,
      order.customerAddress,
      order.items.map(item => `${item.quantity}x ${item.menuItem.name}`).join('; '),
      `€${order.totalAmount.toFixed(2)}`,
      order.status,
      order.deliveryZone || 'Unknown',
      order.deviceInfo.deviceType || 'Unknown',
      order.deviceInfo.browser || 'Unknown'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const maxOrders = analytics ? Math.max(...analytics.peakHours.map(h => h.orders), 1) : 1;
  const maxDailyOrders = analytics ? Math.max(...analytics.dailyTrend.map(d => d.orders), 1) : 1;

  return (
    <div className="min-h-screen bg-[#1a2332]">
      <header className="bg-[#1a2332] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Orders
              </button>
              <h1 className="text-3xl font-bold text-white mb-1">Analytics Dashboard</h1>
              <p className="text-gray-400 text-sm">Comprehensive sales and customer insights</p>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-8">
          {(['all', 'today', 'yesterday', 'week', 'month', 'year'] as TimePeriod[]).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${selectedPeriod === period
                ? 'bg-orange-500 text-white'
                : 'bg-[#2a3648] text-gray-300 hover:bg-[#323d52]'
                }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>

        {analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#2a3648] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500/10 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-white">€{analytics.totalRevenue.toFixed(2)}</p>
              </div>

              <div className="bg-[#2a3648] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500/10 p-3 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-white">{analytics.totalOrders}</p>
              </div>

              <div className="bg-[#2a3648] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-500/10 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">Average Order</p>
                <p className="text-3xl font-bold text-white">€{analytics.averageOrder.toFixed(2)}</p>
              </div>

              <div className="bg-[#2a3648] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-orange-500/10 p-3 rounded-lg">
                    <Package className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">Pickup vs Delivery</p>
                <p className="text-xl font-bold text-white">
                  {analytics.pickupVsDelivery.pickup} / {analytics.pickupVsDelivery.delivery}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {analytics.totalOrders > 0
                    ? `${((analytics.pickupVsDelivery.delivery / analytics.totalOrders) * 100).toFixed(0)}% delivery`
                    : '0% delivery'
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#2a3648] rounded-xl p-6">
                <div className="flex items-center gap-2 text-white mb-6">
                  <Package className="w-5 h-5 text-orange-400" />
                  <h2 className="text-lg font-semibold">Top Products</h2>
                </div>
                <div className="space-y-4">
                  {analytics.topProducts.map((product, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">{product.name}</span>
                        <span className="text-white font-medium">{product.quantity} sold</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-[#1a2332] rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${product.percentage}%` }}
                          />
                        </div>
                        <span className="text-green-400 font-medium text-sm">€{product.revenue.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-400">{product.percentage.toFixed(1)}% of revenue</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#2a3648] rounded-xl p-6">
                <div className="flex items-center gap-2 text-white mb-6">
                  <Monitor className="w-5 h-5 text-orange-400" />
                  <h2 className="text-lg font-semibold">Device & Browser Stats</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-gray-400 text-sm mb-3">Device Type</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#1a2332] rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Mobile</p>
                        <p className="text-white text-2xl font-bold">{analytics.deviceStats.mobile}</p>
                      </div>
                      <div className="bg-[#1a2332] rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Desktop</p>
                        <p className="text-white text-2xl font-bold">{analytics.deviceStats.desktop}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-3">Mobile OS</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#1a2332] rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">iOS</p>
                        <p className="text-white text-2xl font-bold">{analytics.deviceStats.ios}</p>
                      </div>
                      <div className="bg-[#1a2332] rounded-lg p-3">
                        <p className="text-gray-400 text-xs mb-1">Android</p>
                        <p className="text-white text-2xl font-bold">{analytics.deviceStats.android}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-3">Browsers</h3>
                    <div className="space-y-2">
                      {analytics.browsers.slice(0, 5).map((browser, index) => (
                        <div key={index} className="flex justify-between items-center bg-[#1a2332] rounded-lg p-2">
                          <span className="text-gray-300 text-sm">{browser.name}</span>
                          <span className="text-white font-medium">{browser.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#2a3648] rounded-xl p-6">
                <div className="flex items-center gap-2 text-white mb-6">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-lg font-semibold">Peak Order Hours</h2>
                </div>
                <div className="space-y-4">
                  {analytics.peakHours.map((hour, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-orange-400 font-bold w-12">{hour.hour}</span>
                        <div className="flex-1 bg-[#1a2332] rounded-full h-8 relative">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-8 rounded-full flex items-center justify-end px-3"
                            style={{ width: `${(hour.orders / maxOrders) * 100}%` }}
                          >
                            <span className="text-white font-bold text-sm">{hour.orders}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 text-xs">€{hour.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#2a3648] rounded-xl p-6">
                <div className="flex items-center gap-2 text-white mb-6">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <h2 className="text-lg font-semibold">Delivery Zones</h2>
                </div>
                <div className="space-y-4">
                  {analytics.deliveryZones.map((zone, index) => (
                    <div key={index} className="bg-[#1a2332] rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-white font-medium">{zone.zone}</h3>
                        <span className="text-gray-400 text-sm">{zone.orders} orders</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 font-bold text-lg">€{zone.revenue.toFixed(2)}</span>
                        <span className="text-gray-400 text-sm">Avg: €{zone.avgOrder.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#2a3648] rounded-xl p-6">
              <div className="flex items-center gap-2 text-white mb-6">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold">Daily Trend</h2>
              </div>
              <div className="flex items-end gap-4 h-64">
                {analytics.dailyTrend.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end">
                    <div className="text-white font-bold mb-2">{day.orders}</div>
                    <div
                      className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg"
                      style={{ height: `${(day.orders / maxDailyOrders) * 100}%`, minHeight: '20px' }}
                    />
                    <div className="text-gray-400 text-xs mt-2">{day.date}</div>
                    <div className="text-green-400 text-xs font-medium">€{day.revenue.toFixed(0)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
