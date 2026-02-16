import React from 'react';
import { Clock, X } from 'lucide-react';

interface StoreClosedModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPreOrder?: () => void;
    nextOpenTime?: string;
    nextDeliveryTime?: string;
}

export const StoreClosedModal: React.FC<StoreClosedModalProps> = ({ isOpen, onClose, onPreOrder, nextOpenTime, nextDeliveryTime }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-scale-in">
                {/* Header */}
                <div className="bg-red-500 p-6 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Clock className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-1">
                        Momentan geschlossen
                    </h2>
                    <p className="text-red-100 font-medium opacity-90">
                        Wir haben derzeit geschlossen
                    </p>
                </div>

                {/* Content */}
                <div className="p-8 text-center space-y-4">
                    <div className="bg-red-50 rounded-xl p-6 border border-red-100 space-y-4">
                        <div>
                            <p className="text-gray-600 mb-1 font-medium text-sm border-b border-red-200 pb-1 inline-block">Öffnungszeit / Abholung</p>
                            <p className="text-xl font-bold text-red-600">
                                {nextOpenTime || 'Demnächst'}
                            </p>
                        </div>

                        {nextDeliveryTime && nextDeliveryTime !== nextOpenTime && (
                            <div>
                                <p className="text-gray-600 mb-1 font-medium text-sm border-b border-red-200 pb-1 inline-block">Lieferservice</p>
                                <p className="text-xl font-bold text-red-600">
                                    {nextDeliveryTime}
                                </p>
                            </div>
                        )}
                        {nextDeliveryTime && nextDeliveryTime === nextOpenTime && (
                            <div>
                                <p className="text-gray-600 mb-1 font-medium text-sm border-b border-red-200 pb-1 inline-block">Lieferservice</p>
                                <p className="text-xl font-bold text-red-600">
                                    {nextDeliveryTime}
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-gray-500 leading-relaxed text-sm">
                        Sie können bereits jetzt für eine spätere Lieferung oder Abholung vorbestellen.
                    </p>

                    <div className="space-y-3 pt-2">
                        <button
                            onClick={onPreOrder}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                        >
                            <Clock className="w-5 h-5" />
                            Ich möchte vorbestellen
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all"
                        >
                            Verstanden
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
