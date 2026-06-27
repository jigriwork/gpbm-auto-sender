import { createHash } from "node:crypto";
import { loadLocalEnv, requireEnv } from "./lib/local-env";

loadLocalEnv();

type JsonValue = Record<string, unknown>;

const appUrl = (process.env.APP_URL ?? process.env.API_BASE_URL ?? process.env.AGENT_API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const token = process.env.AGENT_TOKEN;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function postJson(path: string, payload: JsonValue): Promise<{ status: number; body: JsonValue }> {
  const response = await fetch(`${appUrl}${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = (await response.json().catch(() => ({}))) as JsonValue;
  return { status: response.status, body };
}

async function main() {
  requireEnv(["AGENT_TOKEN"]);
  console.log(`Agent API smoke test started against ${appUrl}`);

  const heartbeat = await postJson("/api/agent/heartbeat", {
    app_version: process.env.APP_VERSION ?? process.env.AGENT_APP_VERSION ?? "0.1.0",
    machine_name: "smoke-test-agent"
  });
  if (heartbeat.status >= 300) throw new Error(`Heartbeat failed with ${heartbeat.status}`);
  console.log("OK heartbeat");

  const storeCode = process.env.STORE_CODE ?? "GP";
  const billNumber = `TEST-${storeCode}-${today().replace(/-/g, "")}`;
  const pdfHash = createHash("sha256").update(`smoke:${storeCode}:${today()}`).digest("hex");
  const intake = await postJson("/api/agent/bills/intake", {
    customer_name: "Test Customer",
    customer_mobile: "9876543210",
    bill_number: billNumber,
    bill_date: today(),
    bill_amount: 999,
    currency: "INR",
    provider_key: process.env.MSG91_TEST_MODE === "false" ? "msg91" : "test_disabled",
    pdf_hash: pdfHash,
    source_file_name: `${billNumber}.pdf`,
    source_file_path: "smoke-test/generated.pdf",
    extraction_confidence: 0.99
  });
  if (intake.status >= 300) throw new Error(`Intake failed with ${intake.status}`);
  console.log(`OK intake (${String(intake.body.status ?? "unknown")})`);

  if (intake.body.next_action === "upload_pdf" && typeof intake.body.bill_document_id === "string") {
    const dummyPdf = new Blob(["%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n"], { type: "application/pdf" });
    const form = new FormData();
    form.set("bill_document_id", intake.body.bill_document_id);
    form.set("file", dummyPdf, `${billNumber}.pdf`);
    const upload = await fetch(`${appUrl}/api/agent/bills/upload`, { method: "POST", headers: { authorization: `Bearer ${token}` }, body: form });
    if (!upload.ok) throw new Error(`Upload failed with ${upload.status}`);
    console.log("OK upload");
  } else {
    console.log("SKIP upload: duplicate or non-upload intake result.");
  }

  const dashboardToken = process.env.DASHBOARD_AUTH_TOKEN;
  const businessId = process.env.DASHBOARD_BUSINESS_ID;
  if (dashboardToken && businessId) {
    for (const path of [`/api/dashboard/summary?business_id=${encodeURIComponent(businessId)}`, `/api/bills?business_id=${encodeURIComponent(businessId)}&limit=5`]) {
      const response = await fetch(`${appUrl}${path}`, { headers: { authorization: `Bearer ${dashboardToken}` } });
      if (!response.ok) throw new Error(`Dashboard smoke request failed ${path}: ${response.status}`);
      console.log(`OK ${path}`);
    }
  } else {
    console.log("SKIP dashboard summary/bills: DASHBOARD_AUTH_TOKEN and DASHBOARD_BUSINESS_ID are not configured.");
  }

  console.log("Agent API smoke test completed.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Agent API smoke test failed.");
  process.exit(1);
});
