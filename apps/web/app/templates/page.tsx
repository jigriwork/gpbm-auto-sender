import { demoStores } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";

const variables = ["customer_name", "store_name", "bill_number", "bill_date", "bill_amount", "pdf_url"];

export default function TemplatesPage() {
  return (
    <AppShell title="Templates" eyebrow="WhatsApp messages">
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Panel title="Template draft">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Template name" value="bill_pdf_delivery" />
            <Field label="Provider" value="MSG91" />
            <Field label="Template ID" value="provider-template-id" />
            <Field label="Language" value="en" />
            <Field label="Category" value="utility" />
            <Field label="Store optional" value="All stores or one selected store" />
          </div>
          <div className="mt-5">
            <p className="text-sm font-semibold">Variable mapping</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {variables.map((variable) => <StatusPill key={variable}>{variable}</StatusPill>)}
            </div>
          </div>
        </Panel>
        <Panel title="Backend endpoints needed">
          <p className="text-sm leading-6 text-neutral-600">
            This UI is a frontend placeholder until template APIs are added. Required endpoints: GET /api/templates,
            POST /api/templates, PATCH /api/templates/:id, with business_id scoping, optional store_id, provider_key,
            template_id, language, category, and variable_mapping.
          </p>
          <div className="mt-4 grid gap-2">
            {demoStores.map((store) => <StatusPill key={store.id}>{store.name} optional mapping</StatusPill>)}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      <span>{label}</span>
      <input className="h-10 rounded border border-neutral-300 bg-white px-3 text-sm" defaultValue={value} />
    </label>
  );
}
