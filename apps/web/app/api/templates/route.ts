import { createResource, listResource } from "../../../lib/server/crud";

export const runtime = "nodejs";
const config = { table: "whatsapp_templates", fields: ["provider_key", "template_name", "template_id", "language", "category", "variable_mapping", "status", "store_id"], required: ["provider_key", "template_name"] };

export async function GET(request: Request) { return listResource(request, config); }
export async function POST(request: Request) { return createResource(request, config); }