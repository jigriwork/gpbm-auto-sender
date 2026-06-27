"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BillStatus } from "@gpbm/shared";
import { demoBills, demoStores } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Button, DataTable, EmptyState, ErrorState, LoadingState, Panel, SelectInput, StatusPill, TextInput } from "../../components/ui";
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
  retry_count?: number | null;
  sent_at?: string | null;
  created_at?: string | null;
  error_message?: string | null;
};

type BillsResponse = { data: BillRow[]; pagination: { count: number; limit: number; offset: number } };

const retryable = new Set<BillStatus>(["failed", "queued", "retrying"]);

export default function BillsPage() {
  const [filters, setFilters] = useState({ store: "", status: "", from: "", to: "", mobile: "", bill: "" });
  const [state, setState] = useState<ApiState<BillRow[]>>({ status: "loading" });
  const [resendingId, setResendingId] = useState("");
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
      if (result.ok) {
        setState(result.data.data.length ? { status: "ready", data: result.data.data } : { status: "empty", data: [], message: "No bills match these filters yet." });
      } else {
        setState({ status: result.status === 401 ? "auth" : "error", data: demoBills as BillRow[], message: result.message });
      }
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
    <AppShell title="Bills" eyebrow="Overview" subtitle="Filter, inspect, and retry bill PDF sends across stores.">
      <Panel title="Filters" action={<Link className="text-sm font-semibold" href="/bills/failed">Failed bills</Link>}>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Select label="Store" value={filters.store} onChange={(store) => setFilters((current) => ({ ...current, store }))} options={[["", "All stores"], ...demoStores.map((store) => [store.id, store.name] as [string, string])]} />
          <Select label="Status" value={filters.status} onChange={(status) => setFilters((current) => ({ ...current, status }))} options={[["", "All statuses"], ...["sent", "failed", "queued", "retrying", "invalid_mobile", "parsing_failed", "duplicate"].map((status) => [status, status] as [string, string])]} />
          <Input label="From" type="date" value={filters.from} onChange={(from) => setFilters((current) => ({ ...current, from }))} />
          <Input label="To" type="date" value={filters.to} onChange={(to) => setFilters((current) => ({ ...current, to }))} />
          <Input label="Mobile" value={filters.mobile} onChange={(mobile) => setFilters((current) => ({ ...current, mobile }))} placeholder="Exact mobile" />
          <Input label="Bill no." value={filters.bill} onChange={(bill) => setFilters((current) => ({ ...current, bill }))} placeholder="Bill number" />
        </div>
      </Panel>

      <div className="mt-5">
        <Panel title="Recent bills">
          {state.status === "loading" ? <LoadingState title="Loading bills" detail="Reading bill records from the backend." /> : null}
          {state.status === "auth" || state.status === "error" ? <ErrorState title="Bills unavailable" detail={state.message ?? "Live bill data is not available."} /> : null}
          {state.status === "empty" ? <EmptyState detail={state.message} /> : null}
          {rows.length ? (
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
                        <Button variant="secondary" type="button" title={safeMessage(bill.error_message)}>Details</Button>
                        {retryable.has(bill.status) ? (
                          <Button type="button" disabled={resendingId === bill.id} onClick={() => resend(bill)}>
                            {resendingId === bill.id ? "Queueing" : "Resend"}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
            </DataTable>
          ) : null}
        </Panel>
      </div>
    </AppShell>
  );
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
