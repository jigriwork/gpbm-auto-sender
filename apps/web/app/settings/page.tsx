import { AppShell } from "../../components/nav";
import { DataRow, Panel, StatusPill } from "../../components/ui";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" eyebrow="Business" subtitle="Security defaults and platform guardrails for the tenant dashboard.">
      <Panel title="Platform defaults" description="These controls are intentionally conservative while live sending and installer flows are completed.">
        <DataRow label="Provider secrets" value={<StatusPill>server-side only</StatusPill>} />
        <DataRow label="Manual cashier entry" value={<StatusPill>disabled by design</StatusPill>} />
        <DataRow label="Supabase" value={<StatusPill>live service layer</StatusPill>} />
        <DataRow label="Audit logs" value={<StatusPill>placeholder model ready</StatusPill>} />
      </Panel>
    </AppShell>
  );
}
