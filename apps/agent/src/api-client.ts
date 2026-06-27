import type { AgentConfig, BillDocument } from "@gpbm/shared";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

export class AgentApiClient {
  constructor(private readonly config: AgentConfig, private readonly baseUrl = config.api_base_url ?? process.env.AGENT_API_BASE_URL ?? "http://localhost:3000") {}

  private authHeaders(): HeadersInit {
    return { authorization: `Bearer ${this.config.agent_token}` };
  }

  private async postJson<T>(path: string, payload: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { ...this.authHeaders(), "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Agent API ${path} failed with ${response.status}: ${await response.text()}`);
    return (await response.json()) as T;
  }

  async heartbeat(): Promise<void> {
    await this.postJson("/api/agent/heartbeat", {
      business_id: this.config.business_id,
      store_id: this.config.store_id,
      app_version: this.config.app_version,
      machine_name: this.config.machine_name
    });
  }

  async uploadBill(input: { file_path: string; pdf_hash: string; bill: Partial<BillDocument> }): Promise<void> {
    const intake = await this.postJson<{ bill_document_id: string; status: string; next_action: string }>("/api/agent/bills/intake", {
      ...input.bill,
      business_id: this.config.business_id,
      store_id: this.config.store_id,
      billing_source_id: this.config.billing_source_id,
      parser_profile_id: this.config.parser_profile_id,
      pdf_hash: input.pdf_hash,
      source_file_name: basename(input.file_path),
      source_file_path: input.file_path
    });

    if (intake.next_action !== "upload_pdf") return;
    const buffer = await readFile(input.file_path);
    const form = new FormData();
    form.set("bill_document_id", intake.bill_document_id);
    form.set("file", new Blob([buffer], { type: "application/pdf" }), basename(input.file_path));

    const response = await fetch(`${this.baseUrl}/api/agent/bills/upload`, {
      method: "POST",
      headers: this.authHeaders(),
      body: form
    });
    if (!response.ok) throw new Error(`Agent PDF upload failed with ${response.status}: ${await response.text()}`);
  }

  async recordEvent(status: BillDocument["status"], message?: string): Promise<void> {
    void status;
    void message;
  }
}
