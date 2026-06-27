import { demoBills } from "../../../lib/demo";
import { AppShell } from "../../../components/nav";
import { Panel, StatusPill } from "../../../components/ui";

export default function FailedBillsPage() {
  const failedBills = demoBills.filter((bill) => bill.status !== "sent");
  return (
    <AppShell title="Failed Bills" eyebrow="Needs automated retry or review">
      <Panel title="Failure queue">
        {failedBills.map((bill) => (
          <div key={bill.id} className="flex items-center justify-between gap-3 border-b border-neutral-200 py-4 last:border-b-0">
            <div>
              <p className="font-semibold">{bill.bill_number}</p>
              <p className="text-sm text-neutral-500">{bill.status === "invalid_mobile" ? "Parser could not confirm a valid mobile number." : "Queued for retry."}</p>
            </div>
            <StatusPill>{bill.status}</StatusPill>
          </div>
        ))}
      </Panel>
    </AppShell>
  );
}
