import { randomBytes } from "node:crypto";
import { hashAgentToken } from "./agent-auth";
import { resolveBusinessContext } from "./dashboard-auth";
import { jsonError, jsonOk, readJson } from "./http";
import { insertRow, selectOne, selectRows, updateRows } from "./supabase-rest";

export type ResourceConfig = {
  table: string;
  listSelect?: string;
  fields: string[];
  required: string[];
};

type Body = Record<string, unknown> & { business_id?: string; status?: string };

export function cleanPayload(body: Body, fields: string[]): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    if (body[field] !== undefined) payload[field] = body[field];
  }
  return payload;
}

export async function listResource(request: Request, config: ResourceConfig) {
  const url = new URL(request.url);
  const ctx = await resolveBusinessContext(request, ["owner", "admin", "staff", "viewer"], url.searchParams.get("business_id"));
  if (!ctx) return jsonError("Authenticated business access is required.", 401, "UNAUTHORIZED_DASHBOARD");
  const rows = await selectRows(config.table, {
    business_id: ctx.businessId,
    store_id: url.searchParams.get("store_id") ?? undefined,
    status: url.searchParams.get("status") ?? undefined
  }, { select: config.listSelect, order: "created_at.desc" });
  return jsonOk({ data: rows, business_id: ctx.businessId, role: ctx.businessRole, platform_role: ctx.platformRole });
}

export async function createResource(request: Request, config: ResourceConfig) {
  const body = await readJson<Body>(request);
  const ctx = await resolveBusinessContext(request, ["owner", "admin"], body.business_id);
  if (!ctx) return jsonError("Owner/admin business access is required.", 401, "UNAUTHORIZED_DASHBOARD");
  for (const field of config.required) {
    if (body[field] === undefined || body[field] === null || body[field] === "") return jsonError(`${field} is required.`);
  }
  const row = await insertRow(config.table, { business_id: ctx.businessId, ...cleanPayload(body, config.fields) });
  return jsonOk({ data: row }, 201);
}

export async function patchResource(request: Request, id: string, config: ResourceConfig) {
  const body = await readJson<Body>(request);
  const ctx = await resolveBusinessContext(request, ["owner", "admin"], body.business_id);
  if (!ctx) return jsonError("Owner/admin business access is required.", 401, "UNAUTHORIZED_DASHBOARD");
  const existing = await selectOne(config.table, { id, business_id: ctx.businessId }, "id,business_id");
  if (!existing) return jsonError("Resource not found.", 404, "RESOURCE_NOT_FOUND");
  const patch = cleanPayload(body, config.fields);
  if (Object.keys(patch).length === 0) return jsonError("No supported fields provided.");
  const updated = (await updateRows(config.table, { id, business_id: ctx.businessId }, patch))[0];
  return jsonOk({ data: updated });
}

export function newAgentToken(): string {
  return `gpbm_agent_${randomBytes(32).toString("base64url")}`;
}

export function agentTokenPatch(token: string): { agent_token_hash: string } {
  return { agent_token_hash: hashAgentToken(token) };
}