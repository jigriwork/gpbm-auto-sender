import { getAnonKey, getSupabaseUrl } from "./env";
import { readBearerToken } from "./agent-auth";
import { selectRows } from "./supabase-rest";

type AuthUserResponse = { id: string; email?: string };
type BusinessUserRole = { role: "owner" | "admin" | "staff" | "viewer" };

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
  const rows = await selectRows<BusinessUserRole>("business_users", { business_id: businessId, user_id: user.id }, { select: "role" });
  const membership = rows[0];
  if (!membership || !allowedRoles.includes(membership.role)) return null;
  return user;
}