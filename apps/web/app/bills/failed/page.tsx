"use client";

import { useEffect, useState } from "react";
import type { BillStatus } from "@gpbm/shared";
import { demoBills } from "../../../lib/demo";
import { AppShell } from "../../../components/nav";
import { Button, EmptyState, ErrorState, LoadingState, Panel, StatusPill } from "../../../components/ui";
import { useBusinessContext } from "../../../lib/business-context";
import { formatDateTime, readApi, safeMessage, storeName, writeApi, type ApiState } from "../../../lib/client-data";

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
  const business = useBusinessContext();

  useEffect(() => {
    let active = true;
    if (!business.selectedBusinessId) {
      setState({ status: business.status === "loading" ? "loading" : "auth", data: [], message: business.message || "Select a business to load failed bills." });
      return;
    }
    Promise.all(failureStatuses.map((status) => readApi<BillsResponse>(`/api/bills?business_id=${encodeURIComponent(business.selectedBusinessId)}&status=${status}&limit=100`))).then((results) => {
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
  }, [business.message, business.selectedBusinessId, business.status]);

  async function resend(bill: FailedBill) {
    if (!business.selectedBusinessId) {
      setState((current) => ({ ...current, message: "Select a business before requesting resend." }));
      return;
    }
    setResendingId(bill.id);
    const response = await writeApi(`/api/bills/${bill.id}/resend`, "POST", { business_id: business.selectedBusinessId });
    setResendingId("");
    if (!response.ok) setState((current) => ({ ...current, message: response.message || "Resend could not be queued safely." }));
  }

  return (
    <AppShell title="Failed Bills" eyebrow="Overview" subtitle="Bills that need retry, parser review, or customer data correction.">
      <Panel title="Failure queue" description="Only failed, invalid mobile, parsing failed, and retrying bill records appear here.">
        {state.status === "loading" ? <LoadingState title="Loading failed bills" detail="Reading failed and retrying bill records." /> : null}
        {state.status === "auth" || state.status === "error" ? <ErrorState title="Failure queue unavailable" detail={state.message ?? "Failed bills could not be loaded."} /> : null}
        {state.status === "empty" ? <EmptyState detail={state.message} /> : null}
        <div className="grid gap-3">
          {(state.data ?? []).map((bill) => (
            <div key={bill.id} className="private-card-compact grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto] md:items-center">
              <div>
                <p className="font-semibold">{bill.bill_number ?? "Bill pending"}</p>
                <p className="text-sm text-neutral-500">{storeName(bill.store_id)} / updated {formatDateTime(bill.updated_at ?? bill.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-700">{safeMessage(bill.error_message)}</p>
                <p className="mt-1 text-xs text-neutral-500">Retry count: {bill.retry_count ?? 0}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill>{bill.status}</StatusPill>
                {resendStatuses.has(bill.status) ? (
                  <Button type="button" disabled={resendingId === bill.id} onClick={() => resend(bill)}>
                    {resendingId === bill.id ? "Queueing" : "Resend"}
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
