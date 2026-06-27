import { authenticateAgent } from "../../../../lib/server/agent-auth";
import { jsonError, jsonOk, readJson } from "../../../../lib/server/http";
import { updateRows } from "../../../../lib/server/supabase-rest";

export const runtime = "nodejs";

type HeartbeatBody = {
  business_id?: string;
  store_id?: string;
  app_version?: string;
  machine_name?: string;
};

export async function POST(request: Request) {
  const agent = await authenticateAgent(request);
  if (!agent) return jsonError("Invalid or inactive agent token.", 401, "UNAUTHORIZED_AGENT");

  const body = await readJson<HeartbeatBody>(request).catch((): HeartbeatBody => ({}));
  if (body.business_id && body.business_id !== agent.business_id) return jsonError("Agent business mismatch.", 403, "AGENT_BUSINESS_MISMATCH");
  if (body.store_id && body.store_id !== agent.store_id) return jsonError("Agent store mismatch.", 403, "AGENT_STORE_MISMATCH");

  await updateRows("agent_devices", { id: agent.id, business_id: agent.business_id, store_id: agent.store_id }, {
    last_seen_at: new Date().toISOString(),
    app_version: body.app_version ?? null,
    machine_name: body.machine_name ?? null,
    status: "active"
  });

  return jsonOk({ ok: true, agent_id: agent.id });
}