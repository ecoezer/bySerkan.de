
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const category = {
    title: 'Schnitzel',
    slug: 'schnitzel',
    description: 'Frisch paniert und goldbraun gebraten',
    order: 5
};

const items = [
    {
        number: 65,
        name: 'Wiener Art Hähnchenschnitzel',
        description: 'mit gem. Salat, Pommes oder Kroketten',
        price: 10.00,
        allergens: ['A', 'G'],
        has_side_dish_selection: true
    },
    {
        number: 66,
        name: 'Hollandaise Hähnchenschnitzel',
        description: 'mit gem. Salat, Pommes oder Kroketten, Hollandaisesauce',
        price: 10.00,
        allergens: ['A', 'C', 'G', 'K'],
        has_side_dish_selection: true
    },
    {
        number: 67,
        name: 'Jägerschnitzel Hähnchenschnitzel',
        description: 'mit gem. Salat, Pommes oder Kroketten, Jägersauce',
        price: 10.00,
        allergens: ['3', '4', 'A', 'G'],
        has_side_dish_selection: true
    },
    {
        number: 68,
        name: 'Zigeunerschnitzel Hähnchenschnitzel',
        description: 'mit gem. Salat, Pommes oder Kroketten, Zigeunersauce',
        price: 10.00,
        allergens: ['3', '4', 'A', 'G'],
        has_side_dish_selection: true
    }
];

async function seed() {
    console.log('Starting seed...');

    // 1. Get or Create Category
    let categoryId;
    const { data: existingCategory, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category.slug)
        .single();

    if (existingCategory) {
        console.log(`Category ${category.title} exists.`);
        categoryId = existingCategory.id;
    } else {
        console.log(`Creating category ${category.title}...`);
        const { data: newCategory, error: createError } = await supabase
            .from('categories')
            .insert([{
                id: randomUUID(),
                title: category.title,
                slug: category.slug,
                description: category.description,
                "order": category.order
            }])
            .select()
            .single();

        if (createError) {
            console.error('Error creating category:', createError);
            return;
        }
        categoryId = newCategory.id;
    }

    // 2. Upsert Items
    for (const item of items) {
        console.log(`Processing item ${item.number}: ${item.name}`);

        // Check if item exists by number
        const { data: existingItem } = await supabase
            .from('menu_items')
            .select('id')
            .eq('number', item.number)
            .single();

        const itemData = {
            category_id: categoryId,
            number: item.number,
            name: item.name,
            description: item.description,
            price: item.price,
            allergens: item.allergens,
            has_side_dish_selection: item.has_side_dish_selection || false
        };

        if (existingItem) {
            // Update
            const { error: updateError } = await supabase
                .from('menu_items')
                .update(itemData)
                .eq('id', existingItem.id);

            if (updateError) console.error(`Error updating item ${item.number}:`, updateError);
            else console.log(`Updated item ${item.number}`);
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from('menu_items')
                .insert([{ ...itemData, id: randomUUID() }]);

            if (insertError) console.error(`Error inserting item ${item.number}:`, insertError);
            else console.log(`Inserted item ${item.number}`);
        }
    }

    console.log('Seeding complete!');
}

seed();
