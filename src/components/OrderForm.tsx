import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Plus, Minus, ShoppingCart, Clock, Send } from 'lucide-react';
import { createOrder } from '../services/orderService';

import type { OrderItem, CustomerInfo } from '../types';

import { useCartStore } from '../store/cart.store';
import { useStoreStatus } from '../hooks/useStoreStatus';

interface OrderFormProps {
  onCloseMobileCart?: () => void;
  hideTitle?: boolean;
}

// Form validation schema
const orderSchema = z.object({
  orderType: z.enum(['pickup', 'delivery']),
  deliveryZone: z.string().optional(),
  deliveryTime: z.enum(['asap', 'specific']),
  specificTime: z.string().optional(),
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen haben'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen haben'),
  phone: z.string().min(10, 'Telefonnummer muss mindestens 10 Zeichen haben'),
  street: z.string().optional(),
  houseNumber: z.string().optional(),
  postcode: z.string().optional(),
  note: z.string().optional(),
}).refine((data) => {
  if (data.orderType === 'delivery') {
    return data.deliveryZone && data.street && data.houseNumber && data.postcode;
  }
  return true;
}, {
  message: 'Bei Lieferung sind Liefergebiet, Straße, Hausnummer und PLZ erforderlich',
  path: ['deliveryZone']
}).refine((data) => {
  if (data.deliveryTime === 'specific') {
    return data.specificTime;
  }
  return true;
}, {
  message: 'Bei spezifischer Zeit muss eine Uhrzeit angegeben werden',
  path: ['specificTime']
});

type OrderFormData = z.infer<typeof orderSchema>;

