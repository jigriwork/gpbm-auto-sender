import { LockKeyhole, ShieldCheck, UserX } from "lucide-react";
import { AppShell } from "../../components/nav";
import { AlertBanner, DataRow, InsightCard, Panel, StatusPill } from "../../components/ui";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" eyebrow="Business controls" subtitle="Security defaults and product guardrails for the tenant dashboard.">
      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Platform defaults" description="These controls are intentionally conservative while live sending and installer flows are completed.">
          <DataRow label="Provider secrets" value={<StatusPill>server-side only</StatusPill>} />
          <DataRow label="Manual cashier entry" value={<StatusPill>disabled by design</StatusPill>} />
          <DataRow label="Supabase" value={<StatusPill>live service layer</StatusPill>} />
          <DataRow label="Audit logs" value={<StatusPill>placeholder model ready</StatusPill>} />
          <DataRow label="Customer data" value={<StatusPill>redacted in lists</StatusPill>} />
        </Panel>
        <div className="grid gap-4">
          <InsightCard title="Secrets are write-only" detail="Provider credentials should never be displayed after save." icon={<LockKeyhole size={18} />} />
          <InsightCard title="No manual bill entry" detail="The product should read PDFs automatically, not ask cashiers to type customer details." icon={<UserX size={18} />} />
          <InsightCard title="Tenant boundaries" detail="Business-scoped records must remain isolated by backend policy." icon={<ShieldCheck size={18} />} />
        </div>
      </div>
      <div className="mt-5">
        <AlertBanner title="Backend security remains Cline-owned" detail="UI should present safe states, but RLS, encryption, vault/KMS, and server authorization are backend responsibilities." />
      </div>
    </AppShell>
  );
}
