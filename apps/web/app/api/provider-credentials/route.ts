import { resolveBusinessContext } from "../../../lib/server/dashboard-auth";
import { jsonError, jsonOk, readJson } from "../../../lib/server/http";
import { encryptCredentialPayload, redactProviderCredential, type ProviderCredentialRow } from "../../../lib/server/provider-credentials";
import { insertRow, selectRows, updateRows } from "../../../lib/server/supabase-rest";

export const runtime = "nodejs";

type CredentialBody = {
  business_id?: string;
  provider_key?: string;
  display_name?: string;
  is_default?: boolean;
  status?: string;
  credentials?: Record<string, unknown>;
};

function validCredentials(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const businessId = url.searchParams.get("business_id");
  const ctx = await resolveBusinessContext(request, ["owner", "admin"], businessId);
  if (!ctx) return jsonError("Owner/admin business membership is required.", 401, "UNAUTHORIZED_DASHBOARD");

  const rows = await selectRows<ProviderCredentialRow>("provider_credentials", { business_id: ctx.businessId }, { order: "created_at.desc" });
  return jsonOk({ data: rows.map(redactProviderCredential) });
}

export async function POST(request: Request) {
  const body = await readJson<CredentialBody>(request);
  if (!body.provider_key) return jsonError("provider_key is required.");
  if (!validCredentials(body.credentials)) return jsonError("credentials object is required.");

  const ctx = await resolveBusinessContext(request, ["owner", "admin"], body.business_id);
  if (!ctx) return jsonError("Owner/admin business membership is required.", 401, "UNAUTHORIZED_DASHBOARD");

  if (body.is_default) {
    await updateRows("provider_credentials", { business_id: ctx.businessId, is_default: true }, { is_default: false });
  }

  const row = await insertRow<ProviderCredentialRow>("provider_credentials", {
    business_id: ctx.businessId,
    provider_key: body.provider_key,
    display_name: body.display_name ?? body.provider_key,
    encrypted_credentials: encryptCredentialPayload(body.credentials),
    is_default: body.is_default ?? false,
    status: body.status ?? "active"
  });

  return jsonOk({ data: redactProviderCredential(row) }, 201);
}
