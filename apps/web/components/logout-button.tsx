"use client";

import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../lib/supabase-browser";

export function LogoutButton({ variant = "light" }: { variant?: "light" | "dark" }) {
  const router = useRouter();
  async function logout() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    localStorage.removeItem("gpbm_dashboard_access_token");
    localStorage.removeItem("gpbm_selected_business_id");
    localStorage.removeItem("gpbm_business_id");
    router.replace("/login");
  }
  const className = variant === "dark"
    ? "inline-flex h-11 w-full items-center justify-center rounded border border-neutral-700 px-4 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
    : "inline-flex h-11 items-center justify-center rounded border border-neutral-300 px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white";
  return <button type="button" onClick={logout} className={className}>Logout</button>;
}