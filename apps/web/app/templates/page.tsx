import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";

export default function TemplatesPage() {
  return (
    <AppShell title="Templates" eyebrow="WhatsApp messages">
      <Panel title="Bill PDF template">
        <p className="text-sm leading-6 text-neutral-600">
          Template variables are prepared for customer name, bill number, bill date, amount, PDF URL, store, and business.
          Provider-specific template IDs will be stored per business.
        </p>
        <p className="mt-4"><StatusPill>placeholder</StatusPill></p>
      </Panel>
    </AppShell>
  );
}
