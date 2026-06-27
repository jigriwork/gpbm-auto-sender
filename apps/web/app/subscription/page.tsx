import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";

export default function SubscriptionPage() {
  return (
    <AppShell title="Subscription" eyebrow="Plans placeholder">
      <Panel title="Starter plan">
        <p className="text-sm leading-6 text-neutral-600">Plan and usage enforcement will attach to the business tenant model after Supabase setup.</p>
        <p className="mt-4"><StatusPill>placeholder</StatusPill></p>
      </Panel>
    </AppShell>
  );
}
