import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json([]);
    }

    const supabase = await createClient();
    let { data, error } = await supabase
      .from("gallery_images")
      .select("id, image_url")
      .order("position", { ascending: true });

    if (error) {
      const fallback = await supabase
        .from("gallery_images")
        .select("id, image_url")
        .order("created_at", { ascending: true });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
