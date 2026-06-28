import { FolderSync, ListChecks } from "lucide-react";
import { AppShell } from "../../components/nav";
import { SettingsResourcePage } from "../../components/settings-resource-page";
import { InsightCard, Panel, StatusBadge } from "../../components/ui";

const sourceTypes = ["Generic PDF Folder Watcher", "Logic PDF Profile", "Marg PDF Profile", "Tally PDF Profile", "Custom PDF Profile"];

export default function BillingSourcesPage() {
  return (
    <AppShell title="Billing Sources" eyebrow="Configurable sources" subtitle="Billing software is configuration. The first implementation is a generic PDF folder watcher.">
      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <InsightCard title="Folder paths stay local" detail="Incoming/sent/failed/duplicate folder paths belong in the installed agent, not in public frontend code." icon={<FolderSync size={18} />} />
        <InsightCard title="Software-neutral design" detail="Logic, Marg, and Tally are profile options, not hardcoded platform assumptions." icon={<ListChecks size={18} />} />
      </div>
      <Panel title="Source type roadmap" description="Only Generic PDF Folder Watcher needs structure now; others stay as profiles.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {sourceTypes.map((source, index) => <div key={source} className="private-soft-panel p-3"><p className="font-semibold">{source}</p><p className="mt-3"><StatusBadge tone={index === 0 ? "success" : "muted"}>{index === 0 ? "available" : "profile slot"}</StatusBadge></p></div>)}
        </div>
      </Panel>
      <div className="mt-5">
        <SettingsResourcePage
          apiPath="/api/billing-sources"
          title="Billing sources"
          description="Source definitions are generic and not tied only to Logic."
          concept="A billing source describes the bill origin type. The local agent handles the actual folder path and file watching."
          guidance={[
            "Start new stores with Generic PDF Folder Watcher.",
            "Use software_name to document Logic, Marg, Tally, or custom systems.",
            "Keep local machine folder paths out of frontend records unless a secure backend model is added."
          ]}
          fields={[
            { name: "name", label: "Name", required: true },
            { name: "source_type", label: "Source type", placeholder: "generic_pdf_folder", required: true },
            { name: "software_name", label: "Software name", placeholder: "Logic / Tally / Custom" },
            { name: "store_id", label: "Store ID optional" },
            { name: "config", label: "Config JSON", type: "json", placeholder: "{}" },
            { name: "status", label: "Status", placeholder: "active" }
          ]}
          defaults={{ status: "active", config: "{}" }}
        />
      </div>
    </AppShell>
  );
}
