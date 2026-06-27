import { createResource, listResource } from "../../../lib/server/crud";

export const runtime = "nodejs";
const config = { table: "parser_profiles", fields: ["name", "parser_key", "config", "status", "store_id", "billing_source_id"], required: ["name", "parser_key"] };

export async function GET(request: Request) { return listResource(request, config); }
export async function POST(request: Request) { return createResource(request, config); }