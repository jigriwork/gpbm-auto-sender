import { AppShell } from "../../components/nav";
import { AlertBanner, Button, MetricCard, Panel, StatusPill } from "../../components/ui";

const plans = [
  ["Starter", "For first store validation", "1-2 stores", "Basic bill dashboard", "Single provider setup"],
  ["Growth", "For multi-store retail", "Store-wise reports", "Retry operations", "Multiple local agents"],
  ["Scale", "For larger rollouts", "Super admin view", "Audit readiness", "Provider flexibility"],
  ["Enterprise", "For custom deployment", "Custom provider work", "Security review", "Priority setup"]
];

export default function SubscriptionPage() {
  return (
    <AppShell title="Subscription" eyebrow="Plans placeholder" subtitle="Plan and usage controls are prepared for SaaS billing, but payment integration is not enabled yet.">
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <MetricCard label="Current plan" value="Starter" detail="Placeholder until billing is connected" />
        <MetricCard label="Usage tracking" value="Pending" detail="Needs backend plan enforcement" />
        <MetricCard label="Payment" value="Disabled" detail="No payment integration in this phase" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map(([plan, detail, a, b, c]) => (
          <Panel key={plan} title={`${plan} plan`} action={<StatusPill>placeholder</StatusPill>}>
            <p className="text-sm leading-6 text-neutral-600">{detail}</p>
            <div className="mt-5 grid gap-2 text-sm">
              {[a, b, c].map((item) => <span key={item} className="rounded border border-neutral-200 bg-neutral-50 px-3 py-2">{item}</span>)}
            </div>
            <Button className="mt-5 w-full" variant="secondary" type="button">Configure later</Button>
          </Panel>
        ))}
      </div>
      <div className="mt-5">
        <AlertBanner title="Honest placeholder" detail="This page is SaaS-ready as UI structure, but billing, payment, limits, and subscription enforcement still need backend/product decisions." />
      </div>
    </AppShell>
  );
}
