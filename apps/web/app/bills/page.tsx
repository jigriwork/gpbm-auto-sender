"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BillStatus } from "@gpbm/shared";
import { Eye, MoreHorizontal, RefreshCw } from "lucide-react";
import { demoBills, demoStores } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Button, DataTable, Drawer, EmptyState, ErrorState, FilterBar, LoadingState, MobileDataCard, Panel, SelectInput, StatusPill, Tabs, TextInput, Timeline } from "../../components/ui";
import { useBusinessContext } from "../../lib/business-context";
import { formatDateTime, formatMoney, readApi, redactMobile, redactName, safeMessage, storeName, writeApi, type ApiState } from "../../lib/client-data";

type BillRow = {
  id: string;
  store_id: string;
  customer_name?: string | null;
  customer_mobile?: string | null;
  bill_number?: string | null;
  bill_date?: string | null;
  bill_amount?: number | string | null;
  currency?: string | null;
  status: BillStatus;
  provider_key?: string | null;
  provider_message_id?: string | null;
  pdf_path?: string | null;
  retry_count?: number | null;
  sent_at?: string | null;
  created_at?: string | null;
  error_message?: string | null;
};

type BillsResponse = { data: BillRow[]; pagination: { count: number; limit: number; offset: number } };

const retryable = new Set<BillStatus>(["failed", "queued", "retrying"]);
const statusTabs = [
  { value: "", label: "All" },
  { value: "sent", label: "Sent" },
  { value: "failed", label: "Failed" },
  { value: "queued", label: "Queued" },
  { value: "retrying", label: "Retrying" },
  { value: "invalid_mobile", label: "Invalid mobile" },
  { value: "duplicate", label: "Duplicate" }
];