const OrderForm: React.FC<OrderFormProps> = ({
  onCloseMobileCart,
  hideTitle = false
}) => {
  const orderItems = useCartStore(state => state.items);
  const onRemoveItem = useCartStore(state => state.removeItem);
  const onUpdateQuantity = useCartStore(state => state.updateQuantity);
  const onClearCart = useCartStore(state => state.clearCart);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);


  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    reset
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderType: 'pickup',
      deliveryTime: 'asap'
    }
  });

  const watchOrderType = watch('orderType');
  const watchDeliveryZone = watch('deliveryZone');
  const watchDeliveryTime = watch('deliveryTime');

  const { settings, storeStatus, nextSchedule } = useStoreStatus(watchOrderType);

  // Local state for delivery zones (derived from settings)
  const deliveryZones = useMemo(() => settings?.deliveryZones || [], [settings]);

  // Handle auto-switching logic when status changes
  React.useEffect(() => {
    if (storeStatus.isOpen) {
      if (watchOrderType === 'delivery' && !storeStatus.isDeliveryOpen && storeStatus.isPickupOpen) {
        setValue('orderType', 'pickup');
      } else if (watchOrderType === 'pickup' && !storeStatus.isPickupOpen && storeStatus.isDeliveryOpen) {
        setValue('orderType', 'delivery');
      }
    } else {
      // If closed, force specific time for pre-order
      setValue('deliveryTime', 'specific');
      if (nextSchedule && !watch('specificTime')) {
        setValue('specificTime', nextSchedule.open);
      }
    }
  }, [storeStatus, watchOrderType, setValue, nextSchedule, watch]);

  // Update next schedule when order type changes or settings load
  // Pre-select specific time if validated next schedule is available
  React.useEffect(() => {
    if (settings && nextSchedule) {

      const currentSpecificTime = watch('specificTime');

      // If specific time is selected or forced, validate it/update it
      if (nextSchedule && (!storeStatus.isOpen || watchDeliveryTime === 'specific')) {
        // If empty, OR if current time is before the new open time (e.g. switching Pickup 11:00 -> Delivery 12:00)
        if (!currentSpecificTime || (currentSpecificTime < nextSchedule.open)) {
          setValue('specificTime', nextSchedule.open);
        }
      }
    }
  }, [watchOrderType, settings, storeStatus.isOpen, watchDeliveryTime, setValue, watch, nextSchedule]);



  // Helper function to calculate item price including extras
  const calculateItemPrice = useCallback((item: OrderItem) => {
    const basePrice = item.selectedSize ? item.selectedSize.price : item.menuItem.price;
    const extrasPrice = (item.selectedExtras?.length || 0) * 1.00;
    return basePrice + extrasPrice;
  }, []);

  // Calculate totals
  const { subtotal, deliveryFee, total, canOrder, minOrderMessage } = useMemo(() => {
    const subtotal = orderItems.reduce((sum, item) => {
      const itemPrice = calculateItemPrice(item);
      return sum + (itemPrice * item.quantity);
    }, 0);

    let deliveryFee = 0;
    let canOrder = true;
    let minOrderMessage = '';

    if (watchOrderType === 'delivery' && watchDeliveryZone) {
      const zone = deliveryZones.find(z => z.id === watchDeliveryZone);
      if (zone) {
        deliveryFee = zone.deliveryFee;
        if (subtotal < zone.minOrder) {
          canOrder = false;
          minOrderMessage = `Mindestbestellwert für ${zone.name}: ${zone.minOrder.toFixed(2).replace('.', ',')} €`;
        }
      }
    }

    const total = subtotal + deliveryFee;

    return { subtotal, deliveryFee, total, canOrder, minOrderMessage };
  }, [orderItems, watchOrderType, watchDeliveryZone, calculateItemPrice, deliveryZones]);

  // Generate WhatsApp message
  const generateWhatsAppMessage = useCallback((data: OrderFormData) => {
    let message = `🍕 *Neue Bestellung - bySerkan.de*\n\n`;

    // Customer info
    message += `👤 *Kunde:* ${data.firstName} ${data.lastName}\n`;
    message += `📞 *Telefon:* ${data.phone}\n`;
    message += `📦 *Art:* ${data.orderType === 'pickup' ? 'Abholung' : 'Lieferung'}\n`;

    if (data.orderType === 'delivery' && data.deliveryZone) {
      const zone = deliveryZones.find(z => z.id === data.deliveryZone);
      message += `📍 *Adresse:* ${data.street} ${data.houseNumber}, ${data.postcode}\n`;
      message += `🗺️ *Gebiet:* ${zone?.name}\n`;
    }

    message += `⏰ *Zeit:* ${data.deliveryTime === 'asap' ? 'So schnell wie möglich' : `Um ${data.specificTime} Uhr`}\n\n`;

    // Order items
    message += `🛒 *Bestellung:*\n`;
    orderItems.forEach(item => {
      let itemText = `${item.quantity}x Nr. ${item.menuItem.number} ${item.menuItem.name}`;

      if (item.selectedSize) {
        itemText += ` (${item.selectedSize.name}${item.selectedSize.description ? ` - ${item.selectedSize.description}` : ''})`;
      }

      if (item.selectedPastaType) {
        itemText += ` - Nudelsorte: ${item.selectedPastaType}`;
      }

      if (item.selectedSauce) {
        itemText += ` - Soße: ${item.selectedSauce}`;
      }

      if (item.selectedExclusions && item.selectedExclusions.length > 0) {
        itemText += ` - Salat: ${item.selectedExclusions.join(', ')}`;
      }

      if (item.selectedSideDish) {
        itemText += ` - Beilage: ${item.selectedSideDish}`;
      }

      if (item.selectedDrink) {
        itemText += ` - Getränk: ${item.selectedDrink}`;
      }

      if (item.selectedIngredients && item.selectedIngredients.length > 0) {
        itemText += ` - Zutaten: ${item.selectedIngredients.join(', ')}`;
      }

      if (item.selectedExtras && item.selectedExtras.length > 0) {
        itemText += ` - Extras: ${item.selectedExtras.join(', ')} (+${(item.selectedExtras.length * 1.00).toFixed(2).replace('.', ',')}€)`;
      }

      const itemTotal = (calculateItemPrice(item) * item.quantity).toFixed(2).replace('.', ',');
      itemText += ` = ${itemTotal} €`;

      message += `• ${itemText}\n`;
    });

    // Totals
    message += `\n💰 *Zwischensumme:* ${subtotal.toFixed(2).replace('.', ',')} €\n`;

    if (deliveryFee > 0) {
      message += `🚗 *Liefergebühr:* ${deliveryFee.toFixed(2).replace('.', ',')} €\n`;
    }

    message += `💳 *Gesamtbetrag:* ${total.toFixed(2).replace('.', ',')} €\n`;

    if (data.note) {
      message += `\n📝 *Anmerkung:* ${data.note}`;
    }

    return encodeURIComponent(message);
  }, [orderItems, subtotal, deliveryFee, total, deliveryZones, calculateItemPrice]);



  const onSubmit = async (data: OrderFormData) => {
    if (!canOrder || orderItems.length === 0) return;

    setIsSubmitting(true);

    try {
      const customerInfo: CustomerInfo = {
        name: `${data.firstName} ${data.lastName}`,
        address: data.orderType === 'delivery'
          ? `${data.street} ${data.houseNumber}, ${data.postcode}`
          : 'Abholung',
        phone: data.phone,
        note: data.note,
      };

      await createOrder(orderItems as OrderItem[], customerInfo, total);

      const whatsappMessage = generateWhatsAppMessage(data);
      const whatsappUrl = `https://wa.me/+4915771459166?text=${whatsappMessage}`;

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        try {
          const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
          if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
            window.location.href = whatsappUrl;
          }
        } catch (error) {
          console.error('Error opening WhatsApp:', error);
          window.location.href = whatsappUrl;
        }
      } else {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      setTimeout(() => {
        onClearCart();
        reset();
      }, 1000);

    } catch (error) {
      console.error('Order submission error:', error);
      alert('Fehler beim Speichern der Bestellung. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleQuantityChange = useCallback((item: OrderItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveItem(
        item.menuItem.id,
        {
          selectedSize: item.selectedSize,
          selectedIngredients: item.selectedIngredients,
          selectedExtras: item.selectedExtras,
          selectedPastaType: item.selectedPastaType,
          selectedSauce: item.selectedSauce,
          selectedExclusions: item.selectedExclusions,
          selectedSideDish: item.selectedSideDish,
          selectedDrink: item.selectedDrink,
        }
      );
    } else {
      onUpdateQuantity(
        item.menuItem.id,
        newQuantity,
        {
          selectedSize: item.selectedSize,
          selectedIngredients: item.selectedIngredients,
          selectedExtras: item.selectedExtras,
          selectedPastaType: item.selectedPastaType,
          selectedSauce: item.selectedSauce,
          selectedExclusions: item.selectedExclusions,
          selectedSideDish: item.selectedSideDish,
          selectedDrink: item.selectedDrink,
        }
      );
    }
  }, [onRemoveItem, onUpdateQuantity]);

  const handleRemoveItem = useCallback((item: OrderItem) => {
    onRemoveItem(
      item.menuItem.id,
      {
        selectedSize: item.selectedSize,
        selectedIngredients: item.selectedIngredients,
        selectedExtras: item.selectedExtras,
        selectedPastaType: item.selectedPastaType,
        selectedSauce: item.selectedSauce,
        selectedExclusions: item.selectedExclusions,
        selectedSideDish: item.selectedSideDish,
        selectedDrink: item.selectedDrink,
      }
    );
  }, [onRemoveItem]);

  const handleClearCart = useCallback(() => {
    setIsClearing(true);

    // After 3 seconds, actually clear the cart
    setTimeout(() => {
      onClearCart();
      setIsClearing(false);

      // Close mobile cart if the callback is provided
      if (onCloseMobileCart) {
        onCloseMobileCart();
      }
    }, 3000);
  }, [onClearCart, onCloseMobileCart]);

  // Determine which items to show
  const shouldCollapse = orderItems.length > 2 && !hideTitle; // Only collapse on desktop (when hideTitle is false)
  const itemsToShow = shouldCollapse && !showAllItems ? orderItems.slice(0, 2) : orderItems;

  // Calculate total items count (including quantities)
  const totalItemsCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const visibleItemsCount = shouldCollapse && !showAllItems
    ? itemsToShow.reduce((sum, item) => sum + item.quantity, 0)
    : totalItemsCount;
  const hiddenItemsCount = shouldCollapse && !showAllItems ? totalItemsCount - visibleItemsCount : 0;

  if (!storeStatus.isOpen && orderItems.length === 0) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <Clock className="w-12 h-12 mx-auto text-red-500 mb-3" />
          <h3 className="text-xl font-bold text-red-700 mb-2">Geschlossen</h3>
          <p className="text-red-600 font-medium">{storeStatus.message}</p>
          {storeStatus.deliveryMessage && (
            <p className="text-red-600 font-medium">{storeStatus.deliveryMessage}</p>
          )}
          <p className="text-gray-600 mt-2 text-sm">Sie können derzeit nur vorbestellen.</p>
        </div>
      </div>
    );
  }

  if (orderItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-8">
        <div className="text-center">
          <div className="mb-6">
            <ShoppingCart className="w-10 h-10 mx-auto text-gray-500 stroke-[2.5]" />
          </div>
          <h3 className="text-[1.7rem] font-extrabold text-gray-700 mb-3 leading-tight">Fülle deinen Warenkorb</h3>
          <p className="text-gray-400 text-[1.05rem] leading-relaxed max-w-[280px] mx-auto">Füge einige leckere Gerichte aus der Speisekarte hinzu und bestelle dein Essen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-0 transition-all duration-2000 ${isClearing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      {!hideTitle && (
        <div className="bg-orange-500 text-white p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Warenkorb
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearCart}
                disabled={isClearing}
                className={`flex items-center gap-1 text-white bg-red-500 hover:bg-red-600 transition-all duration-200 px-3 py-1.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg ${isClearing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                title="Warenkorb leeren"
              >
                <Trash2 className="w-4 h-4" />
                {isClearing ? 'Wird geleert...' : 'Leer'}
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Clear Cart Button - Always visible when hideTitle is true */}
        {hideTitle && orderItems.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClearCart}
              disabled={isClearing}
              className={`flex items-center gap-2 text-white bg-red-500 hover:bg-red-600 transition-all duration-200 px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg z-50 ${isClearing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              title="Warenkorb leeren"
            >
              <Trash2 className="w-4 h-4" />
              {isClearing ? 'Wird geleert...' : 'Warenkorb leeren'}
            </button>
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-4">
          {itemsToShow.map((item, index) => (
            <div key={index} className="rounded-xl p-4 shadow-sm border border-orange-100" style={{ backgroundColor: '#fefbf7' }}>
              <div className="space-y-3">
                {/* Item Header */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-base leading-tight">
                    Nr. {item.menuItem.number} {item.menuItem.name}
                  </h4>
                </div>

                {/* Item Details */}
                <div className="space-y-2">
                  {item.selectedSize && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        📏 {item.selectedSize.name}
                        {item.selectedSize.description && ` - ${item.selectedSize.description}`}
                      </span>
                    </div>
                  )}

                  {item.selectedPastaType && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        🍝 {item.selectedPastaType}
                      </span>
                    </div>
                  )}

                  {item.selectedSauce && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        🥄 {item.selectedSauce}
                      </span>
                    </div>
                  )}

                  {item.selectedExclusions && item.selectedExclusions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-600">🥗 Salat-Anpassungen:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.selectedExclusions.map((exclusion, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                            {exclusion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.selectedSideDish && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        🍟 {item.selectedSideDish}
                      </span>
                    </div>
                  )}

                  {item.selectedDrink && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🥤 {item.selectedDrink}
                      </span>
                    </div>
                  )}

                  {item.selectedIngredients && item.selectedIngredients.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-600">🥬 Zutaten:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.selectedIngredients.map((ingredient, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.selectedExtras && item.selectedExtras.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-600">➕ Extras (+{(item.selectedExtras.length * 1.00).toFixed(2)}€):</p>
                      <div className="flex flex-wrap gap-1">
                        {item.selectedExtras.map((extra, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
                            {extra}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price and Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-orange-200">
                  <div className="text-lg font-bold text-orange-600">
                    {(calculateItemPrice(item) * item.quantity).toFixed(2).replace('.', ',')} €
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-orange-200">
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        className="w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>

                      <button
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        className="w-8 h-8 rounded-md bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="w-8 h-8 rounded-md bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Expand/Collapse Button */}
          {shouldCollapse && (
            <div className="text-center">
              <button
                onClick={() => setShowAllItems(!showAllItems)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
              >
                {showAllItems ? (
                  <>
                    <span>Weniger anzeigen</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Alle {totalItemsCount} Artikel anzeigen ({hiddenItemsCount} weitere)</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="rounded-xl p-5 space-y-3 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 text-base mb-3 flex items-center gap-2">
            💰 Bestellübersicht
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-700">Zwischensumme:</span>
              <span className="font-semibold text-gray-900">{subtotal.toFixed(2).replace('.', ',')} €</span>
            </div>

            {deliveryFee > 0 && (
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-700">Liefergebühr:</span>
                <span className="font-semibold text-gray-900">{deliveryFee.toFixed(2).replace('.', ',')} €</span>
              </div>
            )}
          </div>

          <div className="border-t-2 border-orange-300 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Gesamtbetrag:</span>
              <span className="text-xl font-bold text-orange-600 bg-white px-3 py-1 rounded-lg shadow-sm">
                {total.toFixed(2).replace('.', ',')} €
              </span>
            </div>
          </div>

          {minOrderMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-600 font-medium flex items-center gap-2 mb-2">
                ⚠️ {minOrderMessage}
              </p>
              {watchOrderType === 'delivery' && watchDeliveryZone && (() => {
                const zone = deliveryZones.find(z => z.id === watchDeliveryZone);
                if (zone && zone.minOrder > 0) {
                  const progress = Math.min((subtotal / zone.minOrder) * 100, 100);
                  return (
                    <div>
                      <div className="w-full bg-red-200 rounded-full h-2.5 dark:bg-red-200 mb-2">
                        <div
                          className="bg-red-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-red-800 text-center font-medium">
                        Noch {(zone.minOrder - subtotal).toFixed(2).replace('.', ',')} € bis zum Mindestbestellwert
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Order Type */}
          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-900 flex items-center gap-2">
              📦 Bestellart *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 transition-all ${storeStatus.isOpen && !storeStatus.isPickupOpen
                  ? 'opacity-50 grayscale cursor-not-allowed bg-gray-50 border-gray-200'
                  : watchOrderType === 'pickup'
                    ? 'bg-orange-50 border-orange-400 hover:bg-orange-50'
                    : 'hover:bg-orange-50 border-orange-200 bg-[#fefbf7]'
                  }`}
              >
                <input
                  type="radio"
                  value="pickup"
                  disabled={storeStatus.isOpen && !storeStatus.isPickupOpen}
                  {...register('orderType')}
                  className="text-orange-500 focus:ring-orange-500 w-4 h-4 disabled:text-gray-400"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">🏃‍♂️ Abholung</span>
                  {storeStatus.isOpen && !storeStatus.isPickupOpen && <span className="text-xs text-red-500 font-bold">Nicht verfügbar</span>}
                </div>
              </label>

              <label
                className={`flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 transition-all ${storeStatus.isOpen && !storeStatus.isDeliveryOpen
                  ? 'opacity-50 grayscale cursor-not-allowed bg-gray-50 border-gray-200'
                  : watchOrderType === 'delivery'
                    ? 'bg-orange-50 border-orange-400 hover:bg-orange-50'
                    : 'hover:bg-orange-50 border-orange-200 bg-[#fefbf7]'
                  }`}
              >
                <input
                  type="radio"
                  value="delivery"
                  disabled={storeStatus.isOpen && !storeStatus.isDeliveryOpen}
                  {...register('orderType')}
                  className="text-orange-500 focus:ring-orange-500 w-4 h-4 disabled:text-gray-400"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">🚗 Lieferung</span>
                  {storeStatus.isOpen && !storeStatus.isDeliveryOpen && <span className="text-xs text-red-500 font-bold">Nicht verfügbar</span>}
                </div>
              </label>
            </div>
          </div>

          {/* Delivery Zone */}
          {watchOrderType === 'delivery' && (
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-900 flex items-center gap-2">
                🗺️ Liefergebiet *
              </label>
              <select
                {...register('deliveryZone')}
                className="w-full rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500 p-3 text-sm bg-white"
              >
                <option value="">Bitte wählen...</option>
                {deliveryZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} (Min. {zone.minOrder.toFixed(2).replace('.', ',')} €, +{zone.deliveryFee.toFixed(2).replace('.', ',')} € Liefergebühr)
                  </option>
                ))}
              </select>
              {errors.deliveryZone && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  ⚠️ {errors.deliveryZone.message}
                </p>
              )}
            </div>
          )}

          {/* Delivery Address */}
          {watchOrderType === 'delivery' && (
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-900 flex items-center gap-2">
                📍 Lieferadresse *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    {...register('street')}
                    className="w-full rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500 p-3 text-sm bg-white"
                    placeholder="Straße"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    {...register('houseNumber')}
                    className="w-full rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500 p-3 text-sm bg-white"
                    placeholder="Nr."
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    {...register('postcode')}
                    className="w-full rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500 p-3 text-sm bg-white"
                    placeholder="Postleitzahl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Delivery Time */}
          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-900 flex items-center gap-2">
              ⏰ Lieferzeit *
            </label>
            {!storeStatus.isOpen && nextSchedule && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-3">
                <p className="text-sm text-orange-800 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Vorbestellung für {nextSchedule.dayName} ({nextSchedule.open} - {nextSchedule.close} Uhr)
                </p>
              </div>
            )}
            <div className="space-y-3">
              <label className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${!storeStatus.isOpen ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-orange-50'}`}
                style={{
                  backgroundColor: !storeStatus.isOpen ? '#f9fafb' : watchDeliveryTime === 'asap' ? '#fff7ed' : '#fefbf7',
                  borderColor: !storeStatus.isOpen ? '#e5e7eb' : watchDeliveryTime === 'asap' ? '#fb923c' : '#fed7aa'
                }}>
                <input
                  type="radio"
                  value="asap"
                  disabled={!storeStatus.isOpen}
                  {...register('deliveryTime')}
                  className="text-orange-500 focus:ring-orange-500 w-4 h-4 disabled:text-gray-400"
                />
                <span className={`text-sm font-medium ${!storeStatus.isOpen ? 'text-gray-400' : ''}`}>⚡ So schnell wie möglich</span>
              </label>
              <label className={`flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 transition-all hover:bg-orange-50`}
                style={{
                  backgroundColor: watchDeliveryTime === 'specific' ? '#fff7ed' : '#fefbf7',
                  borderColor: watchDeliveryTime === 'specific' ? '#fb923c' : '#fed7aa'
                }}>
                <input
                  type="radio"
                  value="specific"
                  {...register('deliveryTime')}
                  className="text-orange-500 focus:ring-orange-500 w-4 h-4"
                />
                <span className="text-sm font-medium">🕐 {storeStatus.isOpen ? 'Zu bestimmter Zeit' : `Vorbestellung (${nextSchedule?.dayName})`}</span>
              </label>
            </div>

            {watchDeliveryTime === 'specific' && (
              <input
                type="time"
                {...register('specificTime')}
                className="w-full rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500 p-3 text-sm bg-white"
                min={!storeStatus.isOpen && nextSchedule && nextSchedule.isToday ? nextSchedule.open : undefined}
                max={!storeStatus.isOpen && nextSchedule ? nextSchedule.close : undefined}
              />
            )}
            {errors.specificTime && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                ⚠️ {errors.specificTime.message}
              </p>
            )}
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
              👤 Ihre Kontaktdaten
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vorname *
                  </label>
                  <input
                    type="text"
                    {...register('firstName')}
                    className="w-full rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500 p-3 text-sm bg-white"
                    placeholder="Vorname"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      ⚠️ {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nachname *
                  </label>
                  <input
                    type="text"
                    {...register('lastName')}
                    className="w-full rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500 p-3 text-sm bg-white"
                    placeholder="Nachname"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      ⚠️ {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefonnummer *
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500 p-3 text-sm bg-white"
                  placeholder="0123 456789"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    ⚠️ {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anmerkungen (optional)
                </label>
                <textarea
                  {...register('note')}
                  rows={3}
                  className="w-full rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500 p-3 text-sm bg-white resize-none"
                  placeholder="Besondere Wünsche, Allergien, etc."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!canOrder || orderItems.length === 0 || isSubmitting}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all shadow-lg ${canOrder && orderItems.length > 0 && !isSubmitting
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transform hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Bestellung wird gesendet...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Per WhatsApp bestellen
                </>
              )}
            </button>
          </div>
        </form>

        {/* Bottom padding for mobile safe area */}
        <div className="h-6"></div>
      </div>
    </div>
  );
};

export default OrderForm;