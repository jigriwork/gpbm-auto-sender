import chokidar from "chokidar";
import { GenericPdfBillParser } from "@gpbm/parsers";
import type { AgentConfig, ParserProfile } from "@gpbm/shared";
import { AgentApiClient } from "./api-client.js";
import { billDuplicateKey, hashFile } from "./fingerprint.js";
import { extractPdfText } from "./pdf-text.js";
import { LocalQueue } from "./queue.js";

const demoParserProfile: ParserProfile = {
  id: "local_demo_parser",
  business_id: "local",
  name: "generic_pdf_v1",
  source_type: "generic_pdf_folder",
  required_fields: ["customer_mobile", "bill_number", "bill_date"],
  confidence_threshold: 0.75,
  status: "active"
};

export function startFolderWatcher(config: AgentConfig): void {
  const queue = new LocalQueue();
  const api = new AgentApiClient(config);
  const parser = new GenericPdfBillParser();

  setInterval(() => {
    void api.heartbeat();
  }, 30_000);

  chokidar.watch(config.incoming_folder, { ignoreInitial: false, awaitWriteFinish: true }).on("add", async (filePath) => {
    if (!filePath.toLowerCase().endsWith(".pdf")) return;

    const pdfHash = await hashFile(filePath);
    const pdfText = await extractPdfText(filePath);
    const parsed = await parser.parse({
      business_id: config.business_id,
      store_id: config.store_id,
      parser_profile: { ...demoParserProfile, id: config.parser_profile_id, business_id: config.business_id },
      pdf_path: filePath,
      pdf_text: pdfText
    });
    const duplicateKey = billDuplicateKey({
      store_id: config.store_id,
      bill_number: parsed.fields.bill_number,
      bill_date: parsed.fields.bill_date,
      customer_mobile: parsed.fields.customer_mobile,
      pdf_hash: pdfHash
    });

    if (queue.findByDuplicateKey(duplicateKey)) {
      queue.upsert({ id: pdfHash, file_path: filePath, duplicate_key: duplicateKey, status: "duplicate", attempts: 0 });
      return;
    }

    queue.upsert({ id: pdfHash, file_path: filePath, duplicate_key: duplicateKey, status: parsed.ok ? "queued" : "parsing_failed", attempts: 0, last_error: parsed.error_message });
    await api.uploadBill({
      file_path: filePath,
      pdf_hash: pdfHash,
      bill: {
        business_id: config.business_id,
        store_id: config.store_id,
        customer_name: parsed.fields.customer_name,
        customer_mobile: parsed.fields.customer_mobile,
        bill_number: parsed.fields.bill_number,
        bill_date: parsed.fields.bill_date,
        bill_amount: parsed.fields.bill_amount,
        status: parsed.ok ? "queued" : "parsing_failed",
        pdf_path: filePath
      }
    });
  });
}
