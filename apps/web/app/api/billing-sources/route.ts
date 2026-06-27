import { createResource, listResource } from "../../../lib/server/crud";

export const runtime = "nodejs";
const config = { table: "billing_sources", fields: ["name", "source_type", "software_name", "config", "status", "store_id"], required: ["name", "source_type"] };

export async function GET(request: Request) { return listResource(request, config); }
export async function POST(request: Request) { return createResource(request, config); }