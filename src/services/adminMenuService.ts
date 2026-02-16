/**
 * Admin menu management service — all Supabase CRUD for categories and menu items.
 * Used exclusively by AdminMenuPage.
 */
import { supabase } from '../lib/supabase';
import { TABLE } from '../lib/config';
import { logServiceError, getErrorMessage } from '../lib/errors';

// ---------------------------------------------------------------------------
// Types (admin-facing, different shape from public MenuItem)
// ---------------------------------------------------------------------------

export interface AdminCategory {
    id: string;
    title: string;
    description: string;
    order: number;
    slug: string;
}

export interface AdminMenuItem {
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

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function fetchCategories(): Promise<AdminCategory[]> {
    const { data, error } = await supabase
        .from(TABLE.CATEGORIES)
        .select('*')
        .order('order');

    if (error) throw error;
    return data ?? [];
}

export async function fetchMenuItems(): Promise<AdminMenuItem[]> {
    const { data, error } = await supabase
        .from(TABLE.MENU_ITEMS)
        .select('*')
        .order('number');

    if (error) throw error;

    // Sort by explicit order if available, else fall back to item number
    return [...(data ?? [])].sort((a, b) => (a.order ?? a.number) - (b.order ?? b.number));
}

// ---------------------------------------------------------------------------
// Category CRUD
// ---------------------------------------------------------------------------

function generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export async function saveCategory(
    category: Partial<AdminCategory>,
    totalCategories: number,
): Promise<void> {
    try {
        if (category.id) {
            const { error } = await supabase
                .from(TABLE.CATEGORIES)
                .update({
                    title: category.title,
                    description: category.description,
                    order: category.order,
                })
                .eq('id', category.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from(TABLE.CATEGORIES)
                .insert({
                    id: generateId(),
                    title: category.title,
                    description: category.description,
                    order: totalCategories,
                    slug: category.title?.toLowerCase().trim().replace(/\s+/g, '-'),
                });
            if (error) throw error;
        }
    } catch (error) {
        logServiceError('adminMenuService.saveCategory', error);
        throw new Error('Fehler beim Speichern der Kategorie: ' + getErrorMessage(error));
    }
}

export async function deleteCategory(categoryId: string): Promise<void> {
    try {
        await supabase.from(TABLE.MENU_ITEMS).delete().eq('category_id', categoryId);
        const { error } = await supabase.from(TABLE.CATEGORIES).delete().eq('id', categoryId);
        if (error) throw error;
    } catch (error) {
        logServiceError('adminMenuService.deleteCategory', error);
        throw new Error('Fehler beim Löschen der Kategorie: ' + getErrorMessage(error));
    }
}

// ---------------------------------------------------------------------------
// Menu Item CRUD
// ---------------------------------------------------------------------------

export async function saveMenuItem(
    item: Partial<AdminMenuItem>,
    categorySlug?: string,
): Promise<void> {
    try {
        const payload = {
            name: item.name,
            description: item.description || '',
            price: Number(item.price),
            number: Number(item.number),
            category_id: item.category_id,
            category_slug: categorySlug,
            allergens: item.allergens || '',
        };

        if (item.id) {
            const { error } = await supabase.from(TABLE.MENU_ITEMS).update(payload).eq('id', item.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from(TABLE.MENU_ITEMS).insert(payload);
            if (error) throw error;
        }
    } catch (error) {
        logServiceError('adminMenuService.saveMenuItem', error);
        throw new Error('Fehler beim Speichern des Artikels: ' + getErrorMessage(error));
    }
}

export async function deleteMenuItem(itemId: string): Promise<void> {
    try {
        const { error } = await supabase.from(TABLE.MENU_ITEMS).delete().eq('id', itemId);
        if (error) throw error;
    } catch (error) {
        logServiceError('adminMenuService.deleteMenuItem', error);
        throw new Error('Fehler beim Löschen des Artikels: ' + getErrorMessage(error));
    }
}

export async function duplicateMenuItem(item: AdminMenuItem): Promise<void> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...itemData } = item;
        const { error } = await supabase.from(TABLE.MENU_ITEMS).insert({
            ...itemData,
            name: `${item.name} (Kopie)`,
        });
        if (error) throw error;
    } catch (error) {
        logServiceError('adminMenuService.duplicateMenuItem', error);
        throw new Error('Fehler beim Duplizieren des Artikels: ' + getErrorMessage(error));
    }
}

// ---------------------------------------------------------------------------
// Reordering
// ---------------------------------------------------------------------------

export async function reorderCategories(categories: AdminCategory[]): Promise<void> {
    try {
        const updates = categories.map(cat =>
            supabase.from(TABLE.CATEGORIES).update({ order: cat.order }).eq('id', cat.id)
        );
        await Promise.all(updates);
    } catch (error) {
        logServiceError('adminMenuService.reorderCategories', error);
        throw new Error('Fehler beim Sortieren: ' + getErrorMessage(error));
    }
}

export async function reorderMenuItems(items: AdminMenuItem[]): Promise<void> {
    try {
        const updates = items.map(item =>
            supabase.from(TABLE.MENU_ITEMS).update({ order: item.order }).eq('id', item.id)
        );
        await Promise.all(updates);
    } catch (error) {
        logServiceError('adminMenuService.reorderMenuItems', error);
        throw new Error('Fehler beim Sortieren: ' + getErrorMessage(error));
    }
}
