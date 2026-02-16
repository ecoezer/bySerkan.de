
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
        number: 41,
        name: 'Torino',
        description: 'Formfleischschinken, Weichkäse, fr. Tomaten, Oliven, Peperoni (mild)',
        allergens: ['1', '3', '4', '5', 'A', 'G'],
        sizes: [
            { name: 'Klein (24cm)', price: 8.00 },
            { name: 'Groß (28cm)', price: 10.00 }
        ]
    },
    {
        number: 42,
        name: 'Diavolo',
        description: 'Salami, Jalapenos, Weichkäse',
        allergens: ['1', '2', '3', '4', 'A', 'G'],
        sizes: [
            { name: 'Klein (24cm)', price: 8.00 },
            { name: 'Groß (28cm)', price: 9.50 }
        ]
    },
    {
        number: 43,
        name: 'Sucuk',
        description: 'Knoblauchwurst, fr. Champignons, Ei, Weichkäse',
        allergens: ['1', '3', '4', 'A', 'C', 'G'],
        sizes: [
            { name: 'Klein (24cm)', price: 8.00 },
            { name: 'Groß (28cm)', price: 9.50 }
        ]
    },
    {
        number: 44,
        name: 'Frutti di Mare',
        description: 'Meeresfrüchte, Knoblauch',
        allergens: ['A', 'D', 'G', 'P'],
        sizes: [
            { name: 'Klein (24cm)', price: 8.00 },
            { name: 'Groß (28cm)', price: 10.00 }
        ]
    },
    {
        number: 45,
        name: 'By Serkan',
        description: 'Salami, Formfleischschinken, fr. Champignons, Zwiebeln, fr. Paprika',
        allergens: ['1', '3', '4', 'A', 'G'],
        sizes: [
            { name: 'Klein (24cm)', price: 8.00 },
            { name: 'Groß (28cm)', price: 10.00 }
        ]
    },
    {
        number: 46,
        name: 'Popeye',
        description: 'Spinat, Weichkäse',
        allergens: ['A', 'G'],
        sizes: [
            { name: 'Klein (24cm)', price: 8.00 },
            { name: 'Groß (28cm)', price: 10.00 }
        ]
    },
    {
        number: 47,
        name: 'Mozzarella',
        description: 'Formfleischschinken, fr. Tomaten, Mozzarella, Rucola',
        allergens: ['1', '3', '4', 'A', 'G'],
        sizes: [
            { name: 'Klein (24cm)', price: 8.00 },
            { name: 'Groß (28cm)', price: 9.50 }
        ]
    },
    {
        number: 48,
        name: 'Broccoli',
        description: 'Salami, Formfleischschinken, Kebapfleisch (Kalb- oder Hähnchen)',
        allergens: ['1', '3', '4', '8', 'A', 'G', 'K', 'L'],
        sizes: [
            { name: 'Klein (24cm)', price: 8.00 },
            { name: 'Groß (28cm)', price: 10.00 }
        ]
    },
    {
        number: 50,
        name: 'Pizza Grande',
        description: '(Familien-Pizza á 40 cm) Tomatensauce, Käse (jeder weitere Belag + 3,00)',
        allergens: ['A', 'G'],
        sizes: [
            { name: 'Familien-Pizza (40cm)', price: 15.00 }
        ],
        is_wunsch_pizza: true // Potentially useful flag for the frontend to enable base-pizza logic
    }
];

async function seed() {
    console.log('Starting seed for Pizzas 41-50...');

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
            sizes: product.sizes,
            is_wunsch_pizza: product.is_wunsch_pizza || false
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
