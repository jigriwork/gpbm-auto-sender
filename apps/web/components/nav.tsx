import Link from "next/link";
import {
  Building2,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquare,
  Radio,
  ReceiptText,
  Settings,
  Store,
  Workflow
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/business", label: "Business", icon: Building2 },
  { href: "/stores", label: "Stores", icon: Store },
  { href: "/billing-sources", label: "Sources", icon: Workflow },
  { href: "/parser-profiles", label: "Parsers", icon: FileText },
  { href: "/whatsapp-providers", label: "Providers", icon: MessageSquare },
  { href: "/templates", label: "Templates", icon: ReceiptText },
  { href: "/bills", label: "Bills", icon: Home },
  { href: "/agents", label: "Agents", icon: Radio },
  { href: "/subscription", label: "Plan", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children, title, eyebrow }: { children: React.ReactNode; title: string; eyebrow?: string }) {
  return (
    <div className="shell-grid min-h-screen">
      <aside className="border-b border-neutral-300 bg-black px-5 py-4 text-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded bg-white text-sm font-black text-black">GA</span>
          <span>
            <span className="block text-sm font-semibold">GPBM Auto Sender</span>
            <span className="block text-xs text-neutral-400">SaaS bill delivery</span>
          </span>
        </Link>
        <nav className="mt-6 grid grid-cols-2 gap-1 lg:grid-cols-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-11 items-center gap-3 rounded px-3 text-sm text-neutral-300 transition hover:bg-white hover:text-black"
            >
              <item.icon aria-hidden="true" size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-9 lg:py-8">
        <header className="mb-6 flex flex-col gap-3 border-b border-neutral-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">{eyebrow}</p> : null}
            <h1 className="text-3xl font-semibold leading-tight text-black sm:text-4xl">{title}</h1>
          </div>
          <Link href="/onboarding" className="inline-flex h-11 items-center justify-center rounded bg-black px-4 text-sm font-semibold text-white">
            Setup business
          </Link>
        </header>
        {children}
      </main>
    </div>
  );
}
