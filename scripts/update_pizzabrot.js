
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function update() {
    console.log('Updating Pizzabrot (No. 20)...');

    // Update to user spec: "tek boy 28cm Groß"
    const newSizes = [
        { name: 'Groß (28cm)', price: 4.50 }
    ];

    const { data, error } = await supabase
        .from('menu_items')
        .update({
            sizes: newSizes,
            // Ensure description is correct
            description: 'mit Knoblauch'
        })
        .eq('number', 20)
        .select();

    if (error) {
        console.error('Error updating Pizzabrot:', error);
    } else {
        console.log('Pizzabrot Updated:', JSON.stringify(data, null, 2));
    }
}

update();
