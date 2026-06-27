import { patchResource } from "../../../../lib/server/crud";

export const runtime = "nodejs";
const config = { table: "stores", fields: ["name", "code", "status"], required: ["name"] };

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return patchResource(request, id, config);
}