import type { AgentConfig, BillDocument } from "@gpbm/shared";

export class AgentApiClient {
  constructor(private readonly config: AgentConfig, private readonly baseUrl = process.env.AGENT_API_BASE_URL ?? "http://localhost:3000") {}

  async heartbeat(): Promise<void> {
    void this.config;
    void this.baseUrl;
  }

  async uploadBill(input: { file_path: string; pdf_hash: string; bill: Partial<BillDocument> }): Promise<void> {
    void input;
  }

  async recordEvent(status: BillDocument["status"], message?: string): Promise<void> {
    void status;
    void message;
  }
}
