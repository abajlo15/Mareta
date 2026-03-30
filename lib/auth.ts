import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabaseServer";

export type AppUser = {
  id: string;
  email: string | null;
  role: "user" | "admin" | string;
};

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Pokušaj iz profiles tablice
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", user.id)
    .single();

  if (profile) {
    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
    };
  }

  // Fallback: app_metadata (postavi u Supabase Dashboard)
  const roleFromMetadata = user.app_metadata?.role as string | undefined;
  return {
    id: user.id,
    email: user.email ?? null,
    role: roleFromMetadata ?? "user",
  };
}

export async function requireAdmin(): Promise<AppUser> {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/"); // ili "/login" ako želiš
  }

  return user;
}


