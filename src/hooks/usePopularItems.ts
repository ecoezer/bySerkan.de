import { useState, useEffect } from 'react';
import { useMenuData } from './useMenuData';
import { MenuItem } from '../types';

/** IDs of items that should be boosted in the "popular" list */
const POPULAR_ITEM_IDS = [1, 26, 6, 2, 7];
const POPULAR_COUNT = 6;
const BOOST_SCORE = 1000;

export const usePopularItems = () => {
    const { sections, loading, error } = useMenuData();
    const [popularItems, setPopularItems] = useState<MenuItem[]>([]);

    useEffect(() => {
        if (loading || !sections.length) return;

        const allItems = sections.flatMap(section => section.items);

        // Score each item, sort by score descending, then take top N
        const sorted = allItems
            .map(item => {
                let count = item.orderCount || 0;
                if (POPULAR_ITEM_IDS.includes(item.number)) {
                    count += BOOST_SCORE;
                }
                return { ...item, _sortCount: count };
            })
            .sort((a, b) => b._sortCount - a._sortCount)
            .slice(0, POPULAR_COUNT)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .map(({ _sortCount, ...item }) => item);

        setPopularItems(sorted);
    }, [sections, loading]);

    return { popularItems, loading, error };
};
