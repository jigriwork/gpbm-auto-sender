"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./logout-button";
import { formatRole, useBusinessContext } from "../lib/business-context";
import { PageHeader, StatusPill } from "./ui";
import {
  AlertTriangle,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Radio,
  ReceiptText,
  Settings,
  Store,
  Workflow
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/bills", label: "Bills", icon: ReceiptText },
      { href: "/bills/failed", label: "Failed bills", icon: AlertTriangle }
    ]
  },
  {
    label: "Setup",
    items: [
      { href: "/onboarding", label: "Onboarding", icon: Workflow },
      { href: "/stores", label: "Stores", icon: Store },
      { href: "/billing-sources", label: "Billing sources", icon: Workflow },
      { href: "/parser-profiles", label: "Parser profiles", icon: FileText },
      { href: "/whatsapp-providers", label: "WhatsApp providers", icon: MessageSquare },
      { href: "/templates", label: "Templates", icon: ReceiptText },
      { href: "/agents", label: "Agents", icon: Radio }
    ]
  },
  {
    label: "Business",
    items: [
      { href: "/business", label: "Business profile", icon: Building2 },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/subscription", label: "Subscription", icon: CreditCard }
    ]
  }
];

export function AppShell({ children, title, eyebrow, subtitle }: { children: React.ReactNode; title: string; eyebrow?: string; subtitle?: string }) {
  const pathname = usePathname();
  const business = useBusinessContext();
  const currentRole = business.isSuperAdmin ? "Super Admin" : formatRole(business.selectedRole);

  return (
    <div className="private-shell">
      <div className="private-shell-grid">
        <Sidebar pathname={pathname} />
        <main className="private-main">
          <div className="private-content">
            <PageHeader
              eyebrow={eyebrow}
              title={title}
              subtitle={subtitle}
              action={
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end">
                  <AccountCard email={business.email} businessName={business.selectedBusiness?.name} role={currentRole} isSuperAdmin={business.isSuperAdmin} loading={business.status === "loading"} />
                  {business.businesses.length > 1 ? (
                    <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
                      Business
                      <select className="private-input min-w-52 text-sm normal-case tracking-normal" value={business.selectedBusinessId} onChange={(event) => business.selectBusiness(event.target.value)}>
                        {business.businesses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                      </select>
                    </label>
                  ) : null}
                  <Link href="/onboarding" className="private-button">Setup business</Link>
                </div>
              }
            />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="private-sidebar">
      <Link href="/dashboard" className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded bg-white text-sm font-black text-black">GA</span>
        <span>
          <span className="block text-sm font-semibold">GPBM Auto Sender</span>
          <span className="block text-xs text-neutral-400">SaaS bill delivery</span>
        </span>
      </Link>
      <nav className="mt-7 grid gap-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">{group.label}</p>
            <div className="grid gap-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex min-h-10 items-center gap-3 rounded px-3 text-sm font-medium transition ${active ? "bg-white text-black" : "text-neutral-300 hover:bg-white hover:text-black"}`}
                  >
                    <item.icon aria-hidden="true" size={17} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-7 border-t border-neutral-800 pt-4">
        <LogoutButton variant="dark" />
      </div>
    </aside>
  );
}

function AccountCard({ email, businessName, role, isSuperAdmin, loading }: { email: string; businessName?: string; role: string; isSuperAdmin: boolean; loading: boolean }) {
  return (
    <div className="private-card-compact min-w-0 px-3 py-2 text-sm">
      <p className="truncate font-semibold">{email || "Not signed in"}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
        <span>{businessName ?? (loading ? "Loading business" : "No business selected")}</span>
        <span>/</span>
        <span>{role}</span>
        {isSuperAdmin ? <StatusPill>Super Admin</StatusPill> : null}
      </div>
    </div>
  );
}
