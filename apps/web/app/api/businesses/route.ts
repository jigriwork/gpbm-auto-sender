import { authenticateDashboardUser, getAllBusinessesForPlatformAdmin, getPlatformRole, getUserBusinesses } from "../../../lib/server/dashboard-auth";
import { jsonError, jsonOk } from "../../../lib/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await authenticateDashboardUser(request);
  if (!user) return jsonError("Authentication is required.", 401, "UNAUTHORIZED_DASHBOARD");
  const platformRole = await getPlatformRole(user.id);
  const memberships = await getUserBusinesses(user.id);
  const memberBusinesses = memberships.map((item) => ({ ...item.businesses, role: item.role, business_id: item.business_id }));
  if (platformRole === "super_admin") return jsonOk({ data: await getAllBusinessesForPlatformAdmin(), member_businesses: memberBusinesses, platform_role: platformRole });
  return jsonOk({ data: memberBusinesses, platform_role: platformRole });
}