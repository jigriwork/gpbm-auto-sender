"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../../lib/supabase-browser";
import { readApi, setSelectedBusinessId } from "../../lib/client-data";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    const me = await readApi<{ selected_business?: string | null }>("/api/me");
    if (me.ok && me.data.selected_business) setSelectedBusinessId(me.data.selected_business);
    router.replace("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-black px-4 text-white">
      <section className="w-full max-w-md rounded border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">Secure dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm">
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 rounded border border-neutral-700 bg-black px-3 outline-none focus:border-white" placeholder="owner@business.com" type="email" autoComplete="email" required />
          </label>
          <label className="grid gap-2 text-sm">
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 rounded border border-neutral-700 bg-black px-3 outline-none focus:border-white" placeholder="password" type="password" autoComplete="current-password" required />
          </label>
          {message ? <p className="rounded border border-red-900 bg-red-950 p-3 text-sm text-red-100">{message}</p> : null}
          <button disabled={loading} className="mt-2 inline-flex h-12 items-center justify-center rounded bg-white font-semibold text-black disabled:opacity-60">
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>
      </section>
    </main>
  );
}
