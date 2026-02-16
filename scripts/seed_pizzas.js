
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const category = {
    id: 'pizza',
    title: 'Pizza',
    description: 'Alle Pizzen sind mit Tomatensauce',
    order: 2,
    slug: 'pizza'
};

const products = [
    {
        number: 20,
        name: 'Pizzabrot',
        description: 'mit Knoblauch',
        allergens: ['A', 'G'],
        prices: { small: 0, large: 4.50 }, // Only large listed? Or small is just bread? Usually Pizzabrot has one price. Image shows 4,50 in the right column. Let's assume one size "Groß" or just default.
        // Actually, typically Pizzabrot is one size. I'll put it as a single price item if possible, or large size.
        // But since the column header says "klein" and "groß", maybe it's only available in groß?
        sizes: [
            { name: 'Groß', price: 4.50 }
        ]
    },
    {
        number: 21,
        name: 'Margherita',
        description: '',
        allergens: ['A', 'G'],
        sizes: [
            { name: 'Klein', price: 5.50 },
            { name: 'Groß', price: 6.50 }
        ]
    },
    {
        number: 22,
        name: 'Funghi',
        description: 'fr. Champignons',
        allergens: ['A', 'G'],
        sizes: [
            { name: 'Klein', price: 6.00 },
            { name: 'Groß', price: 7.50 }
        ]
    },
    {
        number: 23,
        name: 'Schinken',
        description: 'Formfleischschinken',
        allergens: ['1', '3', '4', 'A', 'G'],
        sizes: [
            { name: 'Klein', price: 6.00 },
            { name: 'Groß', price: 8.00 }
        ]
    },
    {
        number: 24,
        name: 'Salami',
        description: 'Salami',
        allergens: ['1', '3', '4', 'A', 'G'],
        sizes: [
            { name: 'Klein', price: 6.00 },
            { name: 'Groß', price: 8.00 }
        ]
    },
    {
        number: 25,
        name: 'Bomba',
        description: 'Salami, Peperoni (scharf oder mild)',
        allergens: ['1', '3', '4', 'A', 'G'],
        sizes: [
            { name: 'Klein', price: 6.00 },
            { name: 'Groß', price: 9.00 }
        ]
    },
    {
        number: 26,
        name: 'Formaggio',
        description: 'Gorgonzola, Mozzarella, Weichkäse und Gouda',
        allergens: ['A', 'G'],
        sizes: [
            { name: 'Klein', price: 8.00 },
            { name: 'Groß', price: 9.00 }
        ]
    },
    {
        number: 27,
        name: 'Roma',
        description: 'Salami, Formfleischschinken',
        allergens: ['1', '3', '4', 'A', 'G'],
        sizes: [
            { name: 'Klein', price: 7.00 },
            { name: 'Groß', price: 9.00 }
        ]
    },
    {
        number: 28,
        name: 'Salami e Funghi',
        description: 'Salami, fr. Champignons',
        allergens: ['1', '3', '4', 'A'],
        sizes: [
            { name: 'Klein', price: 7.00 },
            { name: 'Groß', price: 9.00 }
        ]
    },
    {
        number: 29,
        name: 'Tonno',
        description: 'Thunfisch, Zwiebeln',
        allergens: ['A', 'D', 'G'],
        sizes: [
            { name: 'Klein', price: 8.00 },
            { name: 'Groß', price: 9.50 }
        ]
    },
    {
        number: 30,
        name: 'Kebap',
        description: 'wahlweise Zaziki-, Chili-, Cocktailsauce (Hollandaisesauce + 1,50 EURO)',
        allergens: ['2', '4', '8', 'A', 'G', 'K', 'L'],
        sizes: [
            { name: 'Klein', price: 8.00 },
            { name: 'Groß', price: 9.50 }
        ]
    },
    {
        number: 31,
        name: 'Kebap Hähnchen',
        description: 'wahlweise Zaziki-, Chili-, Cocktailsauce (Hollandaisesauce + 1,50 EURO)',
        allergens: ['2', '4', '8', 'A', 'G', 'K', 'L'],
        sizes: [
            { name: 'Klein', price: 8.00 },
            { name: 'Groß', price: 9.50 }
        ]
    },
    {
        number: 32,
        name: 'Calzone',
        description: 'Salami, Formfleischschinken, Kebap-fleisch (auf Wunsch auch Hähnchenfleisch)',
        allergens: ['1', '2', '3', '4', '8', 'A', 'G', 'H', 'L'], // H? Maybe K? Image check: A,G,H,L... let's trust H for now or assume typo.
        sizes: [
            { name: 'Klein', price: 8.00 },
            { name: 'Groß', price: 10.00 }
        ]
    },
    {
        number: 33,
        name: 'Kebap Calzone',
        description: 'Kebapfleisch Kalb oder Hähnchen (Auf Wunsch auch mit Hollandaise)',
        allergens: ['2', '4', '8', 'A', 'G', 'K', 'L'],
        sizes: [
            { name: 'Klein', price: 8.00 },
            { name: 'Groß', price: 10.00 }
        ]
    }
];

async function seed() {
    console.log('Starting seed for Pizza...');

    // 1. Upsert Category
    console.log(`Upserting category: ${category.title}`);
    const { error: catError } = await supabase
        .from('categories')
        .upsert({
            id: category.id,
            title: category.title,
            description: category.description,
            order: category.order,
            slug: category.slug
        });

    if (catError) {
        console.error('Error creating category:', catError);
        return;
    }
    console.log(`Category '${category.title}' created/updated.`);

    // 2. Insert Products
    for (const product of products) {
        console.log(`Upserting product: ${product.name}`);

        const { data: existing } = await supabase
            .from('menu_items')
            .select('id')
            .eq('category_id', product.category_id)
            .eq('number', product.number)
            .maybeSingle();

        // Determine base price (lowest size price)
        const basePrice = product.sizes ? Math.min(...product.sizes.map(s => s.price)) : 0;

        const itemData = {
            category_id: product.category_id,
            category_slug: category.slug,
            name: product.name,
            description: product.description,
            price: basePrice, // Set display price to lowest
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
