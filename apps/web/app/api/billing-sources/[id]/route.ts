import { patchResource } from "../../../../lib/server/crud";

export const runtime = "nodejs";
const config = { table: "billing_sources", fields: ["name", "source_type", "software_name", "config", "status", "store_id"], required: ["name", "source_type"] };

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return patchResource(request, id, config);
}