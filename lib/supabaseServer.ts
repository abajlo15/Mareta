import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // Na serverskoj strani u App Routeru često nam ne trebaju set/remove,
        // jer login/odjava ide kroz klijentske helper-e.
        set() {
          // no-op
        },
        remove() {
          // no-op
        },
      },
    }
  );
}


