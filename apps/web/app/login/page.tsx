import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-4 text-white">
      <section className="w-full max-w-md rounded border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">Secure dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm">
            Email
            <input className="h-12 rounded border border-neutral-700 bg-black px-3 outline-none focus:border-white" placeholder="owner@business.com" />
          </label>
          <label className="grid gap-2 text-sm">
            Password
            <input className="h-12 rounded border border-neutral-700 bg-black px-3 outline-none focus:border-white" placeholder="password" type="password" />
          </label>
          <Link href="/dashboard" className="mt-2 inline-flex h-12 items-center justify-center rounded bg-white font-semibold text-black">
            Continue
          </Link>
        </div>
      </section>
    </main>
  );
}
