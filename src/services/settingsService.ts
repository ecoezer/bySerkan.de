import { supabase } from '../lib/supabase';

export interface DaySchedule {
    isOpen: boolean;
    open: string;
    close: string;
}

export interface WeekSchedule {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
}

export interface AddressSettings {
    street: string;
    city: string;
    zip: string;
    phone: string;
}

export interface DeliveryZone {
    id: string;
    name: string;
    zipCode: string;
    minOrder: number;
    deliveryFee: number;
}

export interface StoreSettings {
    isOpen: boolean;
    isDeliveryAvailable: boolean;
    isPickupAvailable: boolean;
    pausedDateDelivery?: string | null;
    pausedDatePickup?: string | null;
    schedule: WeekSchedule;
    deliverySchedule: WeekSchedule;
    address: AddressSettings;
    deliveryZones: DeliveryZone[];
}

const STORE_ID = 'store';

export const DEFAULT_SCHEDULE: WeekSchedule = {
    monday: { isOpen: true, open: '12:00', close: '22:00' },
    tuesday: { isOpen: true, open: '12:00', close: '22:00' },
    wednesday: { isOpen: true, open: '12:00', close: '22:00' },
    thursday: { isOpen: true, open: '12:00', close: '22:00' },
    friday: { isOpen: true, open: '12:00', close: '23:00' },
    saturday: { isOpen: true, open: '12:00', close: '23:00' },
    sunday: { isOpen: true, open: '12:00', close: '22:00' },
};

export const DEFAULT_DELIVERY_SCHEDULE: WeekSchedule = {
    monday: { isOpen: true, open: '12:00', close: '22:00' },
    tuesday: { isOpen: true, open: '12:00', close: '22:00' },
    wednesday: { isOpen: true, open: '12:00', close: '22:00' },
    thursday: { isOpen: true, open: '12:00', close: '22:00' },
    friday: { isOpen: true, open: '12:00', close: '23:00' },
    saturday: { isOpen: true, open: '12:00', close: '23:00' },
    sunday: { isOpen: true, open: '12:00', close: '22:00' },
};

export const DEFAULT_ZONES: DeliveryZone[] = [
    { id: 'lutter', name: 'Lutter am Barenberge', zipCode: '38729', minOrder: 15, deliveryFee: 0 },
    { id: 'ostlutter', name: 'Ostlutter', zipCode: '38729', minOrder: 20, deliveryFee: 0 },
    { id: 'wallmoden', name: 'Wallmoden', zipCode: '38729', minOrder: 20, deliveryFee: 0 },
    { id: 'alt-wallmoden', name: 'Alt Wallmoden', zipCode: '38729', minOrder: 20, deliveryFee: 0 },
    { id: 'neuwallmoden', name: 'Neuwallmoden', zipCode: '38729', minOrder: 20, deliveryFee: 0 },
    { id: 'nauen', name: 'Nauen', zipCode: '38729', minOrder: 20, deliveryFee: 0 },
    { id: 'hahausen', name: 'Hahausen', zipCode: '38729', minOrder: 20, deliveryFee: 0 },
    { id: 'bodenstein', name: 'Bodenstein', zipCode: '38729', minOrder: 20, deliveryFee: 0 },
    { id: 'rhode', name: 'Rhode', zipCode: '38729', minOrder: 20, deliveryFee: 0 },
    { id: 'sehlde', name: 'Sehlde', zipCode: '38729', minOrder: 20, deliveryFee: 0 }
];

export const DEFAULT_SETTINGS: StoreSettings = {
    isOpen: true,
    isDeliveryAvailable: true,
    isPickupAvailable: true,
    pausedDateDelivery: null,
    pausedDatePickup: null,
    schedule: DEFAULT_SCHEDULE,
    deliverySchedule: DEFAULT_DELIVERY_SCHEDULE,
    address: {
        street: 'Frankfurter Str. 7',
        zip: '38729',
        city: 'Lutter am Barenberge',
        phone: '+4915771459166'
    },
    deliveryZones: DEFAULT_ZONES
};

