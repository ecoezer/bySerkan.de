import { useState, useEffect } from 'react';
import { getStoreSettings, isStoreOpen, getNextAvailableSchedule } from '../services/settingsService';
import type { StoreSettings } from '../types';

export interface StoreStatus {
    isOpen: boolean;
    isDeliveryOpen: boolean;
    isPickupOpen: boolean;
    message?: string;
    deliveryMessage?: string;
    nextOpen?: string;
    nextDeliveryOpen?: string;
}

export function useStoreStatus(orderType: 'pickup' | 'delivery' = 'pickup') {
    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [storeStatus, setStoreStatus] = useState<StoreStatus>({
        isOpen: true,
        isDeliveryOpen: true,
        isPickupOpen: true
    });
    const [nextSchedule, setNextSchedule] = useState<{ dayName: string; open: string; close: string; isToday: boolean } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const currentSettings = await getStoreSettings();
                setSettings(currentSettings);

                const status = isStoreOpen(currentSettings);
                // Ensure legacy support if isDelivery/Pickup keys are missing in return type of isStoreOpen
                const fullStatus: StoreStatus = {
                    isOpen: status.isOpen,
                    isDeliveryOpen: (status as { isDeliveryOpen?: boolean }).isDeliveryOpen ?? true,
                    isPickupOpen: (status as { isPickupOpen?: boolean }).isPickupOpen ?? true,
                    message: status.message,
                    deliveryMessage: status.deliveryMessage,
                    nextOpen: status.nextOpen,
                    nextDeliveryOpen: status.nextDeliveryOpen
                };

                setStoreStatus(fullStatus);

                const next = getNextAvailableSchedule(currentSettings, orderType);
                setNextSchedule(next);
            } catch (error) {
                console.error('Failed to check store status:', error);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
        // Poll every minute
        const interval = setInterval(checkStatus, 60000);
        return () => clearInterval(interval);
    }, [orderType]);

    return { settings, storeStatus, nextSchedule, loading };
}
