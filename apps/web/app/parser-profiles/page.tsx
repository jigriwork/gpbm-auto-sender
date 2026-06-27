import { AppShell } from "../../components/nav";
import { SettingsResourcePage } from "../../components/settings-resource-page";

export default function ParserProfilesPage() {
  return (
    <AppShell title="Parser Profiles" eyebrow="PDF extraction">
      <SettingsResourcePage apiPath="/api/parser-profiles" title="Parser profiles" description="Parser profiles are tenant-scoped and can be attached to stores or billing sources." fields={[
        { name: "name", label: "Name", required: true },
        { name: "parser_key", label: "Parser key", placeholder: "generic_pdf_v1", required: true },
        { name: "store_id", label: "Store ID optional" },
        { name: "billing_source_id", label: "Billing source ID optional" },
        { name: "config", label: "Config JSON", type: "json", placeholder: "{}" },
        { name: "status", label: "Status", placeholder: "active" }
      ]} defaults={{ status: "active", config: "{}" }} />
    </AppShell>
  );
}