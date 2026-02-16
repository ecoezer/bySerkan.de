
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
    id: 'beilagen-co',
    title: 'Beilagen & Co',
    description: '',
    order: 1, // After Vorspeisen
    slug: 'beilagen-co'
};

// Items from the image
const products = [
    {
        number: 11,
        name: 'Kroketten',
        description: '12 Stk.',
        price: 4.50,
        category_id: category.id,
        allergens: ['A']
    },
    {
        number: 10,
        name: 'Pommes Frites',
        description: '',
        price: 2.50, // Base price (klein)
        category_id: category.id,
        allergens: [],
        // Assuming sizes column exists and is JSONB. 
        // If not, this might fail or be ignored. 
        // Given the previous conversation, we are migrating from a schema that supported sizes.
        sizes: [
            { name: 'klein', price: 2.50 },
            { name: 'groß', price: 3.50 }
        ]
    },
    {
        number: 12,
        name: 'Currywurst mit Pommes',
        description: '',
        price: 7.00,
        category_id: category.id,
        allergens: ['3', '4']
    },
    {
        number: 13,
        name: 'Hähnchen Nuggets (10 Stk.)',
        description: '10 Stück mit Sauce',
        price: 6.50,
        category_id: category.id,
        allergens: ['A', 'G']
    },
    {
        number: 14,
        name: 'Hähnchen Nuggets (6 Stk.)',
        description: '6 Stück mit Sauce',
        price: 4.50,
        category_id: category.id,
        allergens: ['A', 'G']
    },
    {
        number: 15,
        name: 'Hamburger Big',
        description: 'Salat, Tomaten, Zwiebeln, Sauce',
        price: 4.00,
        category_id: category.id,
        allergens: ['A', 'G', 'K', 'L', 'M']
    },
    {
        number: 16,
        name: 'Cheeseburger Big',
        description: 'Salat, Tomaten, Zwiebeln, Sauce, Cheddarkäse',
        price: 4.50,
        category_id: category.id,
        allergens: ['A', 'G', 'K', 'L', 'M']
    },
    {
        number: 17,
        name: 'Falafel im Fladenbrot',
        description: 'Salat & Sauce',
        price: 6.00,
        category_id: category.id,
        allergens: ['A', 'G']
    },
    {
        number: 18,
        name: 'Falafel Dürüm',
        description: 'Salat & Sauce',
        price: 7.00,
        category_id: category.id,
        allergens: ['A', 'G']
    },
    {
        number: 19,
        name: 'Falafel Teller',
        description: '8 Stück mit Pommes, Salat',
        price: 9.00,
        category_id: category.id,
        allergens: []
    }
];

async function seed() {
    console.log('Starting seed for Beilagen & Co...');

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

        const itemData = {
            category_id: product.category_id,
            category_slug: category.slug, // Helper for frontend routing/filtering
            name: product.name,
            description: product.description,
            price: product.price,
            number: product.number,
            allergens: product.allergens,
            sizes: product.sizes || null
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
