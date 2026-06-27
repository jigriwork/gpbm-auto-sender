import { authenticateDashboardUser, getAllBusinessesForPlatformAdmin, getBusinessRole, getPlatformRole, getUserBusinesses } from "../../../lib/server/dashboard-auth";
import { jsonError, jsonOk } from "../../../lib/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await authenticateDashboardUser(request);
  if (!user) return jsonError("Authentication is required.", 401, "UNAUTHORIZED_DASHBOARD");
  const platformRole = await getPlatformRole(user.id);
  const memberships = await getUserBusinesses(user.id);
  const allBusinesses = platformRole === "super_admin" ? await getAllBusinessesForPlatformAdmin() : [];
  const businesses = memberships.map((item) => ({ ...item.businesses, role: item.role, business_id: item.business_id }));
  const selected = new URL(request.url).searchParams.get("business_id") ?? businesses[0]?.id ?? allBusinesses[0]?.id ?? null;
  const selectedRole = selected ? await getBusinessRole(user.id, selected) : null;
  return jsonOk({
    user: { id: user.id, email: user.email ?? null },
    platform_role: platformRole,
    businesses,
    platform_businesses: allBusinesses,
    selected_business: selected,
    selected_business_role: selectedRole
  });
}