import { demoAgents, demoBills, demoStores, metricCards } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" eyebrow="GPBM demo tenant">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((metric) => (
          <Panel key={metric.label}>
            <p className="text-sm text-neutral-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
            <p className="mt-2 text-sm text-neutral-600">{metric.detail}</p>
          </Panel>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Store health">
          <div className="grid gap-3">
            {demoStores.map((store) => (
              <div key={store.id} className="flex items-center justify-between rounded border border-neutral-200 p-3">
                <div>
                  <p className="font-medium">{store.name}</p>
                  <p className="text-sm text-neutral-500">Generic PDF Folder Watcher</p>
                </div>
                <StatusPill>{store.status}</StatusPill>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Recent bill events">
          <div className="grid gap-3">
            {demoBills.map((bill) => (
              <div key={bill.id} className="rounded border border-neutral-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{bill.bill_number}</p>
                  <StatusPill>{bill.status}</StatusPill>
                </div>
                <p className="mt-1 text-sm text-neutral-500">{bill.customer_name || "Customer pending"} - Rs. {bill.bill_amount}</p>
              </div>
            ))}
            {demoAgents.map((agent) => (
              <div key={agent.id} className="rounded border border-neutral-200 p-3">
                <p className="font-medium">{agent.name}</p>
                <p className="mt-1 text-sm text-neutral-500">Agent {agent.status} · Last seen {agent.last_seen_at}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
