import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  User,
  Clock,
  MapPin,
  Phone,
  Mail,
  Trash2,
  BarChart3,
  Menu as MenuIcon,
  Settings
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getAllOrders, deleteOrder } from '../services/orderService';
import { Notification } from '../components/Notification';
import type { Order } from '../types';

import { ArrowLeft } from 'lucide-react';

const AdminOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const fetchedOrders = await getAllOrders();
      setOrders(fetchedOrders);
    } catch (error: unknown) {
      console.error('Error loading orders:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      setNotification({ message: `Fehler beim Laden der Bestellungen: ${message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      await loadOrders();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };


  const formatDate = (date: Date) => {
    const month = date.toLocaleDateString('de-DE', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${month} ${day}, ${year}, ${time}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2332]">
      <header className="bg-[#1a2332] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Bestellungen
                </h1>
                <p className="text-gray-400 text-sm">Verwalten und verfolgen Sie alle eingehenden Bestellungen</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/settings')}
                className="p-2.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
                title="Einstellungen"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/admin/menu')}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <MenuIcon className="w-4 h-4" />
                Speisekarte
              </button>
              <button
                onClick={() => navigate('/admin/analytics')}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                Analysen
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ... Content ... */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-[#2a3648] rounded-xl p-12 text-center">
              <p className="text-gray-400 text-lg">Keine Bestellungen gefunden</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-[#2a3648] rounded-xl p-6 relative">
                {/* ... existing order content ... */}
                <button
                  onClick={() => setDeleteConfirm(order.id)}
                  className="absolute top-6 right-6 p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* ... Rest of Order ... */}
                  {/* Since multi_replace works best with chunks, I'm just injecting the Modals at the end of the return */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-white">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-lg font-semibold">{order.customerName}</span>
                    </div>
                    {/* ... shortened for match ... */}
                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{order.customerPhone}</span>
                    </div>

                    {order.note && (
                      <div className="flex items-start gap-2 text-gray-300 text-sm">
                        <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span>{order.note}</span>
                      </div>
                    )}

                    <div className="flex items-start gap-2 text-gray-300 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span>{order.customerAddress}</span>
                    </div>

                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Delivery: So schnell wie möglich</span>
                    </div>

                    {order.note && (
                      <div className="mt-6 bg-[#1a2332] rounded-lg p-4">
                        <div className="flex items-center gap-2 text-purple-400 mb-2">
                          <Mail className="w-4 h-4" />
                          <span className="font-medium">Notizen</span>
                        </div>
                        <p className="text-gray-300 text-sm">{order.note}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#1e2836] rounded-lg p-5">
                    <h3 className="text-white font-semibold mb-4">Bestellpositionen</h3>
                    <div className="space-y-4 mb-4">
                      {order.items.map((item, idx) => {
                        const basePrice = item.selectedSize?.price || item.menuItem.price;
                        const extrasPrice = (item.selectedExtras?.length || 0) * 1.00;
                        const itemPrice = basePrice + extrasPrice;
                        const totalItemPrice = itemPrice * item.quantity;

                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <div className="flex-1">
                                <div className="text-gray-300 font-medium">
                                  {item.quantity}x {item.menuItem.name}
                                  {item.selectedSize && ` (${item.selectedSize.name})`}
                                </div>

                                {item.selectedPastaType && (
                                  <div className="text-gray-400 text-xs mt-1 ml-4">
                                    → {item.selectedPastaType}
                                  </div>
                                )}

                                {item.menuItem.isMeatSelection && item.selectedSauce && (() => {
                                  const parts = item.selectedSauce.split(' - ');
                                  const meatType = parts[0];
                                  const sauces = parts[1] ? parts[1].split(', ') : [];

                                  const meatEmoji = meatType.toLowerCase().includes('hähnchen') || meatType.toLowerCase().includes('chicken')
                                    ? '🐔'
                                    : '🥩';

                                  return (
                                    <>
                                      <div className="text-gray-400 text-xs mt-1 ml-4">
                                        → {meatEmoji} {meatType}
                                      </div>
                                      {sauces.length > 0 && (
                                        <div className="text-gray-400 text-xs mt-1 ml-4">
                                          → Soße: {sauces.join(', ')}
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}

                                {!item.menuItem.isMeatSelection && item.selectedSauce && (
                                  <div className="text-gray-400 text-xs mt-1 ml-4">
                                    → Sauce: {item.selectedSauce}
                                  </div>
                                )}

                                {item.selectedSideDish && (
                                  <div className="text-gray-400 text-xs mt-1 ml-4">
                                    → Beilage: {item.selectedSideDish}
                                  </div>
                                )}

                                {!item.menuItem.isMeatSelection && item.selectedIngredients && item.selectedIngredients.length > 0 && (
                                  <div className="text-gray-400 text-xs mt-1 ml-4">
                                    → {item.selectedIngredients.join(', ')}
                                  </div>
                                )}

                                {item.selectedExtras && item.selectedExtras.length > 0 && (
                                  <div className="text-orange-400 text-xs mt-1 ml-4">
                                    → Extras (+€{extrasPrice.toFixed(2)}): {item.selectedExtras.join(', ')}
                                  </div>
                                )}

                                {item.selectedExclusions && item.selectedExclusions.length > 0 && (
                                  <div className="text-red-400 text-xs mt-1 ml-4">
                                    → {item.selectedExclusions.join(', ')}
                                  </div>
                                )}
                              </div>
                              <span className="text-white font-medium ml-4">€{totalItemPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-gray-700 pt-3">
                      <div className="flex justify-between">
                        <span className="text-white font-semibold">Gesamt</span>
                        <span className="text-green-400 font-bold text-lg">€{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {deleteConfirm === order.id && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#2a3648] rounded-xl p-6 max-w-md mx-4">
                      <h3 className="text-white text-xl font-semibold mb-4">Bestellung löschen?</h3>
                      <p className="text-gray-300 mb-6">Sind Sie sicher, dass Sie diese Bestellung löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Abbrechen
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Löschen
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>


      {/* Notification Toast */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;
