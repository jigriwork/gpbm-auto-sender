import { Eye, MessageSquareText, Variable } from "lucide-react";
import { AppShell } from "../../components/nav";
import { SettingsResourcePage } from "../../components/settings-resource-page";
import { AlertBanner, InsightCard, Panel, StatusBadge } from "../../components/ui";

const variables = ["customer_name", "store_name", "bill_number", "bill_date", "bill_amount", "pdf_url"];

export default function TemplatesPage() {
  return (
    <AppShell title="Templates" eyebrow="WhatsApp messages" subtitle="Map provider template IDs to safe bill variables before live sending.">
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <InsightCard title="Utility template" detail="Bill PDF delivery should use an approved WhatsApp utility template." icon={<MessageSquareText size={18} />} />
        <InsightCard title="Variable mapping" detail="Use structured variables instead of raw manual cashier text." icon={<Variable size={18} />} />
        <InsightCard title="Preview before send" detail="Preview is local UI guidance until provider test endpoint is finalized." icon={<Eye size={18} />} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_0.72fr]">
        <div>
          <SettingsResourcePage
            apiPath="/api/templates"
            title="Templates"
            description="WhatsApp templates are provider-agnostic and scoped by business with optional store overrides."
            concept="Template records connect a provider template ID to bill variables. Provider-specific approval still happens in the WhatsApp provider account."
            guidance={[
              "Map customer_name, store_name, bill_number, bill_date, bill_amount, and pdf_url.",
              "Use utility category for bill delivery where provider policy requires it.",
              "Do not store provider secrets in template records."
            ]}
            fields={[
              { name: "provider_key", label: "Provider key", placeholder: "msg91", required: true },
              { name: "template_name", label: "Template name", placeholder: "bill_pdf_delivery", required: true },
              { name: "template_id", label: "Provider template ID" },
              { name: "language", label: "Language", placeholder: "en" },
              { name: "category", label: "Category", placeholder: "utility" },
              { name: "store_id", label: "Store ID optional" },
              { name: "variable_mapping", label: "Variable mapping JSON", type: "json", placeholder: "{}" },
              { name: "status", label: "Status", placeholder: "active" }
            ]}
            defaults={{ language: "en", category: "utility", status: "active", variable_mapping: "{}" }}
          />
        </div>
        <div className="grid gap-5">
          <Panel title="Variable builder" description="These are the expected bill variables. A richer mapping editor can replace JSON after backend shape stabilizes.">
            <div className="flex flex-wrap gap-2">{variables.map((item) => <StatusBadge key={item} tone="muted">{item}</StatusBadge>)}</div>
          </Panel>
          <Panel title="Live preview">
            <div className="rounded border border-neutral-300 bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">
              <p>Hi customer_name, your bill bill_number from store_name dated bill_date for bill_amount is ready.</p>
              <p className="mt-3 font-semibold text-black">PDF: pdf_url</p>
            </div>
          </Panel>
          <AlertBanner title="Provider test pending" detail="Template preview is local only. Real provider template validation requires provider credentials and a test-message backend flow." />
        </div>
      </div>
    </AppShell>
  );
}
