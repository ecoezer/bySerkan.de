
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
    {
        number: 34,
        name: 'Rustica',
        description: 'Salami, Formfleischschinken, fr. Champignons',
        allergens: ['1', '3', '4', 'A', 'G'],
        sizes: [
            { name: 'Klein', price: 7.50 },
            { name: 'Groß', price: 9.00 }
        ]
    },
    {
        number: 35,
        name: 'Genua',
        description: 'Salami, Formfleischschinken, fr. Champignons, Peperoni, fr. Paprika',
        allergens: ['1', '3', '4', 'A', 'G'], // Interpreted from menu text likely being standard additives
        sizes: [
            { name: 'Klein', price: 8.00 },
            { name: 'Groß', price: 10.00 }
        ]
    },
    {
        number: 36,
        name: 'Hawaii',
        description: 'Formfleischschinken, Ananas',
        allergens: ['1', '3', '4', 'A', 'G'],
        sizes: [
            { name: 'Klein', price: 7.00 },
            { name: 'Groß', price: 9.00 }
        ]
    },
    {
        number: 37,
        name: 'Milano',
        description: 'Formfleischschinken, Salami, Paprika, fr. Champignons, Thunfisch',
        allergens: ['1', '3', '4', 'A', 'D', 'G'],
        sizes: [
            { name: 'Klein', price: 7.00 },
            { name: 'Groß', price: 9.00 }
        ]
    },
    {
        number: 38,
        name: 'Spaghetti',
        description: 'mit Hollandaise oder Bolognese', // Pizza Spaghetti
        allergens: ['A', 'C', 'G', 'K'],
        sizes: [
            { name: 'Klein', price: 8.00 },
            { name: 'Groß', price: 10.00 }
        ]
    },
    {
        number: 39,
        name: 'Inferno',
        description: 'Salami, Formfleischschinken, Zwiebeln, fr. Paprika, Peperoni (scharf)',
        allergens: ['1', '3', '4', 'A', 'G'],
        sizes: [
            { name: 'Klein', price: 8.00 },
            { name: 'Groß', price: 10.00 }
        ]
    },
    {
        number: 40,
        name: 'Vegetaria',
        description: 'fr. Champignons, Mais, Zwiebeln, Peperoni, fr. Paprika',
        allergens: ['A', 'G'],
        sizes: [
            { name: 'Klein', price: 8.00 },
            { name: 'Groß', price: 9.50 }
        ]
    }
];

async function seed() {
    console.log('Starting seed for Pizzas 34-40...');

    // 1. Get Pizza Category
    const { data: category, error: catError } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('slug', 'pizza')
        .single();

    if (catError || !category) {
        console.error('Error fetching Pizza category:', catError);
        return;
    }
    console.log(`Found Category: ${category.slug} (${category.id})`);

    // 2. Insert Products
    for (const product of products) {
        console.log(`Upserting product: ${product.name}`);

        const { data: existing } = await supabase
            .from('menu_items')
            .select('id')
            .eq('category_id', category.id)
            .eq('number', product.number)
            .maybeSingle();

        // Determine base price (lowest size price)
        const basePrice = product.sizes ? Math.min(...product.sizes.map(s => s.price)) : 0;

        const itemData = {
            category_id: category.id,
            category_slug: category.slug,
            name: product.name,
            description: product.description,
            price: basePrice,
            number: product.number,
            allergens: product.allergens,
            sizes: product.sizes
        };

        let error;
        if (existing) {
            // Update
            const { error: updateError } = await supabase
                .from('menu_items')
                .update(itemData)
                .eq('id', existing.id);
            error = updateError;
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from('menu_items')
                .insert({
                    id: randomUUID(),
                    ...itemData
                });
            error = insertError;
        }

        if (error) {
            console.error(`Error processing ${product.name}:`, error);
        } else {
            console.log(`Processed: ${product.name}`);
        }
    }

    console.log('Done!');
}

seed();
