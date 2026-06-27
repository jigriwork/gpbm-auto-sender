import Link from "next/link";
import { demoBills, demoStores } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";

export default function BillsPage() {
  return (
    <AppShell title="Bills" eyebrow="Bill log layer">
      <Panel title="Recent bills" action={<Link className="text-sm font-semibold" href="/bills/failed">Failed bills</Link>}>
        {demoBills.map((bill) => {
          const store = demoStores.find((item) => item.id === bill.store_id);
          return (
            <div key={bill.id} className="grid gap-2 border-b border-neutral-200 py-4 last:border-b-0 md:grid-cols-[1fr_1fr_auto] md:items-center">
              <div>
                <p className="font-semibold">{bill.bill_number}</p>
                <p className="text-sm text-neutral-500">{store?.name} - {bill.bill_date}</p>
              </div>
              <p className="text-sm text-neutral-600">{bill.customer_name || "Customer pending"} - {bill.customer_mobile || "mobile missing"}</p>
              <StatusPill>{bill.status}</StatusPill>
            </div>
          );
        })}
      </Panel>
    </AppShell>
  );
}
