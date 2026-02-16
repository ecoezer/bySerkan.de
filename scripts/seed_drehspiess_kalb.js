
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
    title: 'Drehspiess Kalb',
    slug: 'drehspiess-kalb',
    description: '100% Kalbfleisch - Frisch vom Spieß',
    order: 6
};

const items = [
    {
        number: 70,
        name: 'Kebap-Teller',
        description: 'gem. Salat, Pommes, Kroketten oder Reis',
        price: 10.00,
        allergens: ['2', '4', '8', 'G', 'K', 'L'],
        is_multiple_sauce_selection: true,
        has_side_dish_selection: true
    },
    {
        number: 71,
        name: 'Kebap-Teller Spezial',
        description: 'auf geröstetem Brot, hausgemachter Joghurtsauce dazu Pommes, Kroketten oder Reis',
        price: 11.00,
        allergens: ['2', '4', '8', 'A', 'G', 'K', 'L'],
        is_multiple_sauce_selection: true,
        has_side_dish_selection: true
    },
    {
        number: 72,
        name: 'Kebap-Auflauf',
        description: 'Champignons, Hollandaise, Tomaten- oder Sahnesauce, Käse überbacken, dazu Pommes, Kroketten oder Reis & gem. Salat',
        price: 11.00,
        allergens: ['4', '8', 'A', 'G', 'K', 'L'],
        is_multiple_sauce_selection: true,
        has_side_dish_selection: true
    },
    {
        number: 73,
        name: 'Dürüm',
        description: '(in gerolltem Brotfladen) gem. Salat, Krautsalat (rot-weiß), Zwiebeln, Sauce',
        price: 7.00,
        allergens: ['2', '4', '8', 'A', 'G', 'K', 'L'],
        is_multiple_sauce_selection: true
    },
    {
        number: 74,
        name: 'Dürüm Chef',
        description: 'Pommes, Sauce und mit Käse gebacken',
        price: 8.00,
        allergens: ['2', '4', '8', 'A', 'G', 'K', 'L'],
        is_multiple_sauce_selection: true
    },
    {
        number: 75,
        name: 'Kebap-Tasche',
        description: 'gem. Salat, Krautsalat (rot-weiß), Zwiebeln, Sauce',
        price: 6.50,
        allergens: ['3', '4', '8', 'A', 'C', 'K', 'L'],
        is_multiple_sauce_selection: true
    },
    {
        number: 76,
        name: 'Kebap-Tasche Weichkäse',
        description: 'Weichkäse, gem. Salat, Krautsalat (rot-weiß), Zwiebeln, Sauce',
        price: 7.50,
        allergens: ['4', '8', 'A', 'G', 'K', 'L'],
        is_multiple_sauce_selection: true
    },
    {
        number: 77,
        name: 'Kebap-Box',
        description: 'Pommes, Sauce',
        price: 6.00,
        allergens: ['2', 'A', '8', 'G', 'K', 'L'],
        is_multiple_sauce_selection: true
    },
    {
        number: 78,
        name: 'Vegetarische Tasche',
        description: 'gem. Salat, Weichkäse, Sauce',
        price: 6.00,
        allergens: ['A', 'G'],
        is_multiple_sauce_selection: true
    },
    {
        number: 79,
        name: 'Dürüm Vegetarisch',
        description: 'gem. Salat, Krautsalat (rot-weiß), Weichkäse, Sauce',
        price: 7.00,
        allergens: ['A', 'C'],
        is_multiple_sauce_selection: true
    },
    {
        number: 80,
        name: 'Chilie-Cheese-Kebap-Tasche',
        description: 'gem. Salat, Krautsalat (rot-weiß), Zwiebeln, Jalapenos, Chilie-Cheese-Sauce',
        price: 6.50,
        allergens: ['2', '3', '4', '8', 'A', 'G', 'K', 'L'],
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
