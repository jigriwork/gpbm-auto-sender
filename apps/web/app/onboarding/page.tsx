import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";

const steps = [
  ["Business", "Create tenant, owner, plan, and safe defaults."],
  ["Stores", "Add stores such as Go Planet and Brand Mark without hardcoding them."],
  ["Billing source", "Choose Generic PDF Folder Watcher or another profile later."],
  ["WhatsApp provider", "Select MSG91, Custom API, or a future provider."],
  ["Parser profile", "Attach field rules and confidence thresholds."],
  ["Agent setup", "Install local Windows watcher with token-based auth."]
];

export default function OnboardingPage() {
  return (
    <AppShell title="Onboarding" eyebrow="SaaS setup flow">
      <div className="grid gap-4 lg:grid-cols-2">
        {steps.map(([title, detail], index) => (
          <Panel key={title}>
            <div className="flex items-start gap-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-black text-sm font-semibold text-white">{index + 1}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{title}</h2>
                  <StatusPill>Ready for Supabase</StatusPill>
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{detail}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
