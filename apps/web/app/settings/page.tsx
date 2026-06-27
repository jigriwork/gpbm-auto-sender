import { AppShell } from "../../components/nav";
import { DataRow, Panel, StatusPill } from "../../components/ui";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" eyebrow="Security and platform">
      <Panel title="Platform defaults">
        <DataRow label="Provider secrets" value={<StatusPill>server-side only</StatusPill>} />
        <DataRow label="Manual cashier entry" value={<StatusPill>disabled by design</StatusPill>} />
        <DataRow label="Supabase" value="planned service layer" />
        <DataRow label="Audit logs" value="placeholder model ready" />
      </Panel>
    </AppShell>
  );
}
