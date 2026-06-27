"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BillStatus } from "@gpbm/shared";
import { demoBills, demoStores } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";
import { authHeaders, formatDateTime, formatMoney, getBusinessId, readApi, redactMobile, redactName, safeMessage, storeName, type ApiState } from "../../lib/client-data";

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

  const query = useMemo(() => {
    const params = new URLSearchParams({ business_id: getBusinessId(), limit: "100" });
    if (filters.store) params.set("store_id", filters.store);
    if (filters.status) params.set("status", filters.status);
    if (filters.from) params.set("date_from", filters.from);
    if (filters.to) params.set("date_to", filters.to);
    if (filters.mobile) params.set("mobile", filters.mobile);
    if (filters.bill) params.set("bill_number", filters.bill);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    let active = true;
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
  }, [query]);

  async function resend(bill: BillRow) {
    setResendingId(bill.id);
    const result = await fetch(`/api/bills/${bill.id}/resend`, {
      method: "POST",
      headers: { "content-type": "application/json", ...authHeaders() },
      body: JSON.stringify({ business_id: getBusinessId() })
    }).then(async (response) => ({ ok: response.ok, status: response.status })).catch(() => ({ ok: false, status: 0 }));
    setResendingId("");
    if (!result.ok) {
      setState((current) => ({ ...current, message: result.status === 401 ? "Sign-in/session wiring is required before resend can run." : "Resend could not be queued safely." }));
      return;
    }
    setFilters((current) => ({ ...current }));
  }

  const rows = state.data ?? [];

  return (
    <AppShell title="Bills" eyebrow="Live bill log">
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
          {state.status === "loading" ? <p className="py-4 text-sm text-neutral-600">Loading bills from backend.</p> : null}
          {state.status === "auth" || state.status === "error" ? <p className="py-4 text-sm text-neutral-600">{state.message}</p> : null}
          {state.status === "empty" ? <p className="py-4 text-sm text-neutral-600">{state.message}</p> : null}
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                  {["Date/time", "Store", "Customer", "Mobile", "Bill", "Amount", "Status", "Provider", "Retry", "Sent at", "Actions"].map((header) => <th key={header} className="py-3 pr-4 font-semibold">{header}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((bill) => (
                  <tr key={bill.id} className="border-b border-neutral-200 last:border-b-0">
                    <td className="py-3 pr-4">{formatDateTime(bill.created_at ?? bill.bill_date)}</td>
                    <td className="py-3 pr-4">{storeName(bill.store_id)}</td>
                    <td className="py-3 pr-4">{redactName(bill.customer_name)}</td>
                    <td className="py-3 pr-4">{redactMobile(bill.customer_mobile)}</td>
                    <td className="py-3 pr-4 font-medium">{bill.bill_number ?? "Pending"}</td>
                    <td className="py-3 pr-4">{formatMoney(bill.bill_amount, bill.currency ?? "INR")}</td>
                    <td className="py-3 pr-4"><StatusPill>{bill.status}</StatusPill></td>
                    <td className="py-3 pr-4">{bill.provider_key ?? "Default"}</td>
                    <td className="py-3 pr-4">{bill.retry_count ?? 0}</td>
                    <td className="py-3 pr-4">{formatDateTime(bill.sent_at)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-2">
                        <button className="rounded border border-neutral-300 px-3 py-2 text-xs font-semibold" type="button" title={safeMessage(bill.error_message)}>Details</button>
                        {retryable.has(bill.status) ? (
                          <button className="rounded bg-black px-3 py-2 text-xs font-semibold text-white disabled:opacity-50" type="button" disabled={resendingId === bill.id} onClick={() => resend(bill)}>
                            {resendingId === bill.id ? "Queueing" : "Resend"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      <span>{label}</span>
      <input className="h-10 rounded border border-neutral-300 bg-white px-3 text-sm" type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      <span>{label}</span>
      <select className="h-10 rounded border border-neutral-300 bg-white px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}
      </select>
    </label>
  );
}
