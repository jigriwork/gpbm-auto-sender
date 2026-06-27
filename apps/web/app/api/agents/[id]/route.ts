import { patchResource } from "../../../../lib/server/crud";

export const runtime = "nodejs";
const safeSelect = "id,business_id,store_id,name,device_code,status,last_seen_at,app_version,machine_name,config,created_at,updated_at";
const config = { table: "agent_devices", listSelect: safeSelect, fields: ["store_id", "name", "device_code", "status", "machine_name", "app_version", "config"], required: ["store_id", "name"] };

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return patchResource(request, id, config);
}