import { agentTokenPatch, cleanPayload, listResource, newAgentToken } from "../../../lib/server/crud";
import { resolveBusinessContext } from "../../../lib/server/dashboard-auth";
import { jsonError, jsonOk, readJson } from "../../../lib/server/http";
import { insertRow } from "../../../lib/server/supabase-rest";

export const runtime = "nodejs";
const safeSelect = "id,business_id,store_id,name,device_code,status,last_seen_at,app_version,machine_name,config,created_at,updated_at";
const config = { table: "agent_devices", listSelect: safeSelect, fields: ["store_id", "name", "device_code", "status", "machine_name", "app_version", "config"], required: ["store_id", "name"] };

export async function GET(request: Request) { return listResource(request, config); }

export async function POST(request: Request) {
  const body = await readJson<Record<string, unknown> & { business_id?: string }>(request);
  const ctx = await resolveBusinessContext(request, ["owner", "admin"], body.business_id);
  if (!ctx) return jsonError("Owner/admin business access is required.", 401, "UNAUTHORIZED_DASHBOARD");
  if (!body.store_id) return jsonError("store_id is required.");
  if (!body.name) return jsonError("name is required.");
  const token = newAgentToken();
  const row = await insertRow("agent_devices", { business_id: ctx.businessId, ...cleanPayload(body, config.fields), status: body.status ?? "active", ...agentTokenPatch(token) });
  const safeRow = row as Record<string, unknown>;
  delete safeRow.agent_token_hash;
  return jsonOk({ data: safeRow, one_time_token: token, token_notice: "Copy now. This token is shown only once and only its hash is stored." }, 201);
}