import { logBillEvent, setBillStatus, type BillDocumentRow } from "../../../../../lib/server/bills";
import { requireBusinessRole } from "../../../../../lib/server/dashboard-auth";
import { jsonError, jsonOk, readJson } from "../../../../../lib/server/http";
import { sendBillViaConfiguredProvider } from "../../../../../lib/server/provider-registry";
import { selectOne } from "../../../../../lib/server/supabase-rest";

export const runtime = "nodejs";

type ResendBody = { business_id?: string };

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await readJson<ResendBody>(request).catch((): ResendBody => ({}));
  if (!body.business_id) return jsonError("business_id is required.");
  const user = await requireBusinessRole(request, body.business_id, ["owner", "admin"]);
  if (!user) return jsonError("Owner/admin business membership is required.", 401, "UNAUTHORIZED_DASHBOARD");

  const bill = await selectOne<BillDocumentRow>("bill_documents", { id, business_id: body.business_id });
  if (!bill) return jsonError("Bill not found.", 404, "BILL_NOT_FOUND");
  if (bill.status === "sent") return jsonError("Bill is already sent. Force resend is intentionally not enabled yet.", 409, "ALREADY_SENT");
  if (!bill.customer_mobile || !bill.bill_number || !bill.bill_date) return jsonError("Bill is missing required send fields.", 422, "BILL_INCOMPLETE");

  await setBillStatus(bill.id, bill.business_id, "retrying", { retry_count: bill.retry_count + 1, error_message: null });
  await logBillEvent({ business_id: bill.business_id, bill_document_id: bill.id, event_type: "resend_requested", status_from: bill.status, status_to: "retrying", message: "Resend requested by dashboard API." });

  const result = await sendBillViaConfiguredProvider({
    business_id: bill.business_id,
    store_id: bill.store_id,
    customer_name: bill.customer_name ?? "Customer",
    customer_mobile: bill.customer_mobile,
    bill_number: bill.bill_number,
    bill_date: bill.bill_date,
    bill_amount: bill.bill_amount ?? undefined,
    pdf_url: bill.pdf_storage_path ?? "",
    template_id: "default_bill_pdf",
    template_variables: { customer_name: bill.customer_name ?? "Customer", bill_number: bill.bill_number, bill_amount: bill.bill_amount ?? undefined }
  });

  const nextStatus = result.ok ? "sent" : "failed";
  const updated = await setBillStatus(bill.id, bill.business_id, nextStatus, {
    provider_message_id: result.provider_message_id ?? null,
    error_message: result.error_message ?? null,
    sent_at: result.ok ? new Date().toISOString() : null
  });
  await logBillEvent({ business_id: bill.business_id, bill_document_id: bill.id, event_type: "resend_completed", status_from: "retrying", status_to: nextStatus, message: result.error_message ?? "Provider send completed.", metadata: { ok: result.ok, error_code: result.error_code } });

  return jsonOk({ ok: result.ok, bill: updated, provider_message_id: result.provider_message_id, error_message: result.error_message });
}