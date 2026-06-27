"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { formatRole, useBusinessContext } from "../lib/business-context";
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
  const pathname = usePathname();
  const business = useBusinessContext();
  const currentRole = business.isSuperAdmin ? "Super Admin" : formatRole(business.selectedRole);

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
              className={`flex min-h-11 items-center gap-3 rounded px-3 text-sm transition hover:bg-white hover:text-black ${pathname === item.href ? "bg-white text-black" : "text-neutral-300"}`}
            >
              <item.icon aria-hidden="true" size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-neutral-800 pt-4">
          <LogoutButton variant="dark" />
        </div>
      </aside>
      <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-9 lg:py-8">
        <header className="mb-6 grid gap-4 border-b border-neutral-300 pb-5 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">{eyebrow}</p> : null}
            <h1 className="text-3xl font-semibold leading-tight text-black sm:text-4xl">{title}</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end">
            <div className="min-w-0 rounded border border-neutral-300 bg-white px-3 py-2 text-sm">
              <p className="truncate font-semibold">{business.email || "Not signed in"}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                <span>{business.selectedBusiness?.name ?? (business.status === "loading" ? "Loading business" : "No business selected")}</span>
                <span>·</span>
                <span>{currentRole}</span>
                {business.isSuperAdmin ? <span className="rounded border border-neutral-300 px-2 py-0.5 font-semibold text-black">Super Admin</span> : null}
              </div>
            </div>
            {business.businesses.length > 1 ? (
              <label className="grid gap-1 text-xs font-semibold text-neutral-600">
                Business
                <select className="h-11 min-w-48 rounded border border-neutral-300 bg-white px-3 text-sm text-black" value={business.selectedBusinessId} onChange={(event) => business.selectBusiness(event.target.value)}>
                  {business.businesses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
            ) : null}
            <Link href="/onboarding" className="inline-flex h-11 items-center justify-center rounded bg-black px-4 text-sm font-semibold text-white">
              Setup business
            </Link>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
