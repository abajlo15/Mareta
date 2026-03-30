"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="block w-full text-left rounded px-3 py-2 hover:bg-slate-800 text-slate-300 hover:text-white mt-auto"
    >
      Odlogiraj se
    </button>
  );
}
