import { supabase } from '../lib/supabase';

export async function cleanupDuplicateCategories(): Promise<{ success: boolean; message: string; deletedCount: number }> {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('id, slug, title');

        if (error) throw error;
        if (!categories) return { success: true, message: 'Keine Kategorien gefunden.', deletedCount: 0 };

        interface SimpleCategory {
            id: string;
            slug?: string;
            title?: string;
        }

        const slugMap: Record<string, SimpleCategory[]> = {};

        // Group by slug
        categories.forEach(cat => {
            const slug = cat.slug || cat.title?.toLowerCase().replace(/ /g, '-').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue') || 'unknown';
            if (!slugMap[slug]) slugMap[slug] = [];
            slugMap[slug].push(cat);
        });

        let deletedCount = 0;
        let hasDeletions = false;

        for (const slug in slugMap) {
            const group = slugMap[slug];
            if (group.length > 1) {
                console.log(`Duplicate slug found: ${slug} (${group.length} items)`);

                // Sort and keep the one with the "smallest" ID (consistent with Firestore logic)
                group.sort((a, b) => a.id.localeCompare(b.id));

                const toDelete = group.slice(1);

                for (const cat of toDelete) {
                    const { error: deleteError } = await supabase
                        .from('categories')
                        .delete()
                        .eq('id', cat.id);

                    if (deleteError) throw deleteError;
                    deletedCount++;
                    hasDeletions = true;
                }
            }
        }

        return {
            success: true,
            message: hasDeletions ? `${deletedCount} Duplikate entfernt.` : 'Keine Duplikate gefunden.',
            deletedCount
        };

    } catch (error: unknown) {
        console.error('Cleanup failed:', error);
        const message = error instanceof Error ? error.message : String(error);
        return {
            success: false,
            message: `Fehler: ${message}`,
            deletedCount: 0
        };
    }
}
