import { agentTokenPatch, newAgentToken } from "../../../../../lib/server/crud";
import { resolveBusinessContext } from "../../../../../lib/server/dashboard-auth";
import { jsonError, jsonOk, readJson } from "../../../../../lib/server/http";
import { selectOne, updateRows } from "../../../../../lib/server/supabase-rest";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body: { business_id?: string } = await readJson<{ business_id?: string }>(request).catch(() => ({}));
  const ctx = await resolveBusinessContext(request, ["owner", "admin"], body.business_id);
  if (!ctx) return jsonError("Owner/admin business access is required.", 401, "UNAUTHORIZED_DASHBOARD");
  const existing = await selectOne("agent_devices", { id, business_id: ctx.businessId }, "id,business_id");
  if (!existing) return jsonError("Agent not found.", 404, "AGENT_NOT_FOUND");
  const token = newAgentToken();
  const updated = (await updateRows("agent_devices", { id, business_id: ctx.businessId }, agentTokenPatch(token)))[0] as Record<string, unknown>;
  const safeRow = updated;
  delete safeRow.agent_token_hash;
  return jsonOk({ data: safeRow, one_time_token: token, token_notice: "Copy now. This rotated token is shown only once and the old token is invalid." });
}