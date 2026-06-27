import { demoAgents, demoStores } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";
import { formatDateTime, storeName } from "../../lib/client-data";

export default function AgentsPage() {
  return (
    <AppShell title="Agents" eyebrow="Local Windows devices">
      <div className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
        <Panel title="Agent health">
          <div className="grid gap-3">
            {demoAgents.map((agent) => (
              <div key={agent.id} className="rounded border border-neutral-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{agent.name}</h2>
                    <p className="mt-1 text-sm text-neutral-500">{storeName(agent.store_id)} · device {agent.id}</p>
                  </div>
                  <StatusPill>{agent.status}</StatusPill>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-neutral-600 sm:grid-cols-2 lg:grid-cols-4">
                  <span>Last seen: {formatDateTime(agent.last_seen_at)}</span>
                  <span>Machine: setup pending</span>
                  <span>App: setup pending</span>
                  <span>Queue: placeholder</span>
                </div>
                <p className="mt-3 text-sm"><StatusPill>{agent.status === "online" ? "healthy" : "offline"}</StatusPill></p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Setup new agent">
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm font-medium">
              <span>Store</span>
              <select className="h-10 rounded border border-neutral-300 bg-white px-3">
                {demoStores.map((store) => <option key={store.id}>{store.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              <span>Agent name</span>
              <input className="h-10 rounded border border-neutral-300 bg-white px-3" placeholder="Billing PC name" />
            </label>
            <div className="rounded border border-neutral-200 p-3 text-sm leading-6 text-neutral-600">
              Download/setup instructions will appear here after the secure one-time token flow is added. Token generation is handled server-side and displayed only once in the secure setup flow later.
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
