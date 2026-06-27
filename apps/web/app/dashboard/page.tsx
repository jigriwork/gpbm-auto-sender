"use client";

import { useEffect, useMemo, useState } from "react";
import { demoAgents, demoBills, demoStores } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";
import { useBusinessContext } from "../../lib/business-context";
import { formatMoney, readApi, withBusinessId, type ApiState } from "../../lib/client-data";

type DashboardSummary = {
  sent_today: number;
  failed_today: number;
  duplicates: number;
  invalid_mobile: number;
  retry_queue: number;
  agents_online: number;
  agents_offline: number;
  store_wise_counts: Record<string, Record<string, number>>;
};

const fallbackSummary: DashboardSummary = {
  sent_today: demoBills.filter((bill) => bill.status === "sent").length,
  failed_today: demoBills.filter((bill) => bill.status === "failed").length,
  duplicates: demoBills.filter((bill) => bill.status === "duplicate").length,
  invalid_mobile: demoBills.filter((bill) => bill.status === "invalid_mobile").length,
  retry_queue: demoBills.filter((bill) => ["failed", "retrying", "queued"].includes(bill.status)).length,
  agents_online: demoAgents.filter((agent) => agent.status === "online").length,
  agents_offline: demoAgents.filter((agent) => agent.status !== "online").length,
  store_wise_counts: demoStores.reduce<Record<string, Record<string, number>>>((acc, store) => {
    acc[store.id] = {};
    demoBills.filter((bill) => bill.store_id === store.id).forEach((bill) => {
      acc[store.id][bill.status] = (acc[store.id][bill.status] ?? 0) + 1;
    });
    return acc;
  }, {})
};

export default function DashboardPage() {
  const [state, setState] = useState<ApiState<DashboardSummary>>({ status: "loading" });
  const business = useBusinessContext();

  useEffect(() => {
    let active = true;
    if (!business.selectedBusinessId) {
      setState({ status: business.status === "loading" ? "loading" : "auth", data: fallbackSummary, message: business.message || "Select a business to load dashboard data." });
      return;
    }
    readApi<DashboardSummary>(withBusinessId("/api/dashboard/summary", business.selectedBusinessId)).then((result) => {
      if (!active) return;
      if (result.ok) setState({ status: "ready", data: result.data });
      else setState({ status: result.status === 401 ? "auth" : "error", data: fallbackSummary, message: result.message });
    });
    return () => {
      active = false;
    };
  }, [business.message, business.selectedBusinessId, business.status]);

  const data = state.data ?? fallbackSummary;
  const metrics = useMemo(() => [
    { label: "Sent today", value: data.sent_today, detail: "Delivered from live bill records" },
    { label: "Failed today", value: data.failed_today, detail: "Provider, upload, or send failures" },
    { label: "Duplicates", value: data.duplicates, detail: "Stopped before sending" },
    { label: "Invalid mobile", value: data.invalid_mobile, detail: "Needs customer data review" },
    { label: "Retry queue", value: data.retry_queue, detail: "Queued, retrying, or failed" },
    { label: "Agents", value: `${data.agents_online}/${data.agents_online + data.agents_offline}`, detail: "Online agents out of total" }
  ], [data]);

  return (
    <AppShell title="Dashboard" eyebrow="Live tenant overview">
      {state.status === "loading" ? <Notice title="Loading live dashboard" detail="Reading dashboard summary from the backend." /> : null}
      {state.status === "auth" || state.status === "error" ? <Notice title="Connect account" detail={state.message ?? "Live data is not ready."} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <Panel key={metric.label}>
            <p className="text-sm text-neutral-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
            <p className="mt-2 text-sm text-neutral-600">{metric.detail}</p>
          </Panel>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Store-wise counts">
          <div className="grid gap-3">
            {demoStores.map((store) => {
              const counts = data.store_wise_counts[store.id] ?? {};
              const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
              return (
                <div key={store.id} className="rounded border border-neutral-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{store.name}</p>
                      <p className="text-sm text-neutral-500">Generic PDF Folder Watcher</p>
                    </div>
                    <StatusPill>{total ? `${total} bills` : "empty"}</StatusPill>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-600">
                    {Object.keys(counts).length ? Object.entries(counts).map(([status, count]) => <StatusPill key={status}>{status}: {count}</StatusPill>) : "No bill records yet."}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Recent demo context">
          <div className="grid gap-3">
            {demoBills.map((bill) => (
              <div key={bill.id} className="rounded border border-neutral-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{bill.bill_number}</p>
                  <StatusPill>{bill.status}</StatusPill>
                </div>
                <p className="mt-1 text-sm text-neutral-500">{formatMoney(bill.bill_amount)} · fallback sample only</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function Notice({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mb-5 rounded border border-neutral-300 bg-white p-4">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-neutral-600">{detail}</p>
    </div>
  );
}
