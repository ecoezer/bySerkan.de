import { useState, useEffect } from 'react';
import { logServiceError } from '../lib/errors';
import { getMenuSections } from '../services/menuService';
import type { MenuSection } from '../types';

export const useMenuData = () => {
    const [sections, setSections] = useState<MenuSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getMenuSections();
                setSections(data);
            } catch (err) {
                logServiceError('useMenuData', err);
                setError('Failed to load menu data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { sections, loading, error };
};
