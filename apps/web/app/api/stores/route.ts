import { createResource, listResource } from "../../../lib/server/crud";

export const runtime = "nodejs";
const config = { table: "stores", fields: ["name", "code", "status"], required: ["name"] };

export async function GET(request: Request) { return listResource(request, config); }
export async function POST(request: Request) { return createResource(request, config); }