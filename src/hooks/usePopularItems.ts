import { useState, useEffect } from 'react';
import { useMenuData } from './useMenuData';
import { MenuItem } from '../types';

export const usePopularItems = () => {
    const { sections, loading, error } = useMenuData();
    const [popularItems, setPopularItems] = useState<MenuItem[]>([]);

    useEffect(() => {
        if (loading || !sections.length) return;

        // Flatten all items from all sections
        const allItems = sections.flatMap(section => section.items);

        // Sort by orderCount (descending)
        // If orderCount is missing, we can simulate it or just pick specific IDs for the "Beliebt" feel
        // For this demo, let's prioritize items that *should* be popular (e.g., Döner, Pizza Margherita)
        // and assign them a high "virtual" order count if real data is missing.

        const popularIds = [1, 26, 6, 2, 7]; // Classic Döner, Pizza Margherita, Dürüm, etc.

        const sorted = allItems.map(item => {
            let count = item.orderCount || 0;
            if (popularIds.includes(item.number)) {
                count += 1000; // Boost popular items for demo
            }
            return { ...item, _sortCount: count };
        })
            .sort((a, b) => b._sortCount - a._sortCount)
            .slice(0, 6) // Top 6
            .map(({ _sortCount, ...item }) => item);

        setPopularItems(sorted);

    }, [sections, loading]);

    return { popularItems, loading, error };
};
