"use client";

import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../lib/supabase-browser";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    localStorage.removeItem("gpbm_dashboard_access_token");
    router.replace("/login");
  }
  return <button onClick={logout} className="inline-flex h-11 items-center justify-center rounded border border-neutral-300 px-4 text-sm font-semibold text-black">Logout</button>;
}