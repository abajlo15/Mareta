import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.number().positive(),
  images: z.array(z.string()).optional().default([]),
  categories: z.array(z.string()).optional().default([]),
  subcollection_id: z.string().uuid().optional().nullable(),
  stock: z.number().int().nonnegative().optional().default(0),
  discount_percentage: z.number().int().min(0).max(100).optional().default(0),
  instagram_url: z.string().url().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not configured. Returning empty array.');
      return NextResponse.json([]);
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    let query = supabase
      .from('products')
      .select('*, subcollection:subcollections(id, name, thumbnail_url, collection_id), product_collections(collection:collections(id, name, slug, thumbnail_url))')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      query = query.contains('categories', [category]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      // If table doesn't exist or RLS issue, return empty array
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return NextResponse.json([]);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const normalized = (data ?? []).map((product) => ({
      ...product,
      collections: (product.product_collections ?? [])
        .map((item: { collection: unknown[] | unknown | null }) =>
          Array.isArray(item.collection) ? (item.collection[0] ?? null) : item.collection
        )
        .filter(Boolean),
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check here
    // For now, any authenticated user can create products

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const { data, error } = await supabase
      .from('products')
      .insert([validatedData])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

