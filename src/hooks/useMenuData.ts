import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { MenuSection } from '../types';

export const useMenuData = () => {
    const [sections, setSections] = useState<MenuSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Categories
                const { data: categoriesData, error: catError } = await supabase
                    .from('categories')
                    .select('*')
                    .order('order');

                if (catError) throw catError;

                // Fetch Items
                const { data: itemsData, error: itemError } = await supabase
                    .from('menu_items')
                    .select('*')
                    .order('number');

                if (itemError) throw itemError;

                // Map items to categories
                const mappedSections = categoriesData.map(cat => {
                    const catItems = itemsData.filter(item => item.category_id === cat.id || item.category_slug === cat.slug);
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
                            supabaseId: item.id // Keep reference
                        }))
                    };
                });

                // Filter out duplicate sections based on ID (slug)
                const uniqueSections = mappedSections.filter((section, index, self) =>
                    index === self.findIndex((s) => s.id === section.id)
                );

                setSections(uniqueSections);
            } catch (err) {
                console.error('Error fetching menu:', err);
                setError('Failed to load menu data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { sections, loading, error };
};
