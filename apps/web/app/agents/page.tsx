import { AppShell } from "../../components/nav";
import { SettingsResourcePage } from "../../components/settings-resource-page";

export default function AgentsPage() {
  return (
    <AppShell title="Agents" eyebrow="Local Windows devices">
      <SettingsResourcePage apiPath="/api/agents" title="Agents" description="Creating an agent generates a one-time token in the API response. GET never returns tokens." fields={[
        { name: "store_id", label: "Store ID", required: true },
        { name: "name", label: "Agent name", placeholder: "Billing PC", required: true },
        { name: "device_code", label: "Device code optional" },
        { name: "machine_name", label: "Machine name optional" },
        { name: "config", label: "Config JSON", type: "json", placeholder: "{}" },
        { name: "status", label: "Status", placeholder: "active" }
      ]} defaults={{ status: "active", config: "{}" }} />
    </AppShell>
  );
}