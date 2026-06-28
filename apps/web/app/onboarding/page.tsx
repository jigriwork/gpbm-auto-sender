import Link from "next/link";
import { AppShell } from "../../components/nav";
import { AlertBanner, Panel, ProgressChecklist, SetupStepCard, StatusPill, Timeline } from "../../components/ui";

const steps = [
  ["Business profile", "Confirm tenant, owner membership, plan, and business defaults.", "/business", "ready"],
  ["Stores", "Create stores such as Go Planet and Brand Mark without hardcoding them.", "/stores", "ready"],
  ["Billing source", "Start with Generic PDF Folder Watcher or choose a software-specific profile later.", "/billing-sources", "ready"],
  ["WhatsApp provider", "Configure MSG91 or Custom API first; future providers remain pluggable.", "/whatsapp-providers", "pending"],
  ["Template", "Map provider template variables for bill PDF delivery.", "/templates", "pending"],
  ["Agent setup", "Install the folder watcher on each billing PC with a one-time token.", "/agents", "pending"],
  ["Test bill flow", "Run a controlled test from a sample PDF before enabling production sends.", "/bills", "needs sample PDF"]
];

export default function OnboardingPage() {
  return (
    <AppShell title="Onboarding" eyebrow="Guided setup" subtitle="Move from tenant setup to a controlled bill-send test without manual cashier entry.">
      <div className="grid gap-5 xl:grid-cols-[0.74fr_1.26fr]">
        <div className="grid gap-5">
          <ProgressChecklist items={steps.map(([title, detail, , status]) => ({ label: title, detail, done: status === "ready" }))} />
          <Panel title="GPBM current setup" action={<StatusPill>seed/live mixed</StatusPill>}>
            <div className="grid gap-3 text-sm text-neutral-700">
              <Row label="Business" value="GPBM" />
              <Row label="Stores" value="Go Planet, Brand Mark" />
              <Row label="Provider" value="MSG91 target, live confirmation pending" />
              <Row label="Source" value="Generic PDF Folder Watcher" />
              <Row label="Parser" value="Needs sample PDFs" />
            </div>
          </Panel>
          <AlertBanner title="Do not enable live sends yet" detail="Provider credentials, template mapping, parser samples, and agent heartbeat all need confirmation before customer sends." tone="warning" />
        </div>
        <div className="grid gap-4">
          {steps.map(([title, detail, href, status], index) => (
            <SetupStepCard
              key={title}
              index={index + 1}
              title={title}
              detail={detail}
              status={status}
              required={index !== 0}
              action={<Link href={href} className="private-button private-button-secondary">Open step</Link>}
            />
          ))}
        </div>
      </div>
      <div className="mt-5">
        <Panel title="Expected test path">
          <Timeline items={[
            { title: "Prepare sample bill", detail: "Use a real sample PDF from each store/source format.", status: "needs owner sample" },
            { title: "Run parser test", detail: "Confirm name, mobile, amount, date, and bill number extraction.", status: "pending" },
            { title: "Queue test send", detail: "Send only to an approved test number after provider is configured.", status: "pending" },
            { title: "Review dashboard", detail: "Check sent/failed/retry events before production.", status: "pending" }
          ]} />
        </Panel>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-neutral-200 py-2 last:border-b-0"><span className="text-neutral-500">{label}</span><span className="text-right font-semibold text-black">{value}</span></div>;
}
