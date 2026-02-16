import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Copy, GripVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Notification } from '../components/Notification';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface Category {
    id: string;
    title: string;
    description: string;
    order: number;
    slug: string;
}

interface MenuItem {
    id: string;
    category_id: string;
    name: string;
    description: string;
    price: number;
    number: number;
    allergens?: string;
    order?: number;
    category_slug?: string;
}

const AdminMenuPage: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Edit States
    const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
    const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'delete-category' | 'delete-item' | 'duplicate-item';
        itemId?: string;
        categoryId?: string;
        item?: MenuItem;
        title: string;
        message: string;
    } | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch Categories
            const { data: cats, error: catError } = await supabase
                .from('categories')
                .select('*')
                .order('order');

            if (catError) throw catError;
            setCategories(cats || []);

            if (cats && cats.length > 0 && !selectedCategory) {
                setSelectedCategory(cats[0].id);
            }

            // Fetch Items
            const { data: items, error: itemError } = await supabase
                .from('menu_items')
                .select('*')
                .order('number');

            if (itemError) throw itemError;

            // Sort by order if available, else by number
            const sortedItems = [...(items || [])].sort((a, b) => (a.order ?? a.number) - (b.order ?? b.number));
            setMenuItems(sortedItems);
        } catch (error) {
            console.error('Error fetching menu data:', error);
            showNotification('Fehler beim Laden der Daten', 'error');
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, showNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        const isDuplicate = categories.some(
            cat => cat.title.trim().toLowerCase() === editingCategory.title?.trim().toLowerCase() && cat.id !== editingCategory.id
        );

        if (isDuplicate) {
            showNotification(`Kategorie "${editingCategory.title}" existiert bereits!`, 'error');
            return;
        }

        try {
            // Custom UUID generator for non-secure contexts where crypto.randomUUID might be missing
            const uuidv4 = () => {
                if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                    return crypto.randomUUID();
                }
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };

            if (editingCategory.id) {
                const { error } = await supabase
                    .from('categories')
                    .update({
                        title: editingCategory.title,
                        description: editingCategory.description,
                        order: editingCategory.order
                    })
                    .eq('id', editingCategory.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert({
                        id: uuidv4(),
                        title: editingCategory.title,
                        description: editingCategory.description,
                        order: categories.length,
                        slug: editingCategory.title?.toLowerCase().trim().replace(/\s+/g, '-')
                    });
                if (error) throw error;
            }
            showNotification(editingCategory.id ? 'Kategorie aktualisiert' : 'Kategorie hinzugefügt');
            setEditingCategory(null);
            setIsAddingCategory(false);
            fetchData();
        } catch (error: unknown) {
            console.error('Error saving category:', error);
            showNotification('Fehler beim Speichern der Kategorie: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
        }
    };

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem || !selectedCategory) return;

        const itemNumber = Number(editingItem.number);
        const duplicate = menuItems.find(i => Number(i.number) === itemNumber && i.id !== editingItem.id);

        if (duplicate) {
            showNotification(`Nummer ${itemNumber} existiert bereits bei "${duplicate.name}"!`, 'error');
            return;
        }

        try {
            const itemData = {
                name: editingItem.name,
                description: editingItem.description || '',
                price: Number(editingItem.price),
                number: Number(editingItem.number),
                category_id: editingItem.category_id,
                category_slug: categories.find(c => c.id === editingItem.category_id)?.slug,
                allergens: editingItem.allergens || ''
            };

            if (editingItem.id) {
                const { error } = await supabase
                    .from('menu_items')
                    .update(itemData)
                    .eq('id', editingItem.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('menu_items')
                    .insert(itemData);
                if (error) throw error;
            }
            showNotification(editingItem.id ? 'Artikel aktualisiert' : 'Artikel hinzugefügt');
            setEditingItem(null);
            setIsAddingItem(false);
            fetchData();
        } catch (error: unknown) {
            console.error('Error saving item:', error);
            showNotification('Fehler beim Speichern des Artikels: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
        }
    };

    const deleteCategory = (id: string) => {
        setConfirmAction({
            type: 'delete-category',
            categoryId: id,
            title: 'Kategorie löschen?',
            message: 'Möchten Sie diese Kategorie wirklich löschen? Alle Artikel darin werden auch gelöscht!'
        });
    };

    const deleteItem = (id: string) => {
        setConfirmAction({
            type: 'delete-item',
            itemId: id,
            title: 'Artikel löschen?',
            message: 'Möchten Sie diesen Artikel wirklich löschen?'
        });
    };

    const handleDuplicateItem = (item: MenuItem) => {
        setConfirmAction({
            type: 'duplicate-item',
            item: item,
            title: 'Artikel duplizieren?',
            message: `Möchten Sie den Artikel "${item.name}" wirklich duplizieren?`
        });
    };

    const executeConfirmAction = async () => {
        if (!confirmAction) return;

        try {
            if (confirmAction.type === 'delete-category' && confirmAction.categoryId) {
                // Delete items first (or count on CASCADE if set up, but let's be explicit if needed)
                await supabase.from('menu_items').delete().eq('category_id', confirmAction.categoryId);
                await supabase.from('categories').delete().eq('id', confirmAction.categoryId);
                showNotification('Kategorie gelöscht');
            } else if (confirmAction.type === 'delete-item' && confirmAction.itemId) {
                await supabase.from('menu_items').delete().eq('id', confirmAction.itemId);
                showNotification('Artikel gelöscht');
            } else if (confirmAction.type === 'duplicate-item' && confirmAction.item) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...itemData } = confirmAction.item;
                await supabase.from('menu_items').insert({
                    ...itemData,
                    name: `${confirmAction.item.name} (Kopie)`
                });
                showNotification('Artikel dupliziert');
            }
            fetchData();
        } catch (error: unknown) {
            console.error('Error executing action:', error);
            showNotification('Fehler bei der Aktion: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
        } finally {
            setConfirmAction(null);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        if (sourceIndex === destinationIndex) return;

        if (result.type === 'category') {
            const newCategories = Array.from(categories);
            const [reorderedItem] = newCategories.splice(sourceIndex, 1);
            newCategories.splice(destinationIndex, 0, reorderedItem);

            const updatedCats = newCategories.map((cat, index) => ({ ...cat, order: index }));
            setCategories(updatedCats);

            try {
                // Bulk update orders in Supabase
                const updates = updatedCats.map(cat =>
                    supabase.from('categories').update({ order: cat.order }).eq('id', cat.id)
                );
                await Promise.all(updates);
                showNotification('Kategorien neu sortiert');
            } catch (error) {
                console.error('Error reordering categories:', error);
                showNotification('Fehler beim Sortieren', 'error');
                fetchData();
            }
        } else if (result.type === 'menu-item' && selectedCategory) {
            const currentCategoryItems = menuItems.filter(item => item.category_id === selectedCategory);
            const otherItems = menuItems.filter(item => item.category_id !== selectedCategory);

            const newItems = Array.from(currentCategoryItems);
            const [reorderedItem] = newItems.splice(sourceIndex, 1);
            newItems.splice(destinationIndex, 0, reorderedItem);

            const updatedCurrentItems = newItems.map((item, index) => ({ ...item, order: index }));

            setMenuItems([...otherItems, ...updatedCurrentItems]);

            try {
                const updates = updatedCurrentItems.map(item =>
                    supabase.from('menu_items').update({ order: item.order }).eq('id', item.id)
                );
                await Promise.all(updates);
                showNotification('Artikel neu sortiert');
            } catch (error) {
                console.error('Error reordering items:', error);
                showNotification('Fehler beim Sortieren', 'error');
                fetchData();
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Lade Daten...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-[#1a2332] text-white p-4 sticky top-0 z-10 shadow-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-gray-700 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold">Speisekarte</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <DragDropContext onDragEnd={onDragEnd}>
                    {/* Categories Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Kategorien</h2>
                            <button
                                onClick={() => { setIsAddingCategory(true); setEditingCategory({ title: '', description: '', order: categories.length }); }}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                                <Plus className="w-4 h-4" /> Kategorie hinzufügen
                            </button>
                        </div>

                        <Droppable droppableId="categories" direction="horizontal" type="category">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="flex gap-4 overflow-x-auto pb-4"
                                >
                                    {categories.map((cat, index) => (
                                        <Draggable key={cat.id} draggableId={`cat-${cat.id}`} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    onClick={() => setSelectedCategory(cat.id)}
                                                    className={`px-4 py-3 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-grab active:cursor-grabbing select-none ${selectedCategory === cat.id
                                                        ? 'bg-orange-500 text-white shadow-lg'
                                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                                                        } ${snapshot.isDragging ? 'shadow-2xl scale-105 ring-2 ring-orange-500 opacity-90' : ''}`}
                                                    style={{ ...provided.draggableProps.style }}
                                                >
                                                    <GripVertical className="w-4 h-4 opacity-50" />
                                                    <span className="font-medium">{cat.title}</span>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>

                    {/* Selected Category Details/Edit */}
                    {selectedCategory && (
                        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            {categories.filter(c => c.id === selectedCategory).map(cat => (
                                <div key={cat.id} className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{cat.title}</h3>
                                        <p className="text-gray-500">{cat.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditingCategory(cat); setIsAddingCategory(true); }}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg relative group"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                Bearbeiten
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => deleteCategory(cat.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg relative group"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                Löschen
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Menu Items List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Artikel</h3>
                            <button
                                onClick={() => {
                                    setIsAddingItem(true);
                                    setEditingItem({ category_id: selectedCategory || '', name: '', description: '', price: 0, number: 0 });
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Plus className="w-4 h-4" /> Artikel hinzufügen
                            </button>
                        </div>

                        <Droppable droppableId="menu-items" type="menu-item">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="divide-y divide-gray-100"
                                >
                                    {menuItems
                                        .filter(item => item.category_id === selectedCategory)
                                        .map((item, index) => (
                                            <Draggable key={item.id} draggableId={`item-${item.id}`} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`p-4 hover:bg-gray-50 flex items-center justify-between group/row bg-white cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-xl ring-2 ring-orange-100 z-10' : ''
                                                            }`}
                                                        style={{ ...provided.draggableProps.style }}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                                            <span className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">
                                                                {item.number}
                                                            </span>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                                                <p className="text-sm text-gray-500">{item.description}</p>
                                                                <span className="text-orange-600 font-bold mt-1 block">€{item.price.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => { setEditingItem(item); setIsAddingItem(true); }}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg relative group"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                    Bearbeiten
                                                                </span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDuplicateItem(item)}
                                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg relative group"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                    Duplizieren
                                                                </span>
                                                            </button>
                                                            <button
                                                                onClick={() => deleteItem(item.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg relative group"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                                    Löschen
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </DragDropContext>
            </div>

            {/* Item Edit Modal */}
            {(isAddingItem || editingItem) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">{editingItem?.id ? 'Artikel bearbeiten' : 'Neuer Artikel'}</h3>
                        <form onSubmit={handleSaveItem} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Kategorie</label>
                                <select
                                    required
                                    className="w-full rounded-lg border p-2"
                                    value={editingItem?.category_id || ''}
                                    onChange={e => setEditingItem(prev => ({ ...prev!, category_id: e.target.value }))}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nummer</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full rounded-lg border p-2"
                                    value={editingItem?.number || ''}
                                    onChange={e => setEditingItem(prev => ({ ...prev!, number: Number(e.target.value) }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border p-2"
                                    value={editingItem?.name || ''}
                                    onChange={e => setEditingItem(prev => ({ ...prev!, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Beschreibung</label>
                                <textarea
                                    className="w-full rounded-lg border p-2"
                                    value={editingItem?.description || ''}
                                    onChange={e => setEditingItem(prev => ({ ...prev!, description: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Preis (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full rounded-lg border p-2"
                                    value={editingItem?.price || ''}
                                    onChange={e => setEditingItem(prev => ({ ...prev!, price: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setIsAddingItem(false); setEditingItem(null); }}
                                    className="flex-1 px-4 py-2 bg-gray-100 rounded-lg"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg"
                                >
                                    Speichern
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Edit Modal */}
            {(isAddingCategory || (editingCategory && isAddingCategory)) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">{editingCategory?.id ? 'Kategorie bearbeiten' : 'Neue Kategorie'}</h3>
                        <form onSubmit={handleSaveCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Titel</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border p-2"
                                    value={editingCategory?.title || ''}
                                    onChange={e => setEditingCategory(prev => ({ ...prev!, title: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Beschreibung</label>
                                <textarea
                                    className="w-full rounded-lg border p-2"
                                    value={editingCategory?.description || ''}
                                    onChange={e => setEditingCategory(prev => ({ ...prev!, description: e.target.value }))}
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setIsAddingCategory(false); setEditingCategory(null); }}
                                    className="flex-1 px-4 py-2 bg-gray-100 rounded-lg"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg"
                                >
                                    Speichern
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!confirmAction}
                title={confirmAction?.title || ''}
                message={confirmAction?.message || ''}
                onConfirm={executeConfirmAction}
                onCancel={() => setConfirmAction(null)}
                isDestructive={true}
            />

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

export default AdminMenuPage;
