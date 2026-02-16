
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log('Fixing Pizza Category IDs...');

    // Update all items with category_slug 'pizza' to have category_id 'pizza'
    const { data, error } = await supabase
        .from('menu_items')
        .update({ category_id: 'pizza' })
        .eq('category_slug', 'pizza')
        .select();

    if (error) {
        console.error('Error updating items:', error);
    } else {
        console.log(`Updated ${data.length} items to have category_id='pizza'.`);
    }
}

fix();
