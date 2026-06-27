"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
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
    <main className="min-h-screen bg-[#f7f7f4] text-black">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-between bg-black p-6 text-white sm:p-8 lg:p-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded bg-white text-sm font-black text-black">GA</span>
            <span>
              <span className="block text-sm font-semibold">GPBM Auto Sender</span>
              <span className="block text-xs text-neutral-400">Secure dashboard</span>
            </span>
          </Link>
          <div className="my-14 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500">Retail bill automation</p>
            <h1 className="mt-5 text-5xl font-semibold leading-tight sm:text-6xl">Control every bill send from one clean dashboard.</h1>
            <p className="mt-6 text-base leading-7 text-neutral-400">Sign in to manage stores, agents, providers, templates, retries, and bill delivery status.</p>
            <div className="mt-8 grid gap-3">
              {["Supabase session protected", "Business context aware", "Provider secrets stay server-side"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle2 size={17} />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-neutral-500">Built for automatic WhatsApp bill delivery.</p>
        </section>

        <section className="grid place-items-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            <div className="private-card p-6 sm:p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Account login</p>
                  <h2 className="mt-3 text-3xl font-semibold">Welcome back</h2>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded bg-black text-white"><LockKeyhole size={18} /></span>
              </div>
              <form onSubmit={submit} className="grid gap-4">
                <label className="grid gap-2 text-sm font-semibold">
                  Email
                  <input value={email} onChange={(event) => setEmail(event.target.value)} className="private-input h-12" placeholder="owner@business.com" type="email" autoComplete="email" required />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Password
                  <input value={password} onChange={(event) => setPassword(event.target.value)} className="private-input h-12" placeholder="Enter password" type="password" autoComplete="current-password" required />
                </label>
                {message ? <p className="rounded border border-neutral-300 bg-neutral-50 p-3 text-sm text-neutral-700">{message}</p> : null}
                <button disabled={loading} className="private-button mt-2 h-12 disabled:opacity-60">
                  {loading ? "Signing in..." : "Continue to dashboard"} <ArrowRight size={16} />
                </button>
              </form>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-sm text-neutral-600">
              <Link href="/" className="font-semibold text-black">Back to homepage</Link>
              <span>No public signup yet</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
