import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GENDERS = ["male", "female"] as const;
type Gender = (typeof GENDERS)[number];

const isValidGender = (value: unknown): value is Gender =>
  typeof value === "string" && GENDERS.includes(value as Gender);

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json([]);
    }

    const supabase = await createClient();
    const genderParam = request.nextUrl.searchParams.get("gender");
    let query = supabase
      .from('subcollections')
      .select('id, name, gender, thumbnail_url')
      .order('name', { ascending: true });

    if (isValidGender(genderParam)) {
      query = query.eq("gender", genderParam);
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