export async function getStoreSettings(): Promise<StoreSettings> {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('id', STORE_ID)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // Not found
                await supabase.from('settings').upsert({
                    id: STORE_ID,
                    is_open: DEFAULT_SETTINGS.isOpen,
                    is_delivery_available: DEFAULT_SETTINGS.isDeliveryAvailable,
                    is_pickup_available: DEFAULT_SETTINGS.isPickupAvailable,
                    schedule: DEFAULT_SETTINGS.schedule,
                    delivery_schedule: DEFAULT_SETTINGS.deliverySchedule,
                    address: DEFAULT_SETTINGS.address,
                    delivery_zones: DEFAULT_SETTINGS.deliveryZones
                });
                return DEFAULT_SETTINGS;
            }
            throw error;
        }

        return {
            isOpen: data.is_open,
            isDeliveryAvailable: data.is_delivery_available,
            isPickupAvailable: data.is_pickup_available,
            pausedDateDelivery: data.paused_date_delivery,
            pausedDatePickup: data.paused_date_pickup,
            schedule: data.schedule,
            deliverySchedule: data.delivery_schedule || DEFAULT_DELIVERY_SCHEDULE,
            address: data.address,
            deliveryZones: data.delivery_zones || DEFAULT_ZONES
        };
    } catch (error) {
        console.error('Error fetching store settings:', error);
        return DEFAULT_SETTINGS;
    }
}

export async function updateStoreSettings(settings: StoreSettings): Promise<void> {
    const { error } = await supabase
        .from('settings')
        .upsert({
            id: STORE_ID,
            is_open: settings.isOpen,
            is_delivery_available: settings.isDeliveryAvailable,
            is_pickup_available: settings.isPickupAvailable,
            paused_date_delivery: settings.pausedDateDelivery,
            paused_date_pickup: settings.pausedDatePickup,
            schedule: settings.schedule,
            delivery_schedule: settings.deliverySchedule,
            address: settings.address,
            delivery_zones: settings.deliveryZones,
            updated_at: new Date().toISOString()
        });

    if (error) throw error;
}

export function isStoreOpen(settings: StoreSettings): {
    isOpen: boolean;
    isDeliveryOpen: boolean;
    isPickupOpen: boolean;
    message?: string;
    deliveryMessage?: string;
    nextOpen?: string;
    nextDeliveryOpen?: string;
} {
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const germanDays: Record<string, string> = {
        monday: 'Montag',
        tuesday: 'Dienstag',
        wednesday: 'Mittwoch',
        thursday: 'Donnerstag',
        friday: 'Freitag',
        saturday: 'Samstag',
        sunday: 'Sonntag'
    };

    const currentDayIndex = now.getDay();
    const currentDayName = days[currentDayIndex] as keyof WeekSchedule;
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const todayStr = now.toISOString().split('T')[0];

    // Determine effective status (Auto-Reset)
    let isDeliveryAvailable = settings.isDeliveryAvailable ?? true;
    let isPickupAvailable = settings.isPickupAvailable ?? true;

    if (!isDeliveryAvailable && settings.pausedDateDelivery && settings.pausedDateDelivery !== todayStr) {
        isDeliveryAvailable = true;
    }
    if (!isPickupAvailable && settings.pausedDatePickup && settings.pausedDatePickup !== todayStr) {
        isPickupAvailable = true;
    }

    if (isDeliveryAvailable === false && isPickupAvailable === false) {
        return {
            isOpen: false,
            isDeliveryOpen: false,
            isPickupOpen: false,
            message: 'Momentan keine Bestellannahme'
        };
    }

    // --- Helper to calculate next open time for a given schedule ---
    const getNextTime = (schedule: WeekSchedule) => {
        const daySchedule = schedule[currentDayName];
        if (!daySchedule.isOpen) {
            // Check next day
            const nextDayIndex = (currentDayIndex + 1) % 7;
            const nextDayName = days[nextDayIndex] as keyof WeekSchedule;
            const nextDaySchedule = schedule[nextDayName];
            if (nextDaySchedule.isOpen) return `Morgen ${nextDaySchedule.open} Uhr`;
            return 'Demnächst';
        }

        const [openHour, openMinute] = daySchedule.open.split(':').map(Number);
        const openTime = openHour * 60 + openMinute;
        const [closeHour, closeMinute] = daySchedule.close.split(':').map(Number);
        const closeTime = closeHour * 60 + closeMinute;

        if (currentTime < openTime) return `Heute ${daySchedule.open} Uhr`;
        if (currentTime >= closeTime) {
            // Check next day
            const nextDayIndex = (currentDayIndex + 1) % 7;
            const nextDayName = days[nextDayIndex] as keyof WeekSchedule;
            const nextDaySchedule = schedule[nextDayName];
            if (nextDaySchedule.isOpen) return `Morgen ${nextDaySchedule.open} Uhr`;
            return 'Demnächst';
        }
        return `Heute ${daySchedule.open} Uhr`; // Should not reach here if open
    };

    // --- Check Main Schedule (Pickup) ---
    const mainSchedule = settings.schedule[currentDayName];
    const [openHour, openMinute] = mainSchedule.open.split(':').map(Number);
    const openTime = openHour * 60 + openMinute;
    const [closeHour, closeMinute] = mainSchedule.close.split(':').map(Number);
    const closeTime = closeHour * 60 + closeMinute;

    let scheduleOpen = true;
    let message = '';
    let nextOpen = '';

    if (!mainSchedule.isOpen) {
        scheduleOpen = false;
        message = `Heute (${germanDays[currentDayName]}) Ruhetag`;
        nextOpen = getNextTime(settings.schedule);
    } else if (currentTime < openTime) {
        scheduleOpen = false;
        message = `Heute geöffnet: ${mainSchedule.open} - ${mainSchedule.close} Uhr`;
        nextOpen = `Heute ${mainSchedule.open} Uhr`;
    } else if (currentTime >= closeTime) {
        scheduleOpen = false;
        message = `Heute geöffnet: ${mainSchedule.open} - ${mainSchedule.close} Uhr`;
        nextOpen = getNextTime(settings.schedule);
    }

    // --- Check Delivery Schedule ---
    let nextDeliveryOpen = undefined;
    let deliveryMessage = undefined;

    if (settings.deliverySchedule) {
        const todayDelivery = settings.deliverySchedule[currentDayName];
        if (todayDelivery.isOpen) {
            deliveryMessage = `Lieferzeit: ${todayDelivery.open} - ${todayDelivery.close} Uhr`;
        }
    }

    if (!scheduleOpen && settings.deliverySchedule) {
        nextDeliveryOpen = getNextTime(settings.deliverySchedule);
    }

    if (!scheduleOpen) {
        return {
            isOpen: false,
            isDeliveryOpen: false,
            isPickupOpen: false,
            message,
            deliveryMessage,
            nextOpen,
            nextDeliveryOpen
        };
    }

    return {
        isOpen: true,
        isDeliveryOpen: isDeliveryAvailable,
        isPickupOpen: isPickupAvailable
    };
}

