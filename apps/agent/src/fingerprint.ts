import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

export async function hashFile(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  return createHash("sha256").update(buffer).digest("hex");
}

export function billDuplicateKey(input: {
  store_id: string;
  bill_number?: string;
  bill_date?: string;
  customer_mobile?: string;
  pdf_hash: string;
}): string {
  return [input.store_id, input.bill_number, input.bill_date, input.customer_mobile, input.pdf_hash].filter(Boolean).join(":");
}
