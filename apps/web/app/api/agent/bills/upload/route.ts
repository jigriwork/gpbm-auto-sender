import { authenticateAgent } from "../../../../../lib/server/agent-auth";
import { logBillEvent } from "../../../../../lib/server/bills";
import { jsonError, jsonOk } from "../../../../../lib/server/http";
import { selectOne, updateRows, uploadPrivateObject } from "../../../../../lib/server/supabase-rest";

export const runtime = "nodejs";

type UploadBillRow = {
  id: string;
  business_id: string;
  store_id: string;
  status: string;
  source_file_name: string | null;
};

export async function POST(request: Request) {
  const agent = await authenticateAgent(request);
  if (!agent) return jsonError("Invalid or inactive agent token.", 401, "UNAUTHORIZED_AGENT");

  const formData = await request.formData();
  const billId = formData.get("bill_document_id");
  const file = formData.get("file");
  if (typeof billId !== "string") return jsonError("bill_document_id is required.");
  if (!(file instanceof Blob)) return jsonError("A PDF file field named file is required.");

  const bill = await selectOne<UploadBillRow>("bill_documents", { id: billId, business_id: agent.business_id, store_id: agent.store_id });
  if (!bill) return jsonError("Bill not found for this agent.", 404, "BILL_NOT_FOUND");

  const safeFileName = (bill.source_file_name ?? `${bill.id}.pdf`).replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${agent.business_id}/${agent.store_id}/${bill.id}/${safeFileName}`;
  await uploadPrivateObject(storagePath, file);

  await updateRows("bill_documents", { id: bill.id, business_id: agent.business_id }, {
    pdf_storage_path: storagePath,
    status: bill.status === "queued" ? "uploading" : bill.status
  });

  await logBillEvent({
    business_id: agent.business_id,
    bill_document_id: bill.id,
    event_type: "pdf_uploaded",
    status_from: bill.status,
    status_to: bill.status === "queued" ? "uploading" : bill.status,
    message: "Private bill PDF uploaded to Supabase Storage.",
    metadata: { storage_path: storagePath }
  });

  return jsonOk({ ok: true, bill_document_id: bill.id, pdf_storage_path: storagePath, status: bill.status === "queued" ? "uploading" : bill.status });
}