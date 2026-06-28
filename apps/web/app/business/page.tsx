"use client";

import { useEffect, useState } from "react";
import { Building2, Radio, Store } from "lucide-react";
import { AppShell } from "../../components/nav";
import { DataRow, ErrorState, LoadingState, MetricCard, Panel, ProgressChecklist, StatusPill } from "../../components/ui";
import { formatRole, useBusinessContext } from "../../lib/business-context";
import { readApi, withBusinessId, type ApiState } from "../../lib/client-data";

type CurrentBusinessResponse = {
  data?: { id: string; name?: string | null; slug?: string | null; status?: string | null };
  role?: string | null;
  platform_role?: string | null;
};

type CountResponse = { data: unknown[] };

export default function BusinessPage() {
  const business = useBusinessContext();
  const [state, setState] = useState<ApiState<CurrentBusinessResponse>>({ status: "loading" });
  const [counts, setCounts] = useState({ stores: 0, agents: 0 });

  useEffect(() => {
    let active = true;
    if (!business.selectedBusinessId) {
      setState({ status: business.status === "loading" ? "loading" : "auth", message: business.message || "Select a business to load profile." });
      return;
    }

    readApi<CurrentBusinessResponse>(withBusinessId("/api/businesses/current", business.selectedBusinessId)).then((result) => {
      if (!active) return;
      if (result.ok) setState({ status: "ready", data: result.data });
      else setState({ status: result.status === 401 ? "auth" : "error", message: result.message });
    });

    Promise.all([
      readApi<CountResponse>(withBusinessId("/api/stores", business.selectedBusinessId)),
      readApi<CountResponse>(withBusinessId("/api/agents", business.selectedBusinessId))
    ]).then(([stores, agents]) => {
      if (!active) return;
      setCounts({ stores: stores.ok ? stores.data.data.length : 0, agents: agents.ok ? agents.data.data.length : 0 });
    });

    return () => {
      active = false;
    };
  }, [business.message, business.selectedBusinessId, business.status]);

  const current = state.data?.data ?? business.selectedBusiness;
  const role = state.data?.role ?? business.selectedRole;
  const platformRole = state.data?.platform_role ?? business.platformRole;
  const checklist = [
    { label: "Business selected", done: Boolean(current?.id), detail: "Tenant context is available." },
    { label: "Stores added", done: counts.stores > 0, detail: "At least one store exists." },
    { label: "Agents registered", done: counts.agents > 0, detail: "At least one device is registered." },
    { label: "Provider configured", done: false, detail: "Check WhatsApp providers page." },
    { label: "Template mapped", done: false, detail: "Check Templates page." },
    { label: "Test bill sent", done: false, detail: "Requires sample PDF and provider setup." }
  ];

  return (
    <AppShell title="Business" eyebrow="Tenant profile" subtitle="Review selected business context, role, setup progress, stores, and agents.">
      {state.status === "loading" ? <LoadingState title="Loading business profile" detail="Reading selected business and membership." /> : null}
      {state.status === "auth" || state.status === "error" ? <ErrorState title="Business unavailable" detail={state.message ?? "Business profile could not be loaded."} /> : null}
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <MetricCard label="Stores" value={counts.stores} detail="Business-scoped stores" />
        <MetricCard label="Agents" value={counts.agents} detail="Registered local devices" />
        <MetricCard label="Role" value={business.isSuperAdmin ? "Super Admin" : formatRole(role)} detail="Current dashboard access" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Business profile" description="This data should come from the authenticated business context.">
          <DataRow label="Name" value={current?.name ?? "Not available"} />
          <DataRow label="Slug" value={current?.slug ?? "Not set"} />
          <DataRow label="Status" value={<StatusPill>{current?.status ?? "unknown"}</StatusPill>} />
          <DataRow label="Business ID" value={current?.id ?? "Not selected"} />
          <DataRow label="User role" value={formatRole(role)} />
          <DataRow label="Platform role" value={platformRole ? formatRole(platformRole) : "None"} />
        </Panel>
        <ProgressChecklist items={checklist} />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Panel title="Store layer"><Store size={20} /><p className="mt-3 text-sm leading-6 text-neutral-600">Stores own source/parser/template/agent links and bill reporting.</p></Panel>
        <Panel title="Business layer"><Building2 size={20} /><p className="mt-3 text-sm leading-6 text-neutral-600">Every tenant-safe record must include business_id.</p></Panel>
        <Panel title="Agent layer"><Radio size={20} /><p className="mt-3 text-sm leading-6 text-neutral-600">Local agents should authenticate with one-time token setup and heartbeat.</p></Panel>
      </div>
    </AppShell>
  );
}
