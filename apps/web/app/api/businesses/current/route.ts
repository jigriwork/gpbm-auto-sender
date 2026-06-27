import { resolveBusinessContext } from "../../../../lib/server/dashboard-auth";
import { jsonError, jsonOk } from "../../../../lib/server/http";
import { selectOne } from "../../../../lib/server/supabase-rest";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const businessId = new URL(request.url).searchParams.get("business_id");
  const ctx = await resolveBusinessContext(request, ["owner", "admin", "staff", "viewer"], businessId);
  if (!ctx) return jsonError("Authenticated business access is required.", 401, "UNAUTHORIZED_DASHBOARD");
  const business = await selectOne("businesses", { id: ctx.businessId }, "id,name,slug,status,created_at,updated_at");
  return jsonOk({ data: business, role: ctx.businessRole, platform_role: ctx.platformRole });
}