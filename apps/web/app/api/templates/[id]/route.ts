import { patchResource } from "../../../../lib/server/crud";

export const runtime = "nodejs";
const config = { table: "whatsapp_templates", fields: ["provider_key", "template_name", "template_id", "language", "category", "variable_mapping", "status", "store_id"], required: ["provider_key", "template_name"] };

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return patchResource(request, id, config);
}