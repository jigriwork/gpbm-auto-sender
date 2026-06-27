import { authenticateAgent } from "../../../../../lib/server/agent-auth";
import { findDuplicateBill, logBillEvent, normalizeMobile, type BillDocumentRow } from "../../../../../lib/server/bills";
import { jsonError, jsonOk, readJson } from "../../../../../lib/server/http";
import { insertRow } from "../../../../../lib/server/supabase-rest";

export const runtime = "nodejs";

type IntakeBody = {
  business_id?: string;
  store_id?: string;
  billing_source_id?: string;
  parser_profile_id?: string;
  customer_name?: string;
  customer_mobile?: string;
  bill_number?: string;
  bill_date?: string;
  bill_amount?: number;
  currency?: string;
  pdf_hash?: string;
  source_file_name?: string;
  source_file_path?: string;
  extraction_confidence?: number;
  status?: string;
};

export async function POST(request: Request) {
  const agent = await authenticateAgent(request);
  if (!agent) return jsonError("Invalid or inactive agent token.", 401, "UNAUTHORIZED_AGENT");

  const body = await readJson<IntakeBody>(request);
  if (body.business_id && body.business_id !== agent.business_id) return jsonError("Agent business mismatch.", 403, "AGENT_BUSINESS_MISMATCH");
  if (body.store_id && body.store_id !== agent.store_id) return jsonError("Agent store mismatch.", 403, "AGENT_STORE_MISMATCH");

  const customerMobile = normalizeMobile(body.customer_mobile);
  const status = customerMobile ? (body.status === "parsing_failed" ? "parsing_failed" : "queued") : "invalid_mobile";

  const duplicate = await findDuplicateBill({
    business_id: agent.business_id,
    store_id: agent.store_id,
    bill_number: body.bill_number ?? null,
    bill_date: body.bill_date ?? null,
    customer_mobile: customerMobile,
    pdf_hash: body.pdf_hash ?? null
  });

  if (duplicate) {
    await logBillEvent({
      business_id: agent.business_id,
      bill_document_id: duplicate.id,
      event_type: "duplicate_detected",
      status_from: duplicate.status,
      status_to: "duplicate",
      message: "Agent submitted a duplicate bill.",
      metadata: { pdf_hash: body.pdf_hash, source_file_name: body.source_file_name }
    });
    return jsonOk({ ok: true, status: "duplicate", bill_document_id: duplicate.id, next_action: "skip" });
  }

  const bill = await insertRow<BillDocumentRow>("bill_documents", {
    business_id: agent.business_id,
    store_id: agent.store_id,
    agent_device_id: agent.id,
    billing_source_id: body.billing_source_id ?? null,
    parser_profile_id: body.parser_profile_id ?? null,
    customer_name: body.customer_name ?? null,
    customer_mobile: customerMobile,
    bill_number: body.bill_number ?? null,
    bill_date: body.bill_date ?? null,
    bill_amount: body.bill_amount ?? null,
    currency: body.currency ?? "INR",
    pdf_hash: body.pdf_hash ?? null,
    source_file_name: body.source_file_name ?? null,
    source_file_path: body.source_file_path ?? null,
    extraction_confidence: body.extraction_confidence ?? null,
    status
  });

  await logBillEvent({
    business_id: bill.business_id,
    bill_document_id: bill.id,
    event_type: "intake_created",
    status_to: status,
    message: status === "invalid_mobile" ? "Bill received but customer mobile is invalid." : "Bill metadata received from agent.",
    metadata: { agent_device_id: agent.id }
  });

  return jsonOk({ ok: true, status, bill_document_id: bill.id, next_action: status === "queued" ? "upload_pdf" : "review" }, 201);
}