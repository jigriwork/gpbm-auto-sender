import { patchResource } from "../../../../lib/server/crud";

export const runtime = "nodejs";
const config = { table: "parser_profiles", fields: ["name", "parser_key", "config", "status", "store_id", "billing_source_id"], required: ["name", "parser_key"] };

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return patchResource(request, id, config);
}