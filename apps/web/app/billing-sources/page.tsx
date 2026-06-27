import { AppShell } from "../../components/nav";
import { SettingsResourcePage } from "../../components/settings-resource-page";

export default function BillingSourcesPage() {
  return (
    <AppShell title="Billing Sources" eyebrow="Configurable sources">
      <SettingsResourcePage apiPath="/api/billing-sources" title="Billing sources" description="Source definitions are generic and not tied to only Logic. Local folder paths stay in the installed agent." fields={[
        { name: "name", label: "Name", required: true },
        { name: "source_type", label: "Source type", placeholder: "generic_pdf_folder", required: true },
        { name: "software_name", label: "Software name", placeholder: "Logic / Tally / Custom" },
        { name: "store_id", label: "Store ID optional" },
        { name: "config", label: "Config JSON", type: "json", placeholder: "{}" },
        { name: "status", label: "Status", placeholder: "active" }
      ]} defaults={{ status: "active", config: "{}" }} />
    </AppShell>
  );
}