export default function BillsPage() {
  const [filters, setFilters] = useState({ store: "", status: "", from: "", to: "", mobile: "", bill: "" });
  const [state, setState] = useState<ApiState<BillRow[]>>({ status: "loading" });
  const [resendingId, setResendingId] = useState("");
  const [selectedBill, setSelectedBill] = useState<BillRow | null>(null);
  const business = useBusinessContext();

  const query = useMemo(() => {
    const params = new URLSearchParams({ limit: "100" });
    if (business.selectedBusinessId) params.set("business_id", business.selectedBusinessId);
    if (filters.store) params.set("store_id", filters.store);
    if (filters.status) params.set("status", filters.status);
    if (filters.from) params.set("date_from", filters.from);
    if (filters.to) params.set("date_to", filters.to);
    if (filters.mobile) params.set("mobile", filters.mobile);
    if (filters.bill) params.set("bill_number", filters.bill);
    return params.toString();
  }, [business.selectedBusinessId, filters]);

  useEffect(() => {
    let active = true;
    if (!business.selectedBusinessId) {
      setState({ status: business.status === "loading" ? "loading" : "auth", data: [], message: business.message || "Select a business to load bills." });
      return;
    }
    setState((current) => ({ status: "loading", data: current.data }));
    readApi<BillsResponse>(`/api/bills?${query}`).then((result) => {
      if (!active) return;
      if (result.ok) setState(result.data.data.length ? { status: "ready", data: result.data.data } : { status: "empty", data: [], message: "No bills match these filters yet." });
      else setState({ status: result.status === 401 ? "auth" : "error", data: demoBills as BillRow[], message: result.message });
    });
    return () => {
      active = false;
    };
  }, [business.message, business.selectedBusinessId, business.status, query]);

  async function resend(bill: BillRow) {
    if (!business.selectedBusinessId) {
      setState((current) => ({ ...current, message: "Select a business before requesting resend." }));
      return;
    }
    setResendingId(bill.id);
    const result = await writeApi(`/api/bills/${bill.id}/resend`, "POST", { business_id: business.selectedBusinessId });
    setResendingId("");
    if (!result.ok) {
      setState((current) => ({ ...current, message: result.message || "Resend could not be queued safely." }));
      return;
    }
    setFilters((current) => ({ ...current }));
  }

  const rows = state.data ?? [];

  return (
    <AppShell title="Bills" eyebrow="Bill monitoring" subtitle="Filter, inspect, and retry bill PDF sends across stores without exposing customer data unnecessarily.">
      <Tabs tabs={statusTabs} active={filters.status} onChange={(status) => setFilters((current) => ({ ...current, status }))} />
      <div className="mt-4">
        <FilterBar action={<Link className="text-sm font-semibold" href="/bills/failed">Open failed queue</Link>}>
          <Select label="Store" value={filters.store} onChange={(store) => setFilters((current) => ({ ...current, store }))} options={[["", "All stores"], ...demoStores.map((store) => [store.id, store.name] as [string, string])]} />
          <Input label="Bill no." value={filters.bill} onChange={(bill) => setFilters((current) => ({ ...current, bill }))} placeholder="Bill number" />
          <Input label="Mobile" value={filters.mobile} onChange={(mobile) => setFilters((current) => ({ ...current, mobile }))} placeholder="Exact mobile" />
          <Input label="From" type="date" value={filters.from} onChange={(from) => setFilters((current) => ({ ...current, from }))} />
          <Input label="To" type="date" value={filters.to} onChange={(to) => setFilters((current) => ({ ...current, to }))} />
          <Button type="button" variant="secondary" onClick={() => setFilters({ store: "", status: "", from: "", to: "", mobile: "", bill: "" })}>Clear</Button>
        </FilterBar>
      </div>

      <div className="mt-5">
        <Panel title="Recent bills" description="Desktop uses a dense table; mobile uses readable cards. Names and mobiles are redacted.">
          {state.status === "loading" ? <LoadingState title="Loading bills" detail="Reading bill records from the backend." /> : null}
          {state.status === "auth" || state.status === "error" ? <ErrorState title="Bills unavailable" detail={state.message ?? "Live bill data is not available."} /> : null}
          {state.status === "empty" ? <EmptyState detail={state.message} /> : null}
          {rows.length ? (
            <>
              <DataTable headers={["Date/time", "Store", "Customer", "Mobile", "Bill", "Amount", "Status", "Provider", "Retry", "Sent at", "Actions"]}>
                {rows.map((bill) => (
                  <tr key={bill.id}>
                    <td>{formatDateTime(bill.created_at ?? bill.bill_date)}</td>
                    <td>{storeName(bill.store_id)}</td>
                    <td>{redactName(bill.customer_name)}</td>
                    <td>{redactMobile(bill.customer_mobile)}</td>
                    <td className="font-semibold">{bill.bill_number ?? "Pending"}</td>
                    <td>{formatMoney(bill.bill_amount, bill.currency ?? "INR")}</td>
                    <td><StatusPill>{bill.status}</StatusPill></td>
                    <td>{bill.provider_key ?? "Default"}</td>
                    <td>{bill.retry_count ?? 0}</td>
                    <td>{formatDateTime(bill.sent_at)}</td>
                    <td>
                      <div className="flex gap-2">
                        <Button variant="secondary" type="button" title={safeMessage(bill.error_message)} onClick={() => setSelectedBill(bill)}><Eye size={15} /> Details</Button>
                        {retryable.has(bill.status) ? (
                          <Button type="button" disabled={resendingId === bill.id} onClick={() => resend(bill)}>
                            <RefreshCw size={15} /> {resendingId === bill.id ? "Queueing" : "Resend"}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </DataTable>
              <div className="grid gap-3 lg:hidden">
                {rows.map((bill) => (
                  <MobileDataCard
                    key={bill.id}
                    title={bill.bill_number ?? "Bill pending"}
                    subtitle={`${storeName(bill.store_id)} / ${formatDateTime(bill.created_at ?? bill.bill_date)}`}
                    rows={[
                      ["Customer", redactName(bill.customer_name)],
                      ["Mobile", redactMobile(bill.customer_mobile)],
                      ["Amount", formatMoney(bill.bill_amount, bill.currency ?? "INR")],
                      ["Status", <StatusPill key="status">{bill.status}</StatusPill>],
                      ["Retry", bill.retry_count ?? 0]
                    ]}
                    footer={<div className="flex flex-wrap gap-2"><Button variant="secondary" type="button" onClick={() => setSelectedBill(bill)}><MoreHorizontal size={15} /> Details</Button>{retryable.has(bill.status) ? <Button type="button" disabled={resendingId === bill.id} onClick={() => resend(bill)}>Resend</Button> : null}</div>}
                  />
                ))}
              </div>
            </>
          ) : null}
        </Panel>
      </div>

      <Drawer open={Boolean(selectedBill)} title="Bill details" onClose={() => setSelectedBill(null)}>
        {selectedBill ? <BillDetails bill={selectedBill} onResend={resend} resending={resendingId === selectedBill.id} /> : null}
      </Drawer>
    </AppShell>
  );
}

function BillDetails({ bill, onResend, resending }: { bill: BillRow; onResend: (bill: BillRow) => void; resending: boolean }) {
  return (
    <div className="grid gap-5">
      <div className="private-soft-panel p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Bill summary</p>
        <h3 className="mt-2 text-xl font-semibold">{bill.bill_number ?? "Bill pending"}</h3>
        <div className="mt-4 grid gap-2 text-sm">
          <Detail label="Store" value={storeName(bill.store_id)} />
          <Detail label="Customer" value={redactName(bill.customer_name)} />
          <Detail label="Mobile" value={redactMobile(bill.customer_mobile)} />
          <Detail label="Amount" value={formatMoney(bill.bill_amount, bill.currency ?? "INR")} />
          <Detail label="Status" value={<StatusPill>{bill.status}</StatusPill>} />
          <Detail label="Provider message" value={bill.provider_message_id ?? "Backend field pending"} />
          <Detail label="PDF path" value={bill.pdf_path ?? "PDF view endpoint pending"} />
          <Detail label="Error" value={safeMessage(bill.error_message)} />
        </div>
        {retryable.has(bill.status) ? <Button className="mt-4 w-full" type="button" disabled={resending} onClick={() => onResend(bill)}>{resending ? "Queueing resend" : "Queue resend"}</Button> : null}
      </div>
      <Panel title="Event timeline" description="A real bill_events API can replace this placeholder timeline later.">
        <Timeline items={[
          { title: "Detected", detail: "PDF was detected or imported into the bill workflow.", status: bill.created_at ? formatDateTime(bill.created_at) : "pending" },
          { title: "Parsed", detail: "Parser extracted bill details. Missing fields should appear in backend events.", status: "placeholder" },
          { title: "Provider send", detail: "Provider response and message ID will appear when backend exposes event history.", status: bill.status }
        ]} />
      </Panel>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex items-start justify-between gap-3 border-b border-neutral-200 py-2 last:border-b-0"><span className="text-neutral-500">{label}</span><span className="max-w-[60%] text-right font-medium">{value}</span></div>;
}

function Input({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      <span>{label}</span>
      <TextInput type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      <span>{label}</span>
      <SelectInput value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}
      </SelectInput>
    </label>
  );
}
