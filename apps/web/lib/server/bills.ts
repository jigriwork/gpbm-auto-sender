import { insertRow, selectRows, updateRows } from "./supabase-rest";

export type BillDocumentRow = {
  id: string;
  business_id: string;
  store_id: string;
  agent_device_id: string | null;
  billing_source_id: string | null;
  parser_profile_id: string | null;
  customer_name: string | null;
  customer_mobile: string | null;
  bill_number: string | null;
  bill_date: string | null;
  bill_amount: number | null;
  currency: string;
  pdf_storage_path: string | null;
  pdf_hash: string | null;
  status: string;
  provider_key: string | null;
  provider_message_id: string | null;
  error_message: string | null;
  retry_count: number;
  sent_at: string | null;
  created_at: string;
};

export function normalizeMobile(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return null;
}

export async function logBillEvent(input: {
  business_id: string;
  bill_document_id: string;
  event_type: string;
  status_from?: string | null;
  status_to?: string | null;
  message?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await insertRow("bill_events", {
    business_id: input.business_id,
    bill_document_id: input.bill_document_id,
    event_type: input.event_type,
    status_from: input.status_from ?? null,
    status_to: input.status_to ?? null,
    message: input.message ?? null,
    metadata: input.metadata ?? {}
  });
}

export async function findDuplicateBill(input: {
  business_id: string;
  store_id: string;
  bill_number?: string | null;
  bill_date?: string | null;
  customer_mobile?: string | null;
  pdf_hash?: string | null;
}): Promise<BillDocumentRow | null> {
  if (input.bill_number && input.bill_date && input.customer_mobile) {
    const rows = await selectRows<BillDocumentRow>("bill_documents", {
      business_id: input.business_id,
      store_id: input.store_id,
      bill_number: input.bill_number,
      bill_date: input.bill_date,
      customer_mobile: input.customer_mobile
    });
    if (rows[0]) return rows[0];
  }
  if (input.pdf_hash) {
    const rows = await selectRows<BillDocumentRow>("bill_documents", {
      business_id: input.business_id,
      store_id: input.store_id,
      pdf_hash: input.pdf_hash
    });
    return rows[0] ?? null;
  }
  return null;
}

export async function setBillStatus(id: string, businessId: string, status: string, extra?: Record<string, unknown>): Promise<BillDocumentRow | null> {
  const rows = await updateRows<BillDocumentRow>("bill_documents", { id, business_id: businessId }, { status, ...(extra ?? {}) });
  return rows[0] ?? null;
}