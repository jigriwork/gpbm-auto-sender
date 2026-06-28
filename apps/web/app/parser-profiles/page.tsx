import { FileSearch, TestTube2 } from "lucide-react";
import { AppShell } from "../../components/nav";
import { SettingsResourcePage } from "../../components/settings-resource-page";
import { AlertBanner, InsightCard, Panel, StatusBadge } from "../../components/ui";

const demoProfiles = ["generic_pdf_v1", "logic_pdf_v1", "gpbm_go_planet_demo", "gpbm_brand_mark_demo"];

export default function ParserProfilesPage() {
  return (
    <AppShell title="Parser Profiles" eyebrow="PDF extraction" subtitle="Parser profiles describe how bill fields are extracted and when confidence is safe enough to send.">
      <div className="mb-5 grid gap-4 md:grid-cols-2">
        <InsightCard title="Needs sample PDFs" detail="Real parser confidence cannot be claimed until bill samples from each format are tested." icon={<FileSearch size={18} />} />
        <InsightCard title="Safe failure" detail="Missing mobile, bill number, date, or amount should fail safely before WhatsApp sending." icon={<TestTube2 size={18} />} />
      </div>
      <Panel title="Demo parser profiles" description="These are planned parser/profile names, not proof of real extraction accuracy.">
        <div className="flex flex-wrap gap-2">{demoProfiles.map((profile) => <StatusBadge key={profile} tone="muted">{profile}</StatusBadge>)}</div>
      </Panel>
      <div className="mt-5">
        <AlertBanner title="Parser test placeholder" detail="Run-test UX is prepared conceptually, but real parser testing needs sample bill PDFs and backend/parser implementation." />
      </div>
      <div className="mt-5">
        <SettingsResourcePage
          apiPath="/api/parser-profiles"
          title="Parser profiles"
          description="Parser profiles are tenant-scoped and can be attached to stores or billing sources."
          concept="Profiles should define source type, field rules, required fields, and confidence thresholds. This UI stores profile metadata; real test execution is pending sample PDFs."
          guidance={[
            "Use generic_pdf_v1 for first folder-watcher trials.",
            "Use Logic/Marg/Tally profiles as source-specific parser slots.",
            "Do not enable production sending until sample PDFs pass extraction checks."
          ]}
          fields={[
            { name: "name", label: "Name", required: true },
            { name: "parser_key", label: "Parser key", placeholder: "generic_pdf_v1", required: true },
            { name: "store_id", label: "Store ID optional" },
            { name: "billing_source_id", label: "Billing source ID optional" },
            { name: "config", label: "Config JSON", type: "json", placeholder: "{}" },
            { name: "status", label: "Status", placeholder: "active" }
          ]}
          defaults={{ status: "active", config: "{}" }}
        />
      </div>
    </AppShell>
  );
}
