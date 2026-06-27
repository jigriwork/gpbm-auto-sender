import { jsonError, jsonOk } from "../../../lib/server/http";
import { requireBusinessRole } from "../../../lib/server/dashboard-auth";
import { selectRows } from "../../../lib/server/supabase-rest";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const businessId = url.searchParams.get("business_id");
  if (!businessId) return jsonError("business_id is required.");
  const user = await requireBusinessRole(request, businessId, ["owner", "admin", "staff", "viewer"]);
  if (!user) return jsonError("Authenticated business membership is required.", 401, "UNAUTHORIZED_DASHBOARD");

  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const rows = await selectRows("bill_documents", {
    business_id: businessId,
    store_id: url.searchParams.get("store_id") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    customer_mobile: url.searchParams.get("mobile") ?? undefined,
    bill_number: url.searchParams.get("bill_number") ?? undefined
  }, { order: "created_at.desc", limit, offset });

  const from = url.searchParams.get("date_from");
  const to = url.searchParams.get("date_to");
  const filtered = rows.filter((row) => {
    const bill = row as { created_at?: string; bill_date?: string | null };
    const dateValue = bill.bill_date ?? bill.created_at;
    if (!dateValue) return true;
    if (from && dateValue < from) return false;
    if (to && dateValue > to) return false;
    return true;
  });

  return jsonOk({ data: filtered, pagination: { limit, offset, count: filtered.length } });
}