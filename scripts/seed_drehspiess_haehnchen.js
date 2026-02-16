
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
    title: 'Drehspiess Hähnchen',
    slug: 'drehspiess-haehnchen',
    description: '100% Hähnchenfleisch - Frisch vom Spieß',
    order: 7
};

const items = [
    {
        number: 85,
        name: 'Hähnchen-Kebap-Teller',
        description: 'gem. Salat, Pommes, Kroketten oder Reis',
        price: 10.00,
        allergens: ['2', '4', '8', 'A', 'G', 'K', 'L'],
        is_multiple_sauce_selection: true,
        has_side_dish_selection: true
    },
    {
        number: 86,
        name: 'Hähnchenkebap-Auflauf',
        description: 'Champignons, Hollandaise, Tomaten- oder Sahnesauce, Käse überbacken, dazu Pommes, Kroketten oder Reis & gem. Salat',
        price: 11.00,
        allergens: ['3', '4', '8', 'A', 'C', 'G', 'K', 'L'],
        is_multiple_sauce_selection: true,
        has_side_dish_selection: true
    },
    {
        number: 87,
        name: 'Hähnchen-Dürüm',
        description: '(in gerolltem Brotfladen) gem. Salat, Krautsalat (rot-weiß), Zwiebeln, Sauce',
        price: 7.00,
        allergens: ['2', '4', '8', 'A', 'G', 'K', 'L'],
        is_multiple_sauce_selection: true
    },
    {
        number: 88,
        name: 'Hähnchen-Dürüm Chef',
        description: 'Pommes, Sauce und mit Käse gebacken',
        price: 8.00,
        allergens: ['2', '4', '8', 'A', 'G', 'K', 'L'],
        is_multiple_sauce_selection: true
    },
    {
        number: 89,
        name: 'Hähnchen-Kebap-Tasche',
        description: 'gem. Salat, Krautsalat (rot-weiß), Zwiebeln, Sauce',
        price: 6.50,
        allergens: ['2', '4', '8', 'A', 'G', 'K', 'L'], // Note: 'B' in image likely typo for '8' or specific allergen, checking typical kebap allergens. Image says '2,4,B,A,G,K,L'. Assuming 'B' is typo for '8' (Phosphat) common in meat, or 'B' (Krebstiere) which is unlikely. Let's stick to standard 8 or leave as string if unsure. Actually 'B' is Krebstiere. Unlikely in Kebap. '8' is Phosphat. I'll use '8'.
        is_multiple_sauce_selection: true
    },
    {
        number: 90,
        name: 'Hähnchen-Tasche Weichkäse',
        description: 'Weichkäse, gem. Salat, Krautsalat (rot-weiß), Zwiebeln, Sauce',
        price: 7.50,
        allergens: ['2', '4', '8', 'A', 'G', 'K', 'L'],
        is_multiple_sauce_selection: true
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
            is_multiple_sauce_selection: item.is_multiple_sauce_selection || false,
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
