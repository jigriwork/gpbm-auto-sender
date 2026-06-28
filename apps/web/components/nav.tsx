"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoutButton } from "./logout-button";
import { formatRole, useBusinessContext } from "../lib/business-context";
import { PageHeader, ProgressChecklist, StatusBadge, StatusPill } from "./ui";
import {
  AlertTriangle,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Radio,
  ReceiptText,
  Settings,
  Store,
  Workflow,
  X
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

const setupItems = [
  { label: "Business", done: true, detail: "Tenant context" },
  { label: "Stores", done: true, detail: "Go Planet and Brand Mark examples" },
  { label: "Provider", done: false, detail: "Credentials required" },
  { label: "Template", done: false, detail: "Variables pending" },
  { label: "Agent", done: false, detail: "Install flow pending" }
];

export function AppShell({ children, title, eyebrow, subtitle }: { children: React.ReactNode; title: string; eyebrow?: string; subtitle?: string }) {
  const pathname = usePathname();
  const business = useBusinessContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentRole = business.isSuperAdmin ? "Super Admin" : formatRole(business.selectedRole);

  return (
    <div className="private-shell">
      <MobileHeader onOpen={() => setMobileOpen(true)} businessName={business.selectedBusiness?.name} title={title} />
      {mobileOpen ? (
        <div className="private-mobile-drawer">
          <Sidebar pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <button type="button" aria-label="Close navigation" className="bg-transparent" onClick={() => setMobileOpen(false)} />
          <button type="button" aria-label="Close navigation" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded bg-white text-black" onClick={() => setMobileOpen(false)}><X size={18} /></button>
        </div>
      ) : null}
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

function MobileHeader({ onOpen, businessName, title }: { onOpen: () => void; businessName?: string; title: string }) {
  return (
    <header className="private-mobile-header">
      <button type="button" aria-label="Open navigation" className="grid h-10 w-10 place-items-center rounded border border-neutral-300 bg-white" onClick={onOpen}>
        <Menu size={18} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-neutral-500">{businessName ?? "Business not selected"}</p>
      </div>
      <Link href="/dashboard" className="grid h-10 w-10 place-items-center rounded bg-black text-xs font-black text-white">GA</Link>
    </header>
  );
}

function Sidebar({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <aside className="private-sidebar">
      <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded bg-white text-sm font-black text-black">GA</span>
        <span>
          <span className="block text-sm font-semibold">GPBM Auto Sender</span>
          <span className="block text-xs text-neutral-400">Retail bill automation</span>
        </span>
      </Link>
      <nav className="private-sidebar-nav">
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
                    data-active={active ? "true" : "false"}
                    className="private-nav-link"
                    onClick={onNavigate}
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
      <div className="mt-6 hidden lg:block">
        <ProgressChecklist items={setupItems} />
      </div>
      <div className="private-sidebar-footer">
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
        <StatusBadge tone="muted">setup pending</StatusBadge>
      </div>
    </div>
  );
}
