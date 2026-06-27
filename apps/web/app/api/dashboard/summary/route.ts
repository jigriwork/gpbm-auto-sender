import { jsonError, jsonOk } from "../../../../lib/server/http";
import { resolveBusinessContext } from "../../../../lib/server/dashboard-auth";
import { selectRows } from "../../../../lib/server/supabase-rest";

export const runtime = "nodejs";

type BillSummaryRow = { business_id: string; store_id: string; status: string; created_at: string };
type AgentSummaryRow = { id: string; store_id: string; last_seen_at: string | null; status: string };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const businessId = url.searchParams.get("business_id");
  const storeId = url.searchParams.get("store_id") ?? undefined;
  const ctx = await resolveBusinessContext(request, ["owner", "admin", "staff", "viewer"], businessId);
  if (!ctx) return jsonError("Authenticated business membership is required.", 401, "UNAUTHORIZED_DASHBOARD");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bills = await selectRows<BillSummaryRow>("bill_documents", { business_id: ctx.businessId, store_id: storeId });
  const agents = await selectRows<AgentSummaryRow>("agent_devices", { business_id: ctx.businessId, store_id: storeId });
  const todayBills = bills.filter((bill) => new Date(bill.created_at) >= today);
  const count = (status: string, source = todayBills) => source.filter((bill) => bill.status === status).length;
  const onlineCutoff = Date.now() - 2 * 60 * 1000;
  const agentsOnline = agents.filter((agent) => agent.status === "active" && agent.last_seen_at && new Date(agent.last_seen_at).getTime() >= onlineCutoff).length;

  const storeWiseCounts = bills.reduce<Record<string, Record<string, number>>>((acc, bill) => {
    acc[bill.store_id] ??= {};
    acc[bill.store_id][bill.status] = (acc[bill.store_id][bill.status] ?? 0) + 1;
    return acc;
  }, {});

  return jsonOk({
    sent_today: count("sent"),
    failed_today: count("failed"),
    duplicates: count("duplicate", bills),
    invalid_mobile: count("invalid_mobile", bills),
    retry_queue: bills.filter((bill) => ["failed", "retrying", "queued"].includes(bill.status)).length,
    agents_online: agentsOnline,
    agents_offline: agents.length - agentsOnline,
    store_wise_counts: storeWiseCounts
  });
}