import { demoAgents } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";

export default function AgentsPage() {
  return (
    <AppShell title="Agents" eyebrow="Local Windows devices">
      <div className="grid gap-4 md:grid-cols-2">
        {demoAgents.map((agent) => (
          <Panel key={agent.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{agent.name}</h2>
                <p className="mt-1 text-sm text-neutral-500">Store ID: {agent.store_id}</p>
              </div>
              <StatusPill>{agent.status}</StatusPill>
            </div>
            <p className="mt-4 text-sm text-neutral-600">Last heartbeat: {agent.last_seen_at}</p>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
