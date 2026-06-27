import { getAnonKey, getSupabaseUrl } from "./env";
import { readBearerToken } from "./agent-auth";
import { selectRows } from "./supabase-rest";

type AuthUserResponse = { id: string; email?: string };
export type BusinessRole = "owner" | "admin" | "staff" | "viewer";
export type PlatformRole = "super_admin" | "support_admin";
type BusinessUserRole = { role: BusinessRole };
export type DashboardContext = {
  user: AuthUserResponse;
  businessId: string;
  businessRole: BusinessRole | null;
  platformRole: PlatformRole | null;
  isSuperAdmin: boolean;
};

export async function authenticateDashboardUser(request: Request): Promise<AuthUserResponse | null> {
  const token = readBearerToken(request);
  if (!token) return null;
  const response = await fetch(`${getSupabaseUrl()}/auth/v1/user`, {
    headers: {
      apikey: getAnonKey(),
      authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });
  if (!response.ok) return null;
  return (await response.json()) as AuthUserResponse;
}

export async function requireBusinessRole(request: Request, businessId: string, allowedRoles: BusinessUserRole["role"][]): Promise<AuthUserResponse | null> {
  const user = await authenticateDashboardUser(request);
  if (!user) return null;
  const [membership, platformRole] = await Promise.all([getBusinessRole(user.id, businessId), getPlatformRole(user.id)]);
  if (platformRole === "super_admin") return user;
  if (!membership || !allowedRoles.includes(membership)) return null;
  return user;
}

export async function getBusinessRole(userId: string, businessId: string): Promise<BusinessRole | null> {
  const rows = await selectRows<BusinessUserRole>("business_users", { business_id: businessId, user_id: userId }, { select: "role", limit: 1 });
  return rows[0]?.role ?? null;
}

export async function getPlatformRole(userId: string): Promise<PlatformRole | null> {
  const rows = await selectRows<{ role: PlatformRole; status: string }>("platform_admins", { user_id: userId, status: "active" }, { select: "role,status", limit: 1 });
  return rows[0]?.role ?? null;
}

export async function getUserBusinesses(userId: string): Promise<Array<{ business_id: string; role: BusinessRole; businesses: { id: string; name: string; slug: string | null; status: string } }>> {
  return selectRows("business_users", { user_id: userId }, { select: "business_id,role,businesses(id,name,slug,status)", order: "created_at.asc" });
}

export async function getAllBusinessesForPlatformAdmin(): Promise<Array<{ id: string; name: string; slug: string | null; status: string }>> {
  return selectRows("businesses", undefined, { select: "id,name,slug,status", order: "created_at.asc" });
}

export async function resolveBusinessContext(request: Request, allowedRoles: BusinessRole[], inputBusinessId?: string | null): Promise<DashboardContext | null> {
  const user = await authenticateDashboardUser(request);
  if (!user) return null;
  const platformRole = await getPlatformRole(user.id);
  let businessId = inputBusinessId ?? null;

  if (!businessId) {
    const memberships = await getUserBusinesses(user.id);
    businessId = memberships[0]?.business_id ?? null;
    if (!businessId && platformRole === "super_admin") {
      const businesses = await getAllBusinessesForPlatformAdmin();
      businessId = businesses[0]?.id ?? null;
    }
  }
  if (!businessId) return null;

  const businessRole = await getBusinessRole(user.id, businessId);
  if (platformRole === "super_admin") return { user, businessId, businessRole, platformRole, isSuperAdmin: true };
  if (!businessRole || !allowedRoles.includes(businessRole)) return null;
  return { user, businessId, businessRole, platformRole, isSuperAdmin: false };
}