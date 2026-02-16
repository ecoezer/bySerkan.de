import { supabase } from '../lib/supabase';
import { TABLE } from '../lib/config';
import type { MenuSection, CategoryRow, MenuItemRow } from '../types';

/** Fetches all categories from Supabase, ordered by display order. */
export async function fetchCategories(): Promise<CategoryRow[]> {
    const { data, error } = await supabase
        .from(TABLE.CATEGORIES)
        .select('*')
        .order('order');

    if (error) throw error;
    return data;
}

/** Fetches all menu items from Supabase, ordered by item number. */
export async function fetchMenuItems(): Promise<MenuItemRow[]> {
    const { data, error } = await supabase
        .from(TABLE.MENU_ITEMS)
        .select('*')
        .order('number');

    if (error) throw error;
    return data;
}

/**
 * Fetches categories and items, then maps them into MenuSection[].
 * Deduplicates sections by slug.
 */
export async function getMenuSections(): Promise<MenuSection[]> {
    const [categories, items] = await Promise.all([
        fetchCategories(),
        fetchMenuItems(),
    ]);

    const mappedSections = categories.map(cat => {
        const catItems = items.filter(item => item.category_id === cat.id || item.category_slug === cat.slug);
        return {
            id: cat.slug,
            title: cat.title,
            description: cat.description,
            order: cat.order,
            items: catItems.map(item => ({
                id: item.number,
                number: item.number,
                name: item.name,
                description: item.description,
                price: parseFloat(item.price),
                allergens: item.allergens,
                sizes: item.sizes,
                isWunschPizza: item.is_wunsch_pizza,
                isPizza: item.is_pizza,
                isPasta: item.is_pasta,
                isSpezialitaet: item.is_spezialitaet,
                isBeerSelection: item.is_beer_selection,
                isMeatSelection: item.is_meat_selection,
                isMultipleSauceSelection: item.is_multiple_sauce_selection,
                hasSideDishSelection: item.has_side_dish_selection,
                orderCount: item.order_count,
                supabaseId: item.id,
            })),
        };
    });

    // Deduplicate sections by slug
    return mappedSections.filter((section, index, self) =>
        index === self.findIndex(s => s.id === section.id)
    );
}
