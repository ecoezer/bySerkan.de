import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { orderMonitorService, MonitorOrder } from '../services/orderMonitorService';
import { useAudio } from '../hooks/useAudio';
import { LogOut, Volume2, VolumeX, TestTube, Bell, BellOff, CheckCircle, Package, Search, Filter } from 'lucide-react';
import { formatPrice } from '../utils/menuPriceHelper';

export default function OrderMonitor() {
  const navigate = useNavigate();
  const { play, stop, toggleMute, setVolume, testAudio, isMuted, volume, error: audioError } = useAudio();

  const [orders, setOrders] = useState<MonitorOrder[]>([]);
  // Local volume/mute state removed in favor of Context state
  const [searchTerm, setSearchTerm] = useState('');
  const [showClosed, setShowClosed] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);

  useEffect(() => {
    // Auth check is handled by MonitorProtectedRoute in App.tsx

    // One-time interaction check to unlock audio if needed
    const enableAudio = async () => {
      try {
        await testAudio();
        setAudioInitialized(true);
        console.log('Audio test completed successfully');
      } catch (error) {
        console.error('Audio test failed:', error);
      }
    };

    document.addEventListener('click', enableAudio, { once: true });

    orderMonitorService.startListening(
      (updatedOrders) => {
        setOrders(updatedOrders);
        setIsConnected(true);
      },
      (newOrder) => {
        console.log('New order callback triggered for:', newOrder.id);
        if (!isMuted) {
          play();
        }
      }
    );

    return () => {
      orderMonitorService.stopListening();
      stop();
      document.removeEventListener('click', enableAudio);
    };
  }, [navigate, play, stop, isMuted, testAudio]); // Add dependencies

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/monitor-login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await orderMonitorService.acceptOrder(orderId);
      stop();
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const handleCloseOrder = async (orderId: string) => {
    if (window.confirm('Diese Bestellung als geliefert markieren?')) {
      try {
        await orderMonitorService.closeOrder(orderId);
      } catch (error) {
        console.error('Error closing order:', error);
      }
    }
  };

  const handleToggleMute = () => {
    toggleMute();
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleTestAudio = () => {
    testAudio();
  };

  const filteredOrders = orders.filter(order => {
    if (!showClosed && order.monitorStatus === 'closed') return false;
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      order.customerName.toLowerCase().includes(search) ||
      order.customerPhone.includes(search) ||
      order.id.toLowerCase().includes(search)
    );
  });

  const newOrdersCount = orders.filter(o => o.monitorStatus === 'new').length;

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Bestellmonitor</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-slate-300">
                  {isConnected ? 'Verbunden' : 'Getrennt'}
                </span>
              </div>
              {audioInitialized && !audioError && (
                <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500 px-3 py-1 rounded-full">
                  <Volume2 className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500">
                    Ton aktiv
                  </span>
                </div>
              )}
              {audioError && (
                <div className="flex items-center space-x-2 bg-yellow-500/20 border border-yellow-500 px-3 py-1 rounded-full">
                  <VolumeX className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-yellow-500">
                    Ton-Fehler
                  </span>
                </div>
              )}
              {newOrdersCount > 0 && (
                <div className="flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full animate-pulse">
                  <Bell className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">
                    {newOrdersCount} Neu
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-700 rounded-lg px-3 py-2">
                <button
                  onClick={handleToggleMute}
                  className="text-slate-300 hover:text-white transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-20"
                />
                <button
                  onClick={handleTestAudio}
                  className="text-slate-300 hover:text-white transition-colors"
                  title="Test Audio"
                >
                  <TestTube className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Suche nach Name, Telefon oder Best.-Nr..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowClosed(!showClosed)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${showClosed
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
            >
              <Filter className="w-5 h-5" />
              <span>{showClosed ? 'Verstecke' : 'Zeige'} Abgeschlossene</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Keine Bestellungen zum Anzeigen</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={handleAcceptOrder}
                onClose={handleCloseOrder}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

interface OrderCardProps {
  order: MonitorOrder;
  onAccept: (orderId: string) => void;
  onClose: (orderId: string) => void;
}

function OrderCard({ order, onAccept, onClose }: OrderCardProps) {
  const statusColors = {
    new: 'border-red-500 bg-red-500/10',
    accepted: 'border-blue-500 bg-blue-500/10',
    closed: 'border-slate-600 bg-slate-800/50'
  };

  const statusLabels = {
    new: 'NEUE BESTELLUNG',
    accepted: 'ANGENOMMEN',
    closed: 'ABGESCHLOSSEN'
  };

  return (
    <div
      className={`border-2 rounded-lg p-3 transition-all ${statusColors[order.monitorStatus]} ${order.monitorStatus === 'new' ? 'animate-pulse' : ''
        }`}
      onClick={() => order.monitorStatus === 'new' && onAccept(order.id)}
      style={{ cursor: order.monitorStatus === 'new' ? 'pointer' : 'default' }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-sm font-bold ${order.monitorStatus === 'new' ? 'bg-red-500 text-white' :
              order.monitorStatus === 'accepted' ? 'bg-blue-500 text-white' :
                'bg-slate-600 text-slate-300'
              }`}>
              {statusLabels[order.monitorStatus]}
            </span>
            <span className="text-slate-400 text-base">
              {order.createdAt.toLocaleString('de-DE', { hour12: false })}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white">{order.customerName}</h3>
          <p className="text-slate-300 text-lg">{order.customerPhone}</p>
          <p className="text-slate-300 text-lg">{order.customerAddress}</p>
          {order.note && (
            <p className="text-yellow-400 mt-1 text-base font-semibold">Notiz: {order.note}</p>
          )}
        </div>

        <div className="text-right">
          <p className="text-4xl font-bold text-white">{formatPrice(order.totalAmount)}</p>
          <p className="text-slate-400 text-base">Best. #{order.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="border-t border-slate-700 pt-2 mb-2">
        <h4 className="text-base font-bold text-slate-400 mb-1">BESTELLPOSITIONEN</h4>
        <div className="space-y-0">
          {order.items.map((item, index) => {
            const basePrice = item.selectedSize?.price || item.menuItem?.price || 0;
            const extrasPrice = (item.selectedExtras?.length || 0) * 1.00;
            const itemPrice = basePrice + extrasPrice;
            const totalItemPrice = itemPrice * item.quantity;

            return (
              <div key={index} className="bg-slate-800/50 border-b border-slate-700 py-1 px-2">
                <div className="flex justify-between items-center">
                  <div className="text-white font-bold text-xl">
                    <span className="text-yellow-400 mr-2">#{item.menuItem?.number || '?'}</span>
                    {item.quantity}x {item.menuItem?.name || 'Unbekanntes Artikel'}
                    {item.selectedSize && (
                      <span className="text-slate-400 font-normal text-lg ml-2">
                        ({item.selectedSize.name})
                      </span>
                    )}
                  </div>
                  <span className="text-white font-bold text-xl ml-4">{formatPrice(totalItemPrice)}</span>
                </div>

                {item.selectedPastaType && (
                  <div className="text-slate-200 text-lg leading-tight">
                    <span className="text-green-500 mr-1">✓</span>
                    {item.selectedPastaType}
                  </div>
                )}

                {item.menuItem?.isMeatSelection && item.selectedSauce && (() => {
                  const parts = item.selectedSauce.split(' - ');
                  const meatType = parts[0];
                  const sauces = parts[1] ? parts[1].split(', ') : [];

                  const meatEmoji = meatType.toLowerCase().includes('hähnchen') || meatType.toLowerCase().includes('chicken')
                    ? '🐔'
                    : '🥩';

                  return (
                    <>
                      <div className="text-slate-200 text-lg leading-tight">
                        <span className="mr-1">{meatEmoji}</span>
                        {meatType}
                      </div>
                      {sauces.length > 0 && (
                        <div className="text-slate-200 text-lg leading-tight">
                          <span className="text-green-500 mr-1">✓</span>
                          Soße: {sauces.join(', ')}
                        </div>
                      )}
                    </>
                  );
                })()}

                {!item.menuItem?.isMeatSelection && item.selectedSauce && (
                  <div className="text-slate-200 text-lg leading-tight">
                    <span className="text-green-500 mr-1">✓</span>
                    Soße: {item.selectedSauce}
                  </div>
                )}

                {item.selectedSideDish && (
                  <div className="text-slate-200 text-lg leading-tight">
                    <span className="text-green-500 mr-1">✓</span>
                    Beilage: {item.selectedSideDish}
                  </div>
                )}

                {!item.menuItem?.isMeatSelection && item.selectedIngredients && item.selectedIngredients.length > 0 && (
                  <>
                    {item.selectedIngredients.map((ingredient, idx) => (
                      <div key={idx} className="text-slate-200 text-lg leading-tight">
                        <span className="text-green-500 mr-1">✓</span>
                        {ingredient}
                      </div>
                    ))}
                  </>
                )}

                {item.selectedExtras && item.selectedExtras.length > 0 && (
                  <>
                    {item.selectedExtras.map((extra, idx) => (
                      <div key={idx} className="text-orange-400 text-lg font-semibold leading-tight">
                        <span className="text-green-500 mr-1">✓</span>
                        Extra: {extra} (+{formatPrice(1.00)})
                      </div>
                    ))}
                  </>
                )}

                {item.selectedExclusions && item.selectedExclusions.length > 0 && (
                  <>
                    {item.selectedExclusions.map((exclusion, idx) => (
                      <div key={idx} className="text-red-400 text-lg font-bold leading-tight">
                        <span className="mr-1">❌</span>
                        {exclusion}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {order.monitorStatus === 'accepted' && (
        <div className="flex justify-end mt-2">
          <button
            onClick={() => onClose(order.id)}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors text-xl font-bold"
          >
            <CheckCircle className="w-6 h-6" />
            <span>Als Geliefert markieren</span>
          </button>
        </div>
      )}

      {order.monitorStatus === 'new' && (
        <div className="flex justify-end mt-2">
          <button
            onClick={() => onAccept(order.id)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg transition-colors text-2xl font-bold"
          >
            <BellOff className="w-7 h-7" />
            <span>Bestellung Annehmen</span>
          </button>
        </div>
      )}
    </div>
  );
}
