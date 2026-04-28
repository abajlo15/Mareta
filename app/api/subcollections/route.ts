import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json([]);
    }

    const supabase = await createClient();
    const collectionIdParam = request.nextUrl.searchParams.get("collectionId");
    let query = supabase
      .from('subcollections')
      .select('id, name, thumbnail_url, collection_id')
      .order('name', { ascending: true });

    if (collectionIdParam) {
      query = query.eq("collection_id", collectionIdParam);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
