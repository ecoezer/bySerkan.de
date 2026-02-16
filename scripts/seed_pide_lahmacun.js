
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
    title: 'Pide & Lahmacun',
    slug: 'pide-lahmacun',
    description: 'Frisch aus dem Ofen',
    order: 4
};

const items = [
    {
        number: 55,
        name: 'Pide mit Sucuk',
        description: '(Knoblauchwurst), Ei, Goudakäse',
        price: 9.50,
        allergens: '1,3,4,A,D,G',
        is_meat_selection: false,
        is_spezialitaet: false
    },
    {
        number: 56,
        name: 'Pide mit Kebapfleisch',
        description: 'Ei, Goudakäse',
        price: 9.50,
        allergens: '2,4,8,A,G,K,L', // Assumed standard kebap allergens
        is_meat_selection: true,
        is_spezialitaet: false
    },
    {
        number: 57,
        name: 'Lahmacun',
        description: 'mit gem. Salat & Sauce',
        price: 5.50,
        allergens: 'A,G',
        is_meat_selection: false,
        is_spezialitaet: true,
        is_multiple_sauce_selection: true
    },
    {
        number: 58,
        name: 'Lahmacun-Kebap',
        description: 'Kebapfleisch Kalb oder Hähnchen, gem. Salat & Sauce',
        price: 7.00,
        allergens: '2,4,8,A,G,K,L',
        is_meat_selection: true,
        is_spezialitaet: false
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
                "order": category.order // Quoted keyword
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
            allergens: item.allergens ? item.allergens.split(',') : [],
            is_meat_selection: item.is_meat_selection || false,
            is_spezialitaet: item.is_spezialitaet || false,
            is_multiple_sauce_selection: item.is_multiple_sauce_selection || false
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
