import { Download, Folder, Radio, ShieldCheck } from "lucide-react";
import { AppShell } from "../../components/nav";
import { SettingsResourcePage } from "../../components/settings-resource-page";
import { AlertBanner, InsightCard, Panel, Timeline } from "../../components/ui";

export default function AgentsPage() {
  return (
    <AppShell title="Agents" eyebrow="Local Windows devices" subtitle="Create local watcher devices, rotate one-time tokens safely, and monitor setup readiness.">
      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <InsightCard title="Agent health" detail="Heartbeat endpoints exist. Online/offline state depends on installed local agents." icon={<Radio size={18} />} />
        <InsightCard title="One-time tokens" detail="Tokens are shown only during create/rotate. GET never returns token values." icon={<ShieldCheck size={18} />} />
        <InsightCard title="No cashier popup" detail="The agent watches folders and queues bills automatically. No manual customer entry." icon={<Folder size={18} />} />
      </div>
      <SettingsResourcePage
        apiPath="/api/agents"
        title="Agents"
        description="Each billing PC should have one agent assigned to a store and parser/source profile."
        concept="Creating an agent generates a one-time token in the API response. Copy it immediately and paste it into the local agent config."
        guidance={[
          "Install the local Node/Windows agent on the billing PC.",
          "Paste the one-time token, business ID, store ID, billing source ID, and parser profile ID.",
          "Configure incoming, sent, failed, and duplicate folders locally.",
          "Run watch mode and confirm heartbeat appears online.",
          "Do not add cashier manual-entry flows."
        ]}
        fields={[
          { name: "store_id", label: "Store ID", required: true, help: "Assign this agent to the store whose PDF folder it watches." },
          { name: "name", label: "Agent name", placeholder: "Go Planet billing PC", required: true },
          { name: "device_code", label: "Device code optional" },
          { name: "machine_name", label: "Machine name optional" },
          { name: "config", label: "Config JSON", type: "json", placeholder: "{}" },
          { name: "status", label: "Status", placeholder: "active" }
        ]}
        defaults={{ status: "active", config: "{}" }}
      />
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Agent setup guide" action={<span className="inline-flex items-center gap-2 text-sm font-semibold"><Download size={16} /> installer pending</span>}>
          <Timeline items={[
            { title: "Install agent", detail: "Installer/download page is still pending. For now, the Node agent package is the reference implementation.", status: "pending" },
            { title: "Paste token", detail: "Use the one-time token from create or rotate. Token values are not shown after refresh.", status: "secure" },
            { title: "Set folders", detail: "Configure incoming, sent, failed, and duplicate paths on the local PC.", status: "local" },
            { title: "Run watch mode", detail: "Agent watches PDF bills and sends heartbeat to backend.", status: "planned" }
          ]} />
        </Panel>
        <AlertBanner title="Installer not built yet" detail="This UI prepares the setup flow, but a packaged Windows installer is outside this phase and should wait until agent behavior is finalized." />
      </div>
    </AppShell>
  );
}
