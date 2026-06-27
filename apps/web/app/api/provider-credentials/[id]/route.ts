import { requireBusinessRole } from "../../../../lib/server/dashboard-auth";
import { jsonError, jsonOk, readJson } from "../../../../lib/server/http";
import { encryptCredentialPayload, redactProviderCredential, type ProviderCredentialRow } from "../../../../lib/server/provider-credentials";
import { selectOne, updateRows } from "../../../../lib/server/supabase-rest";

export const runtime = "nodejs";

type PatchBody = {
  business_id?: string;
  display_name?: string;
  is_default?: boolean;
  status?: string;
  credentials?: Record<string, unknown>;
};

function validCredentials(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await readJson<PatchBody>(request);
  if (!body.business_id) return jsonError("business_id is required.");

  const user = await requireBusinessRole(request, body.business_id, ["owner", "admin"]);
  if (!user) return jsonError("Owner/admin business membership is required.", 401, "UNAUTHORIZED_DASHBOARD");

  const existing = await selectOne<ProviderCredentialRow>("provider_credentials", { id, business_id: body.business_id });
  if (!existing) return jsonError("Provider credential not found.", 404, "PROVIDER_CREDENTIAL_NOT_FOUND");

  if (body.is_default) {
    await updateRows("provider_credentials", { business_id: body.business_id, is_default: true }, { is_default: false });
  }

  const patch: Record<string, unknown> = {};
  if (body.display_name !== undefined) patch.display_name = body.display_name;
  if (body.status !== undefined) patch.status = body.status;
  if (body.is_default !== undefined) patch.is_default = body.is_default;
  if (body.credentials !== undefined) {
    if (!validCredentials(body.credentials)) return jsonError("credentials must be an object when provided.");
    patch.encrypted_credentials = encryptCredentialPayload(body.credentials);
  }

  const updated = (await updateRows<ProviderCredentialRow>("provider_credentials", { id, business_id: body.business_id }, patch))[0];
  return jsonOk({ data: redactProviderCredential(updated) });
}
