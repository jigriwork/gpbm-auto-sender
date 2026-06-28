import { Store, Workflow } from "lucide-react";
import { AppShell } from "../../components/nav";
import { SettingsResourcePage } from "../../components/settings-resource-page";
import { InsightCard } from "../../components/ui";

export default function StoresPage() {
  return (
    <AppShell title="Stores" eyebrow="Store layer" subtitle="Stores are business-scoped and later link to sources, parser profiles, templates, and agents.">
      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <InsightCard title="Store-scoped setup" detail="Each store can have its own folder watcher, parser profile, template, provider defaults, and bill logs." icon={<Store size={18} />} />
        <InsightCard title="GPBM seed examples" detail="Go Planet and Brand Mark are first demo stores, not product limits." icon={<Workflow size={18} />} />
      </div>
      <SettingsResourcePage
        apiPath="/api/stores"
        title="Stores"
        description="Create and manage tenant stores such as Go Planet and Brand Mark."
        concept="Every store belongs to one business. Store records should later show linked billing source, parser, template, and agent readiness."
        guidance={[
          "Use clear store names that match owner reporting.",
          "Store code is useful for bill number prefixes and local agent labels.",
          "Inactive stores should not receive new bill sends."
        ]}
        fields={[
          { name: "name", label: "Store name", required: true },
          { name: "code", label: "Store code", placeholder: "GP" },
          { name: "status", label: "Status", placeholder: "active" }
        ]}
        defaults={{ status: "active" }}
      />
    </AppShell>
  );
}
