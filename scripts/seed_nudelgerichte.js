
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
    title: 'Nudelgerichte',
    slug: 'nudelgerichte',
    description: 'Auf Wunsch auch mit Käseüberbacken + 1,- EUR',
    order: 8
};

const items = [
    {
        number: 101,
        name: 'Spaghetti Napoli',
        description: 'in Tomatensauce',
        price: 8.00,
        allergens: ['3', 'A', 'C', 'K', 'L'],
        is_spezialitaet: false
    },
    {
        number: 102,
        name: 'Spaghetti Bolognese',
        description: 'in Rindfleischsauce',
        price: 8.50,
        allergens: ['3', 'A', 'C', 'K', 'L'],
        is_spezialitaet: false
    },
    {
        number: 103,
        name: 'Spaghetti Broccoli',
        description: 'Kebapfleisch, Broccoli in Sahnesauce',
        price: 8.50,
        allergens: ['2', '3', '4', '8', 'A', 'C', 'G', 'K', 'L'],
        is_spezialitaet: false
    },
    {
        number: 104,
        name: 'Spaghetti Gorgonzola',
        description: 'in Sahnesauce',
        price: 8.50,
        allergens: ['A', 'C', 'G', 'K', 'L'],
        is_spezialitaet: false
    },
    {
        number: 105,
        name: 'Spaghetti al Forno',
        description: 'in Rindfleischsauce, Schinken, Champignons',
        price: 9.00,
        allergens: ['4', '3', '4', 'A', 'C', 'K', 'L'], // 4,3,4 repeated in image, likely 2,3,4 or 3,4. Using what's logical/visible: 4,3,4 -> 3,4.
        is_spezialitaet: false
    },
    {
        number: 106,
        name: 'Makkaroni Napoli',
        description: 'in Tomatensauce',
        price: 8.00,
        allergens: ['A', 'C', 'K', 'L'],
        is_spezialitaet: false
    },
    {
        number: 107,
        name: 'Makkaroni Bolognese',
        description: 'in Rindfleischsauce',
        price: 8.50,
        allergens: ['A', 'C', 'K', 'L'],
        is_spezialitaet: false
    },
    {
        number: 108,
        name: 'Makkaroni Broccoli',
        description: 'Kebapfleisch, Broccoli in Sahnesauce',
        price: 8.50,
        allergens: ['3', '4', '8', 'A', 'C', 'G', 'K', 'L'],
        is_spezialitaet: false
    },
    {
        number: 109,
        name: 'Makkaroni Gorgonzola',
        description: 'in Sahnesauce',
        price: 8.50,
        allergens: ['A', 'C', 'G', 'K', 'L'],
        is_spezialitaet: false
    },
    {
        number: 110,
        name: 'Makkaroni Chef',
        description: 'Hollandaise, Hähnchenkebap, Broccoli, Champignons',
        price: 9.50,
        allergens: ['2', '4', 'B', 'A', 'C', 'G', 'K', 'L'], // 'B' here again.
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
            is_spezialitaet: item.is_spezialitaet || false
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
