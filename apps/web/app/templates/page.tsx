import { AppShell } from "../../components/nav";
import { SettingsResourcePage } from "../../components/settings-resource-page";

export default function TemplatesPage() {
  return (
    <AppShell title="Templates" eyebrow="WhatsApp messages">
      <SettingsResourcePage apiPath="/api/templates" title="Templates" description="WhatsApp templates are provider-agnostic and scoped by business with optional store overrides." fields={[
        { name: "provider_key", label: "Provider key", placeholder: "msg91", required: true },
        { name: "template_name", label: "Template name", placeholder: "bill_pdf_delivery", required: true },
        { name: "template_id", label: "Provider template ID" },
        { name: "language", label: "Language", placeholder: "en" },
        { name: "category", label: "Category", placeholder: "utility" },
        { name: "store_id", label: "Store ID optional" },
        { name: "variable_mapping", label: "Variable mapping JSON", type: "json", placeholder: "{}" },
        { name: "status", label: "Status", placeholder: "active" }
      ]} defaults={{ language: "en", category: "utility", status: "active", variable_mapping: "{}" }} />
    </AppShell>
  );
}