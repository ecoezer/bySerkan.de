
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking Pizzabrot (No. 20)...');

    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('number', 20)
        .single();

    if (error) {
        console.error('Error fetching Pizzabrot:', error);
    } else {
        console.log('Pizzabrot Data:', JSON.stringify(data, null, 2));
    }
}

check();
