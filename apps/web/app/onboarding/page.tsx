import { AppShell } from "../../components/nav";
import { Panel, SetupStepCard, StatusPill } from "../../components/ui";

const steps = [
  ["Create business", "Create the tenant, owner membership, plan, and audit defaults."],
  ["Add stores", "Add each store and keep store-specific source, parser, and agent links."],
  ["Choose billing source", "Start with Generic PDF Folder Watcher or choose a software-specific profile later."],
  ["Choose WhatsApp provider", "Configure MSG91 or Custom API first; future providers remain pluggable."],
  ["Add template", "Map provider template variables for bill PDF delivery."],
  ["Install local agent", "Install the folder watcher on each billing PC through a one-time secure setup flow."],
  ["Test bill sending", "Run a controlled test from a sample PDF before enabling production sends."]
];

export default function OnboardingPage() {
  return (
    <AppShell title="Onboarding" eyebrow="Setup" subtitle="Follow the SaaS setup path from tenant creation to test bill sending.">
      <div className="grid gap-4 lg:grid-cols-2">
        {steps.map(([title, detail], index) => (
          <SetupStepCard key={title} index={index + 1} title={title} detail={detail} status={index < 4 ? "ready" : "placeholder"} />
        ))}
      </div>
      <div className="mt-5">
        <Panel title="GPBM demo" action={<StatusPill>seed view</StatusPill>}>
          <div className="grid gap-3 text-sm text-neutral-700 sm:grid-cols-2 lg:grid-cols-4">
            <span>Business: GPBM</span>
            <span>Stores: Go Planet, Brand Mark</span>
            <span>Provider: MSG91 test mode</span>
            <span>Source: Generic PDF Folder Watcher</span>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
