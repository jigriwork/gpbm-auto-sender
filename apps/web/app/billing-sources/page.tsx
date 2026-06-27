import { demoBillingSources } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";

export default function BillingSourcesPage() {
  return (
    <AppShell title="Billing Sources" eyebrow="Configurable sources">
      <Panel title="Source types">
        {["Generic PDF Folder Watcher", "Logic PDF Profile", "Marg PDF Profile", "Tally PDF Profile", "Custom PDF Profile"].map((source) => (
          <div key={source} className="flex items-center justify-between border-b border-neutral-200 py-3 last:border-b-0">
            <span className="font-medium">{source}</span>
            <StatusPill>{source === "Generic PDF Folder Watcher" ? "available" : "placeholder"}</StatusPill>
          </div>
        ))}
      </Panel>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {demoBillingSources.map((source) => (
          <Panel key={source.id}>
            <h2 className="font-semibold">{source.name}</h2>
            <p className="mt-2 text-sm text-neutral-500">{source.source_type}</p>
            <p className="mt-4"><StatusPill>{source.status}</StatusPill></p>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
