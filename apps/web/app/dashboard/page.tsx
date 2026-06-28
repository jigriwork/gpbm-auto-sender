"use client";

import { useEffect, useMemo, useState } from "react";
import { FileCheck2, MessageSquare, Radio, ReceiptText } from "lucide-react";
import { demoAgents, demoBills, demoStores } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { AgentHealthBadge, AlertBanner, EmptyState, ErrorState, InsightCard, LoadingState, MetricCard, Panel, ProviderBadge, StatusBadge, StatusPill, Timeline } from "../../components/ui";
import { formatMoney, readApi, withBusinessId, type ApiState } from "../../lib/client-data";
import { formatRole, useBusinessContext } from "../../lib/business-context";

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
      setState({ status: business.status === "loading" ? "loading" : "auth", data: fallbackSummary, message: business.message || "Sign in and select a business to load dashboard data." });
      return;
    }
    setState((current) => ({ status: "loading", data: current.data }));
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
  const totalAgents = data.agents_online + data.agents_offline;
  const liveData = state.status === "ready";
  const metrics = useMemo(() => [
    { label: "Sent today", value: data.sent_today, detail: liveData ? "Delivered from live bill records" : "Fallback sample until sign-in/live data", trend: liveData ? "live" : "sample" },
    { label: "Failed today", value: data.failed_today, detail: "Provider, upload, or send failures" },
    { label: "Retry queue", value: data.retry_queue, detail: "Queued, retrying, or failed" },
    { label: "Duplicates blocked", value: data.duplicates, detail: "Stopped before sending" },
    { label: "Invalid mobile", value: data.invalid_mobile, detail: "Needs customer data review" },
    { label: "Agents online", value: `${data.agents_online}/${totalAgents || 0}`, detail: "Online agents out of total" }
  ], [data, liveData, totalAgents]);

  return (
    <AppShell title="Dashboard" eyebrow="Command center" subtitle="Live tenant overview for bill automation, agent health, retries, and setup readiness.">
      {state.status === "loading" ? <LoadingState title="Loading dashboard" detail="Reading live dashboard summary from the backend." /> : null}
      {state.status === "auth" ? <ErrorState title="Sign-in required" detail={state.message ?? "Please sign in to load live dashboard data."} /> : null}
      {state.status === "error" ? <ErrorState title="Dashboard data unavailable" detail={state.message ?? "Live data is not available right now."} /> : null}

      <section className="private-card mb-5 overflow-hidden">
        <div className="grid gap-5 bg-black p-5 text-white lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Current workspace</p>
            <h2 className="mt-2 text-2xl font-semibold">{business.selectedBusiness?.name ?? "Business not selected"}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
              {liveData ? "Showing live Supabase-backed bill and agent status." : "Showing safe setup/fallback state until a signed-in business context is available."}
            </p>
          </div>
          <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-[420px]">
            <MiniStat label="Role" value={business.isSuperAdmin ? "Super Admin" : formatRole(business.selectedRole)} />
            <MiniStat label="Agents" value={`${data.agents_online} online`} />
            <MiniStat label="Readiness" value={liveData ? "Live" : "Setup pending"} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
        <Panel title="Bill flow overview" description="The operational flow remains visible even while parser/provider pieces are being completed.">
          <Timeline items={[
            { title: "Detected", detail: "Agent sees a new PDF in the configured incoming folder.", status: "agent" },
            { title: "Parsed", detail: "Parser profile extracts mobile, bill number, date, amount, and customer name.", status: "needs samples" },
            { title: "Queued", detail: "Backend stores PDF metadata and prepares selected provider/template.", status: "backend" },
            { title: "Sent", detail: "WhatsApp provider sends the PDF bill to the customer.", status: "provider" },
            { title: "Tracked", detail: "Dashboard records sent, failed, duplicate, retry, and invalid states.", status: "live logs" }
          ]} />
        </Panel>
        <Panel title="Setup warnings" description="These are intentional blockers before real customer sends.">
          <div className="grid gap-3">
            <InsightCard title="Provider not configured" detail="Connect provider credentials before live sending." icon={<MessageSquare size={18} />} badge={<ProviderBadge configured={false} />} />
            <InsightCard title="Template missing" detail="Map WhatsApp template variables before production sends." icon={<ReceiptText size={18} />} badge={<StatusBadge tone="warning">pending</StatusBadge>} />
            <InsightCard title="Parser not tested" detail="Sample bill PDFs are required before parser confidence can be trusted." icon={<FileCheck2 size={18} />} badge={<StatusBadge tone="warning">needs samples</StatusBadge>} />
            {data.agents_offline > 0 ? <InsightCard title="Agent offline" detail={`${data.agents_offline} agent(s) are not online.`} icon={<Radio size={18} />} badge={<StatusBadge tone="warning">attention</StatusBadge>} /> : null}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Store-wise overview" description="Go Planet and Brand Mark are seed/demo examples. Future stores should appear from live business records.">
          <div className="grid gap-3">
            {demoStores.map((store) => {
              const counts = data.store_wise_counts[store.id] ?? {};
              const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
              return (
                <div key={store.id} className="private-card-compact p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{store.name}</p>
                      <p className="mt-1 text-sm text-neutral-500">Generic PDF Folder Watcher</p>
                    </div>
                    <StatusPill>{total ? `${total} bills` : "empty"}</StatusPill>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.keys(counts).length ? Object.entries(counts).map(([status, count]) => <StatusPill key={status}>{status}: {count}</StatusPill>) : <span className="text-sm text-neutral-500">No bill records yet.</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="System health">
          <div className="grid gap-3">
            <HealthRow label="Agent status" badge={<AgentHealthBadge online={data.agents_online > 0} />} detail={`${data.agents_online} online, ${data.agents_offline} offline`} />
            <HealthRow label="WhatsApp provider" badge={<ProviderBadge configured={false} />} detail="Provider credential status exists, but live send should stay disabled until confirmed." />
            <HealthRow label="Parser status" badge={<StatusPill tone="warning">needs samples</StatusPill>} detail="Sample PDFs are required before real parser confidence." />
            <HealthRow label="Storage/upload" badge={<StatusPill>backend ready</StatusPill>} detail="Private PDF storage is handled by backend APIs." />
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Recent activity" description="Live activity should come from bill event APIs. Fallback examples are clearly labeled.">
          {!liveData ? <AlertBanner title="Fallback examples" detail="The rows below are sample bill records used only when the signed-in live context is not available." /> : null}
          <div className="mt-4 grid gap-3">
            {demoBills.length ? demoBills.map((bill) => (
              <div key={bill.id} className="private-card-compact flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{bill.bill_number}</p>
                  <p className="mt-1 text-sm text-neutral-500">{formatMoney(bill.bill_amount)} - fallback sample only</p>
                </div>
                <StatusPill>{bill.status}</StatusPill>
              </div>
            )) : <EmptyState detail="No bill events have been recorded yet." />}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-neutral-800 bg-neutral-950 p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}

function HealthRow({ label, badge, detail }: { label: string; badge: React.ReactNode; detail: string }) {
  return (
    <div className="private-card-compact p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">{label}</p>
        {badge}
      </div>
      <p className="mt-2 text-xs leading-5 text-neutral-600">{detail}</p>
    </div>
  );
}
