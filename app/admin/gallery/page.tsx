import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import GalleryManager from "./galleryManager";

export default async function AdminGalleryPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  let { data: images, error } = await supabase
    .from("gallery_images")
    .select("id, image_url, position, focal_x, focal_y, zoom")
    .order("position", { ascending: true });

  if (error) {
    const fallback = await supabase
      .from("gallery_images")
      .select("id, image_url")
      .order("created_at", { ascending: false });
    images = (fallback.data ?? []).map((image) => ({
      ...image,
      position: 0,
      focal_x: 50,
      focal_y: 50,
      zoom: 1,
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Galerija i hero slike</h2>
        <p className="text-slate-600 mt-1">
          Slike koje dodaš ovdje prikazuju se i u galeriji i na hero sekciji početne stranice.
        </p>
      </div>
      <GalleryManager initialImages={images ?? []} />
    </div>
  );
}
