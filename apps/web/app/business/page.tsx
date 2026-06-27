import { demoBusiness } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { DataRow, Panel, StatusPill } from "../../components/ui";

export default function BusinessPage() {
  return (
    <AppShell title="Business" eyebrow="Tenant layer">
      <Panel title="Business profile">
        <DataRow label="Name" value={demoBusiness.name} />
        <DataRow label="Plan" value={demoBusiness.plan} />
        <DataRow label="Status" value={<StatusPill>{demoBusiness.status}</StatusPill>} />
        <DataRow label="Business ID" value={demoBusiness.id} />
      </Panel>
    </AppShell>
  );
}
