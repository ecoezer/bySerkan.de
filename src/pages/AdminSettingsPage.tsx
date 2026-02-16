import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock, Power, ShieldAlert, MapPin, Plus, Trash2, Edit2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getStoreSettings, updateStoreSettings, StoreSettings, DEFAULT_SETTINGS, DEFAULT_SCHEDULE, WeekSchedule, DeliveryZone } from '../services/settingsService';
import { cleanupDuplicateCategories } from '../services/cleanupService';
import { Notification } from '../components/Notification';
import { ConfirmationModal } from '../components/ConfirmationModal';

const SettingsSection = ({
    id,
    title,
    icon: Icon,
    colorClass,
    children,
    activeSection,
    onToggle
}: {
    id: string;
    title: string;
    icon: React.ElementType;
    colorClass: string;
    children: React.ReactNode;
    activeSection: string | null;
    onToggle: (id: string) => void;
}) => {
    const isOpen = activeSection === id;

    return (
        <div className="bg-[#2a3648] rounded-xl shadow-lg border border-gray-700 overflow-hidden transition-all duration-300">
            <button
                onClick={() => onToggle(id)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-700/30 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${colorClass}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-lg font-semibold text-white">{title}</h2>
                        {!isOpen && <p className="text-gray-400 text-sm">Klicken zum Bearbeiten</p>}
                    </div>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {isOpen && (
                <div className="p-6 border-t border-gray-700 animate-fade-in">
                    {children}
                </div>
            )}
        </div>
    );
};

const AdminSettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);



    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
    const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
    const [zoneToDelete, setZoneToDelete] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const days: (keyof WeekSchedule)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const germanDays: Record<string, string> = {
        monday: 'Montag',
        tuesday: 'Dienstag',
        wednesday: 'Mittwoch',
        thursday: 'Donnerstag',
        friday: 'Freitag',
        saturday: 'Samstag',
        sunday: 'Sonntag'
    };

    const toggleSection = (section: string) => {
        setActiveSection(prev => prev === section ? null : section);
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getStoreSettings();
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings', error);
            setNotification({ message: 'Einstellungen konnten nicht geladen werden', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateStoreSettings(settings);
            setNotification({ message: 'Einstellungen erfolgreich gespeichert!', type: 'success' });
        } catch (error) {
            console.error('Failed to save settings', error);
            setNotification({ message: 'Fehler beim Speichern', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const toggleDayOpen = (day: keyof WeekSchedule) => {
        setSettings(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [day]: {
                    ...prev.schedule[day],
                    isOpen: !prev.schedule[day].isOpen
                }
            }
        }));
    };

    const handleScheduleChange = (day: keyof WeekSchedule, field: 'open' | 'close', value: string) => {
        setSettings(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [day]: {
                    ...prev.schedule[day],
                    [field]: value
                }
            }
        }));
    };
    const handleDeliveryScheduleChange = (day: keyof WeekSchedule, field: 'open' | 'close', value: string) => {
        setSettings(prev => ({
            ...prev,
            deliverySchedule: {
                ...prev.deliverySchedule,
                [day]: {
                    ...prev.deliverySchedule[day],
                    [field]: value
                }
            }
        }));
    };

    const toggleDeliveryDayOpen = (day: keyof WeekSchedule) => {
        setSettings(prev => ({
            ...prev,
            deliverySchedule: {
                ...prev.deliverySchedule,
                [day]: {
                    ...prev.deliverySchedule[day],
                    isOpen: !prev.deliverySchedule[day].isOpen
                }
            }
        }));
    };

    const handleCleanup = async () => {
        if (!window.confirm('Möchten Sie die Datenbank auf Fehler (Duplikate) prüfen und reparieren?')) return;

        setLoading(true);
        try {
            const result = await cleanupDuplicateCategories();
            setNotification({
                message: result.message,
                type: result.success ? 'success' : 'error'
            });
        } catch (error) {
            setNotification({ message: 'Reparatur fehlgeschlagen', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // ... (existing code until Opening Hours section) ...

    {/* Opening Hours */ }
    <SettingsSection
        id="schedule"
        title="Öffnungszeiten"
        icon={Clock}
        colorClass="bg-orange-500/20 text-orange-400"
        activeSection={activeSection}
        onToggle={toggleSection}
    >
        <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-600">
                Häkchen = Geöffnet • Leer = Ruhetag
            </span>
        </div>

        <div className="space-y-4">
            {days.map(day => (
                <div key={day} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${settings.schedule[day].isOpen ? 'bg-[#1a2332]' : 'bg-[#1a2332]/50 border border-red-900/30'}`}>
                    <div className="flex items-center gap-4 w-48 group cursor-pointer" onClick={() => toggleDayOpen(day)}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.schedule[day].isOpen ? 'bg-orange-500 border-orange-500' : 'bg-gray-700 border-gray-600'}`}>
                            {settings.schedule[day].isOpen && <div className="w-2 h-2 bg-white rounded-sm" />}
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-white capitalize font-medium ${!settings.schedule[day].isOpen && 'text-gray-500'}`}>{germanDays[day]}</span>
                            <span className={`text-xs ${settings.schedule[day].isOpen ? 'text-green-400' : 'text-red-400 font-bold'}`}>
                                {settings.schedule[day].isOpen ? 'Geöffnet' : 'Ruhetag'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-1 justify-end">
                        {settings.schedule[day].isOpen ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm w-8">Von</span>
                                    <input
                                        type="time"
                                        value={settings.schedule[day].open}
                                        onChange={(e) => handleScheduleChange(day, 'open', e.target.value)}
                                        className="bg-gray-700 text-white rounded px-3 py-1.5 focus:ring-2 focus:ring-orange-500 outline-none hover:bg-gray-600 transition-colors"
                                    />
                                </div>
                                <span className="text-gray-500">-</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm w-8">Bis</span>
                                    <input
                                        type="time"
                                        value={settings.schedule[day].close}
                                        onChange={(e) => handleScheduleChange(day, 'close', e.target.value)}
                                        className="bg-gray-700 text-white rounded px-3 py-1.5 focus:ring-2 focus:ring-orange-500 outline-none hover:bg-gray-600 transition-colors"
                                    />
                                </div>
                            </>
                        ) : (
                            <span className="text-red-400 font-medium italic pr-12">Ruhetag (Geschlossen)</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </SettingsSection>



    const handleDeleteZone = (zoneId: string) => {
        setZoneToDelete(zoneId);
    };

    const confirmDeleteZone = () => {
        if (!zoneToDelete) return;

        setSettings(prev => ({
            ...prev,
            deliveryZones: prev.deliveryZones.filter(z => z.id !== zoneToDelete)
        }));
        setZoneToDelete(null);
        setNotification({ message: 'Liefergebiet gelöscht', type: 'success' });
    };

    const handleSaveZone = () => {
        if (!editingZone) return;

        setSettings(prev => {
            const existingIndex = prev.deliveryZones.findIndex(z => z.id === editingZone.id);
            if (existingIndex >= 0) {
                // Update
                const newZones = [...prev.deliveryZones];
                newZones[existingIndex] = editingZone;
                return { ...prev, deliveryZones: newZones };
            } else {
                // Add
                return { ...prev, deliveryZones: [...prev.deliveryZones, editingZone] };
            }
        });
        setIsZoneModalOpen(false);
        setEditingZone(null);
    };

    const openZoneModal = (zone?: DeliveryZone) => {
        if (zone) {
            setEditingZone(zone);
        } else {
            setEditingZone({
                id: crypto.randomUUID(),
                name: '',
                zipCode: '',
                minOrder: 20,
                deliveryFee: 0
            });
        }
        setIsZoneModalOpen(true);
    };



    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a2332] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a2332]">
            <header className="bg-[#1a2332] border-b border-gray-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin/dashboard')}
                                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-bold text-white">Öffnungszeiten & Einstellungen</h1>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={`flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium ${saving ? 'opacity-50' : ''}`}
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Speichern...' : 'Speichern'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Store Status (Split Delivery/Pickup) */}
                <SettingsSection
                    id="status"
                    title="Geschäftsstatus"
                    icon={Power}
                    colorClass="bg-green-500/20 text-green-400"
                    activeSection={activeSection}
                    onToggle={toggleSection}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Delivery Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                            <div>
                                <h3 className="font-medium text-white mb-1">🚗 Lieferservice</h3>
                                <p className={`text-sm ${settings.isDeliveryAvailable ? 'text-green-400' : 'text-red-400'}`}>
                                    {settings.isDeliveryAvailable ? 'AKTIV' : 'PAUSIERT'}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    const newValue = !settings.isDeliveryAvailable;
                                    setSettings(prev => ({
                                        ...prev,
                                        isDeliveryAvailable: newValue,
                                        // Set date if turning OFF, clear if ON
                                        pausedDateDelivery: newValue ? null : new Date().toISOString().split('T')[0]
                                    }));
                                }}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.isDeliveryAvailable ? 'bg-green-500' : 'bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.isDeliveryAvailable ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Pickup Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                            <div>
                                <h3 className="font-medium text-white mb-1">🏃‍♂️ Abholung</h3>
                                <p className={`text-sm ${settings.isPickupAvailable ? 'text-green-400' : 'text-red-400'}`}>
                                    {settings.isPickupAvailable ? 'AKTIV' : 'PAUSIERT'}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    const newValue = !settings.isPickupAvailable;
                                    setSettings(prev => ({
                                        ...prev,
                                        isPickupAvailable: newValue,
                                        pausedDatePickup: newValue ? null : new Date().toISOString().split('T')[0]
                                    }));
                                }}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.isPickupAvailable ? 'bg-green-500' : 'bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.isPickupAvailable ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                    <p className="mt-4 text-gray-400 text-sm">
                        Hinweis: Wenn Sie einen Service pausieren, wird er automatisch am nächsten regulären Arbeitstag wieder aktiviert.
                    </p>
                </SettingsSection>

                {/* Delivery Zones Management */}
                <SettingsSection
                    id="zones"
                    title="Liefergebiete"
                    icon={MapPin}
                    colorClass="bg-orange-500/20 text-orange-400"
                    activeSection={activeSection}
                    onToggle={toggleSection}
                >
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-400 text-sm">Verwalten Sie hier Ihre Liefergebiete und Konditionen.</p>
                        <button
                            onClick={() => openZoneModal()}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Gebiet hinzufügen
                        </button>
                    </div>

                    <div className="space-y-3">
                        {settings.deliveryZones && settings.deliveryZones.length > 0 ? (
                            settings.deliveryZones.map(zone => (
                                <div key={zone.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                                        <div>
                                            <div className="text-xs text-gray-400 mb-1">PLZ / Ort</div>
                                            <div className="font-medium text-white">{zone.zipCode} {zone.name}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 mb-1">Mindestbestellwert</div>
                                            <div className="font-medium text-white">{zone.minOrder.toFixed(2).replace('.', ',')} €</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 mb-1">Liefergebühr</div>
                                            <div className="font-medium text-white">{zone.deliveryFee.toFixed(2).replace('.', ',')} €</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => openZoneModal(zone)}
                                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                            title="Bearbeiten"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteZone(zone.id)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Löschen"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-xl">
                                <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">Noch keine Liefergebiete definiert.</p>
                                <p className="text-gray-500 text-sm mt-1">Fügen Sie Ihr erstes Liefergebiet hinzu.</p>
                            </div>
                        )}
                    </div>
                </SettingsSection>

                {/* Database Maintenance */}
                <SettingsSection
                    id="database"
                    title="Datenbank Reparatur"
                    icon={ShieldAlert}
                    colorClass="bg-red-500/20 text-red-400"
                    activeSection={activeSection}
                    onToggle={toggleSection}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-300 mb-2">
                                Nutzen Sie diese Funktion, wenn Probleme mit doppelten Kategorien oder leeren Menüs auftreten.
                            </p>
                            <p className="text-gray-400 text-sm">
                                Das System wird versuchen, die Datenbankstruktur zu bereinigen und wiederherzustellen.
                            </p>
                        </div>
                        <button
                            onClick={handleCleanup}
                            className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors font-medium text-sm whitespace-nowrap ml-4"
                        >
                            Verbindung Reparieren
                        </button>
                    </div>
                </SettingsSection>

                {/* Address & Contact */}
                <SettingsSection
                    id="address"
                    title="Adresse & Kontakt"
                    icon={MapPin}
                    colorClass="bg-blue-500/20 text-blue-400"
                    activeSection={activeSection}
                    onToggle={toggleSection}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Straße & Hausnummer</label>
                            <input
                                type="text"
                                value={settings.address?.street || ''}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    address: { ...prev.address, street: e.target.value }
                                }))}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none border border-gray-600"
                                placeholder="z.B. Frankfurter Str. 7"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Postleitzahl</label>
                            <input
                                type="text"
                                value={settings.address?.zip || ''}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    address: { ...prev.address, zip: e.target.value }
                                }))}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none border border-gray-600"
                                placeholder="z.B. 38729"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Stadt</label>
                            <input
                                type="text"
                                value={settings.address?.city || ''}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    address: { ...prev.address, city: e.target.value }
                                }))}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none border border-gray-600"
                                placeholder="z.B. Lutter am Barenberge"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Telefonnummer (WhatsApp)</label>
                            <input
                                type="text"
                                value={settings.address?.phone || ''}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    address: { ...prev.address, phone: e.target.value }
                                }))}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none border border-gray-600"
                                placeholder="z.B. +491781555888"
                            />
                        </div>
                    </div>
                </SettingsSection>

                {/* Opening Hours */}
                <SettingsSection
                    id="schedule"
                    title="Öffnungszeiten"
                    icon={Clock}
                    colorClass="bg-orange-500/20 text-orange-400"
                    activeSection={activeSection}
                    onToggle={toggleSection}
                >
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-600">
                            Häkchen = Geöffnet • Leer = Ruhetag
                        </span>
                    </div>

                    <div className="space-y-4">
                        {days.map(day => (
                            <div key={day} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${settings.schedule[day].isOpen ? 'bg-[#1a2332]' : 'bg-[#1a2332]/50 border border-red-900/30'}`}>
                                <div className="flex items-center gap-4 w-48 group cursor-pointer" onClick={() => toggleDayOpen(day)}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${settings.schedule[day].isOpen ? 'bg-orange-500 border-orange-500' : 'bg-gray-700 border-gray-600'}`}>
                                        {settings.schedule[day].isOpen && <div className="w-2 h-2 bg-white rounded-sm" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-white capitalize font-medium ${!settings.schedule[day].isOpen && 'text-gray-500'}`}>{germanDays[day]}</span>
                                        <span className={`text-xs ${settings.schedule[day].isOpen ? 'text-green-400' : 'text-red-400 font-bold'}`}>
                                            {settings.schedule[day].isOpen ? 'Geöffnet' : 'Ruhetag'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 flex-1 justify-end">
                                    {settings.schedule[day].isOpen ? (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 text-sm w-8">Von</span>
                                                <input
                                                    type="time"
                                                    value={settings.schedule[day].open}
                                                    onChange={(e) => handleScheduleChange(day, 'open', e.target.value)}
                                                    className="bg-gray-700 text-white rounded px-3 py-1.5 focus:ring-2 focus:ring-orange-500 outline-none hover:bg-gray-600 transition-colors"
                                                />
                                            </div>
                                            <span className="text-gray-500">-</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 text-sm w-8">Bis</span>
                                                <input
                                                    type="time"
                                                    value={settings.schedule[day].close}
                                                    onChange={(e) => handleScheduleChange(day, 'close', e.target.value)}
                                                    className="bg-gray-700 text-white rounded px-3 py-1.5 focus:ring-2 focus:ring-orange-500 outline-none hover:bg-gray-600 transition-colors"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-red-400 font-medium italic pr-12">Ruhetag (Geschlossen)</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </SettingsSection>

                {/* Delivery Hours - NEW SECTION */}
                <SettingsSection
                    id="deliverySchedule"
                    title="Lieferzeiten"
                    icon={Clock}
                    colorClass="bg-blue-500/20 text-blue-400"
                    activeSection={activeSection}
                    onToggle={toggleSection}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col gap-1">
                            <p className="text-gray-300">Konfigurieren Sie hier abweichende Zeiten für den Lieferservice.</p>
                            <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-600 w-fit">
                                Häkchen = Lieferung aktiv • Leer = Keine Lieferung
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {(settings.deliverySchedule || DEFAULT_SCHEDULE) && days.map(day => {
                            // Fallback to default if individual day is missing (safety check)
                            const daySchedule = settings.deliverySchedule?.[day] || DEFAULT_SCHEDULE[day];
                            const isOpen = daySchedule.isOpen;

                            return (
                                <div key={day} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${isOpen ? 'bg-[#1a2332]' : 'bg-[#1a2332]/50 border border-red-900/30'}`}>
                                    <div className="flex items-center gap-4 w-48 group cursor-pointer" onClick={() => toggleDeliveryDayOpen(day)}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-500 border-blue-500' : 'bg-gray-700 border-gray-600'}`}>
                                            {isOpen && <div className="w-2 h-2 bg-white rounded-sm" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-white capitalize font-medium ${!isOpen && 'text-gray-500'}`}>{germanDays[day]}</span>
                                            <span className={`text-xs ${isOpen ? 'text-green-400' : 'text-red-400 font-bold'}`}>
                                                {isOpen ? 'Lieferung' : 'Keine Lieferung'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 flex-1 justify-end">
                                        {isOpen ? (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400 text-sm w-8">Von</span>
                                                    <input
                                                        type="time"
                                                        value={daySchedule.open}
                                                        onChange={(e) => handleDeliveryScheduleChange(day, 'open', e.target.value)}
                                                        className="bg-gray-700 text-white rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-600 transition-colors"
                                                    />
                                                </div>
                                                <span className="text-gray-500">-</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400 text-sm w-8">Bis</span>
                                                    <input
                                                        type="time"
                                                        value={daySchedule.close}
                                                        onChange={(e) => handleDeliveryScheduleChange(day, 'close', e.target.value)}
                                                        className="bg-gray-700 text-white rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none hover:bg-gray-600 transition-colors"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-red-400 font-medium italic pr-12">Keine Lieferung</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </SettingsSection>

            </main>

            {isZoneModalOpen && editingZone && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[#2a3648] rounded-xl shadow-xl w-full max-w-md border border-gray-700">
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h3 className="text-lg font-bold text-white">
                                {settings.deliveryZones.some(z => z.id === editingZone.id) ? 'Liefergebiet bearbeiten' : 'Neues Liefergebiet'}
                            </h3>
                            <button
                                onClick={() => setIsZoneModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">PLZ</label>
                                    <input
                                        type="text"
                                        value={editingZone.zipCode}
                                        onChange={(e) => setEditingZone({ ...editingZone, zipCode: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        placeholder="38729"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Ort</label>
                                    <input
                                        type="text"
                                        value={editingZone.name}
                                        onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        placeholder="Lutter"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Mindestbestellwert (€)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.50"
                                            value={editingZone.minOrder}
                                            onChange={(e) => setEditingZone({ ...editingZone, minOrder: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-gray-700 text-white rounded-lg pl-3 pr-8 py-2 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                        <span className="absolute right-3 top-2 text-gray-400">€</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Liefergebühr (€)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.50"
                                            value={editingZone.deliveryFee}
                                            onChange={(e) => setEditingZone({ ...editingZone, deliveryFee: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-gray-700 text-white rounded-lg pl-3 pr-8 py-2 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        />
                                        <span className="absolute right-3 top-2 text-gray-400">€</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => setIsZoneModalOpen(false)}
                                className="px-4 py-2 text-gray-300 hover:text-white font-medium hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleSaveZone}
                                disabled={!editingZone.name}
                                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Speichern
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <ConfirmationModal
                isOpen={!!zoneToDelete}
                title="Liefergebiet löschen"
                message="Sind Sie sicher, dass Sie dieses Liefergebiet löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
                confirmText="Löschen"
                cancelText="Abbrechen"
                onConfirm={confirmDeleteZone}
                onCancel={() => setZoneToDelete(null)}
                isDestructive={true}
            />
        </div>
    );
};

export default AdminSettingsPage;
