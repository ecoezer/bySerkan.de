
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking Pizza Category...');

    const { data: category, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', 'pizza')
        .single();

    if (catError) {
        console.error('Error fetching category:', catError);
        return;
    }

    console.log('Category found:', category);

    console.log('Checking Pizza Items...');

    // Check by category_id
    const { data: itemsById, error: itemsError } = await supabase
        .from('menu_items')
        .select('id, name, category_id, category_slug')
        .eq('category_id', category.id);

    if (itemsError) {
        console.error('Error fetching items by ID:', itemsError);
    } else {
        console.log(`Found ${itemsById.length} items by category_id '${category.id}':`);
        itemsById.forEach(i => console.log(`- ${i.name} (${i.id})`));
    }

    // Check by category_slug
    const { data: itemsBySlug, error: itemsSlugError } = await supabase
        .from('menu_items')
        .select('id, name, category_id, category_slug')
        .eq('category_slug', 'pizza');

    if (itemsSlugError) {
        console.error('Error fetching items by Slug:', itemsSlugError);
    } else {
        console.log(`Found ${itemsBySlug.length} items by category_slug 'pizza':`);
    }
}

check();
