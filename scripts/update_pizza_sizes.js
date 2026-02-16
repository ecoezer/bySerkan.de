
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSizes() {
    console.log('Updating Pizza Sizes...');

    // Fetch all pizza items
    const { data: items, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category_slug', 'pizza');

    if (error) {
        console.error('Error fetching items:', error);
        return;
    }

    console.log(`Found ${items.length} pizza items.`);

    for (const item of items) {
        if (!item.sizes || !Array.isArray(item.sizes)) continue;

        let updated = false;
        const newSizes = item.sizes.map(size => {
            let newName = size.name;
            if (size.name === 'Klein') {
                newName = 'Klein (24cm)';
                updated = true;
            } else if (size.name === 'Groß') {
                newName = 'Groß (28cm)';
                updated = true;
            }
            // Check if already updated to avoid double suffix if run multiple times
            if (size.name === 'Klein (24cm)' || size.name === 'Groß (28cm)') {
                // already correct
            }

            return { ...size, name: newName };
        });

        if (updated) {
            console.log(`Updating sizes for ${item.name} (${item.number})...`);
            const { error: updateError } = await supabase
                .from('menu_items')
                .update({ sizes: newSizes })
                .eq('id', item.id);

            if (updateError) console.error(`Failed to update ${item.name}:`, updateError);
        }
    }
}

updateSizes();