export function getNextAvailableSchedule(settings: StoreSettings, orderType: 'pickup' | 'delivery' = 'pickup'): {
    dayName: string;
    open: string;
    close: string;
    isToday: boolean;
} {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const germanDays: Record<string, string> = {
        monday: 'Montag',
        tuesday: 'Dienstag',
        wednesday: 'Mittwoch',
        thursday: 'Donnerstag',
        friday: 'Freitag',
        saturday: 'Samstag',
        sunday: 'Sonntag'
    };

    const now = new Date();
    const currentDayIndex = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Select the correct schedule based on order type
    const targetSchedule = orderType === 'delivery' && settings.deliverySchedule
        ? settings.deliverySchedule
        : settings.schedule;

    // Check if store will open later today
    const todayName = days[currentDayIndex] as keyof WeekSchedule;
    const todaySchedule = targetSchedule[todayName]; // Use targetStructure
    const [openHour, openMinute] = todaySchedule.open.split(':').map(Number);
    const openTime = openHour * 60 + openMinute;

    if (todaySchedule.isOpen && currentTime < openTime) {
        return {
            dayName: germanDays[todayName],
            open: todaySchedule.open,
            close: todaySchedule.close,
            isToday: true
        };
    }

    // Check next 7 days
    for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (currentDayIndex + i) % 7;
        const nextDayName = days[nextDayIndex] as keyof WeekSchedule;
        const nextDaySchedule = targetSchedule[nextDayName]; // Use targetStructure

        if (nextDaySchedule.isOpen) {
            return {
                dayName: i === 1 ? 'Morgen' : germanDays[nextDayName],
                open: nextDaySchedule.open,
                close: nextDaySchedule.close,
                isToday: false
            };
        }
    }

    return {
        dayName: 'Demnächst',
        open: '11:00',
        close: '22:00',
        isToday: false
    };
}
