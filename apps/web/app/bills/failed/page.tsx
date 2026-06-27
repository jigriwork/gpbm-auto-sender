"use client";

import { useEffect, useState } from "react";
import type { BillStatus } from "@gpbm/shared";
import { demoBills } from "../../../lib/demo";
import { AppShell } from "../../../components/nav";
import { Panel, StatusPill } from "../../../components/ui";
import { authHeaders, formatDateTime, getBusinessId, readApi, safeMessage, storeName, type ApiState } from "../../../lib/client-data";

type FailedBill = {
  id: string;
  store_id: string;
  bill_number?: string | null;
  status: BillStatus;
  error_message?: string | null;
  retry_count?: number | null;
  updated_at?: string | null;
  created_at?: string | null;
};

type BillsResponse = { data: FailedBill[] };

const failureStatuses: BillStatus[] = ["failed", "invalid_mobile", "parsing_failed", "retrying"];
const resendStatuses = new Set<BillStatus>(["failed", "queued", "retrying"]);

export default function FailedBillsPage() {
  const [state, setState] = useState<ApiState<FailedBill[]>>({ status: "loading" });
  const [resendingId, setResendingId] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all(failureStatuses.map((status) => readApi<BillsResponse>(`/api/bills?business_id=${encodeURIComponent(getBusinessId())}&status=${status}&limit=100`))).then((results) => {
      if (!active) return;
      const failed = results.find((result) => !result.ok);
      if (failed && !failed.ok) {
        setState({ status: failed.status === 401 ? "auth" : "error", data: demoBills.filter((bill) => bill.status !== "sent") as FailedBill[], message: failed.message });
        return;
      }
      const rows = results.flatMap((result) => result.ok ? result.data.data : []);
      setState(rows.length ? { status: "ready", data: rows } : { status: "empty", data: [], message: "No failed or retrying bills are waiting." });
    });
    return () => {
      active = false;
    };
  }, []);

  async function resend(bill: FailedBill) {
    setResendingId(bill.id);
    const response = await fetch(`/api/bills/${bill.id}/resend`, {
      method: "POST",
      headers: { "content-type": "application/json", ...authHeaders() },
      body: JSON.stringify({ business_id: getBusinessId() })
    }).catch(() => null);
    setResendingId("");
    if (!response?.ok) setState((current) => ({ ...current, message: response?.status === 401 ? "Sign-in/session wiring is required before resend can run." : "Resend could not be queued safely." }));
  }

  return (
    <AppShell title="Failed Bills" eyebrow="Needs automated retry or review">
      <Panel title="Failure queue">
        {state.status === "loading" ? <p className="py-4 text-sm text-neutral-600">Loading failed bills.</p> : null}
        {state.status === "auth" || state.status === "error" || state.status === "empty" ? <p className="py-4 text-sm text-neutral-600">{state.message}</p> : null}
        {(state.data ?? []).map((bill) => (
          <div key={bill.id} className="grid gap-3 border-b border-neutral-200 py-4 last:border-b-0 md:grid-cols-[1fr_1fr_auto] md:items-center">
            <div>
              <p className="font-semibold">{bill.bill_number ?? "Bill pending"}</p>
              <p className="text-sm text-neutral-500">{storeName(bill.store_id)} · updated {formatDateTime(bill.updated_at ?? bill.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-700">{safeMessage(bill.error_message)}</p>
              <p className="mt-1 text-xs text-neutral-500">Retry count: {bill.retry_count ?? 0}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill>{bill.status}</StatusPill>
              {resendStatuses.has(bill.status) ? (
                <button className="rounded bg-black px-3 py-2 text-xs font-semibold text-white disabled:opacity-50" type="button" disabled={resendingId === bill.id} onClick={() => resend(bill)}>
                  {resendingId === bill.id ? "Queueing" : "Resend"}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </Panel>
    </AppShell>
  );
}
