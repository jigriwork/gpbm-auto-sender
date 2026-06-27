import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";

export default function SubscriptionPage() {
  return (
    <AppShell title="Subscription" eyebrow="Business" subtitle="Plan and usage controls are prepared for SaaS billing but payment is not enabled yet.">
      <div className="grid gap-4 md:grid-cols-3">
        {["Starter", "Growth", "Scale"].map((plan) => (
          <Panel key={plan} title={`${plan} plan`} action={<StatusPill>placeholder</StatusPill>}>
            <p className="text-sm leading-6 text-neutral-600">Usage limits, billing rules, and payment integration will connect here later.</p>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
