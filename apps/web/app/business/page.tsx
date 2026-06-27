"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/nav";
import { DataRow, Panel, StatusPill } from "../../components/ui";
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
  const checklist: Array<[string, boolean]> = [
    ["Business selected", Boolean(current?.id)],
    ["Stores added", counts.stores > 0],
    ["Agents registered", counts.agents > 0],
    ["Provider configured", false],
    ["Template mapped", false],
    ["Test bill sent", false]
  ];

  return (
    <AppShell title="Business" eyebrow="Tenant layer">
      {state.status === "loading" ? <p className="mb-4 rounded border border-neutral-300 bg-white p-3 text-sm text-neutral-600">Loading business profile.</p> : null}
      {state.status === "auth" || state.status === "error" ? <p className="mb-4 rounded border border-neutral-300 bg-white p-3 text-sm text-neutral-600">{state.message}</p> : null}
      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Business profile">
          <DataRow label="Name" value={current?.name ?? "Not available"} />
          <DataRow label="Slug" value={current?.slug ?? "Not set"} />
          <DataRow label="Status" value={<StatusPill>{current?.status ?? "unknown"}</StatusPill>} />
          <DataRow label="User role" value={formatRole(role)} />
          <DataRow label="Platform role" value={platformRole ? formatRole(platformRole) : "None"} />
          <DataRow label="Stores" value={counts.stores} />
          <DataRow label="Agents" value={counts.agents} />
          <DataRow label="Provider status" value={<StatusPill>check provider page</StatusPill>} />
        </Panel>
        <Panel title="Setup completeness">
          <div className="grid gap-2">
            {checklist.map(([label, done]) => (
              <div key={String(label)} className="flex items-center justify-between gap-3 rounded border border-neutral-200 p-3">
                <span className="text-sm font-medium">{label}</span>
                <StatusPill>{done ? "done" : "pending"}</StatusPill>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
