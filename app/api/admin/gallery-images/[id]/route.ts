import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { normalizeImageDisplaySettings, settingsToRowFields } from "@/types/imageDisplay";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { id } = await params;

  const body = await request.json();
  const settings = normalizeImageDisplaySettings(body?.settings ?? body);
  const rowFields = settingsToRowFields(settings);

  const { data, error } = await supabase
    .from("gallery_images")
    .update(rowFields)
    .eq("id", id)
    .select("id, image_url, position, focal_x, focal_y, zoom, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: Params) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { id } = await params;

  const { error } = await supabase.from("gallery_images").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
