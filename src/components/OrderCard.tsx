
import { CheckCircle, BellOff } from 'lucide-react';
import { formatPrice } from '../utils/menuPriceHelper';
import type { MonitorOrder } from '../services/orderMonitorService';

interface OrderCardProps {
    order: MonitorOrder;
    onAccept: (orderId: string) => void;
    onClose: (orderId: string) => void;
}

export function OrderCard({ order, onAccept, onClose }: OrderCardProps) {
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
