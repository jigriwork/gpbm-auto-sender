import { demoBillingSources } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";

export default function BillingSourcesPage() {
  return (
    <AppShell title="Billing Sources" eyebrow="Configurable sources">
      <Panel title="Source types">
        {[
          ["Generic PDF Folder Watcher", "Any billing software that saves bill PDFs can work."],
          ["Logic PDF Profile", "Profile slot for Logic-generated PDFs."],
          ["Marg PDF Profile", "Profile slot for Marg-generated PDFs."],
          ["Tally PDF Profile", "Profile slot for Tally export PDFs."],
          ["Custom PDF Profile", "Tenant-specific profile from sample PDFs."]
        ].map(([source, detail]) => (
          <div key={source} className="grid gap-1 border-b border-neutral-200 py-3 last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <span className="font-medium">{source}</span>
              <p className="mt-1 text-sm text-neutral-500">{detail}</p>
            </div>
            <StatusPill>{source === "Generic PDF Folder Watcher" ? "available" : "placeholder"}</StatusPill>
          </div>
        ))}
      </Panel>
      <p className="mt-4 text-sm leading-6 text-neutral-600">
        Logic is not hardcoded. Cloud stores source profiles only; local folder paths are configured in the installed agent for each store.
      </p>
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
