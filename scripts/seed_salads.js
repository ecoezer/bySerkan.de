
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
    id: 'vorspeisen-salate', // Slug-like ID
    title: 'Vorspeisen / Salate',
    description: 'Alle Salate (3-7) mit hausgem. Brötchen und Dressing',
    order: 0, // Vorspeisen usually come first
    slug: 'vorspeisen-salate'
};

const products = [
    {
        number: 1,
        name: 'Zigara Börek',
        description: '4 Stück, Teigröllchen mit Weichkäse gefüllt, Salat & Sauce (A,G)',
        price: 6.00,
        category_id: category.id,
        allergens: ['A', 'G']
    },
    {
        number: 2,
        name: 'Krautsalat',
        description: 'Kraut (rot-weiß) und Dressing oder Essig/Öl',
        price: 5.50,
        category_id: category.id,
        allergens: []
    },
    {
        number: 3,
        name: 'Gemischter Salat',
        description: 'Eisbergsalat, Krautsalat, Tomaten, Gurken, Mais, Weichkäse, Peperoni & Dressing (4,A,C,G)',
        price: 7.50,
        category_id: category.id,
        allergens: ['4', 'A', 'C', 'G']
    },
    {
        number: 4,
        name: 'Schinken-Käsesalat',
        description: 'Eisbergsalat, Krautsalat, Tomaten, Gurken, Formfleischschinken, Mais, Käse & Dressing (4,3,A,G)',
        price: 7.50,
        category_id: category.id,
        allergens: ['4', '3', 'A', 'G']
    },
    {
        number: 5,
        name: 'Thunfischsalat',
        description: 'Eisbergsalat, Krautsalat, Tomaten, Gurken, Mais, Thunfisch & Dressing (A,D,G)',
        price: 8.00,
        category_id: category.id,
        allergens: ['A', 'D', 'G']
    },
    {
        number: 6,
        name: 'Hähnchensalat',
        description: 'Eisbergsalat, Krautsalat, Tomaten, Gurken, Hähnchenbrust, Mais, Käse & Dressing (A,G)',
        price: 8.00,
        category_id: category.id,
        allergens: ['A', 'G']
    },
    {
        number: 7,
        name: 'Chefsalat',
        description: 'Kebapfleisch (Kalb- oder Hähnchenfleisch) gem. Salat, Krautsalat, Weichkäse, Mais & Dressing (3,4,8,A,G,K,L)',
        price: 8.00,
        category_id: category.id,
        allergens: ['3', '4', '8', 'A', 'G', 'K', 'L']
    }
];

async function seed() {
    console.log('Starting seed...');

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

        let error;
        if (existing) {
            // Update
            const { error: updateError } = await supabase
                .from('menu_items')
                .update({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    allergens: product.allergens,
                    category_slug: category.slug
                })
                .eq('id', existing.id);
            error = updateError;
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from('menu_items')
                .insert({
                    id: randomUUID(), // Manually generate UUID
                    category_id: product.category_id,
                    category_slug: category.slug,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    number: product.number,
                    allergens: product.allergens
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
