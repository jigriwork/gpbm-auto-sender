import { getServiceRoleKey, getSupabaseUrl } from "./env";

type QueryValue = string | number | boolean | null | undefined;

export type SupabaseFilter = Record<string, QueryValue>;

export class SupabaseRestError extends Error {
  constructor(message: string, readonly status: number, readonly details?: unknown) {
    super(message);
  }
}

function headers(extra?: HeadersInit): HeadersInit {
  const serviceRoleKey = getServiceRoleKey();
  return {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    "content-type": "application/json",
    ...extra
  };
}

function buildUrl(table: string, filters?: SupabaseFilter, select = "*"): string {
  const url = new URL(`${getSupabaseUrl()}/rest/v1/${table}`);
  url.searchParams.set("select", select);
  for (const [key, value] of Object.entries(filters ?? {})) {
    if (value === undefined) continue;
    url.searchParams.set(key, value === null ? "is.null" : `eq.${value}`);
  }
  return url.toString();
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const body = text ? (JSON.parse(text) as unknown) : null;
  if (!response.ok) {
    throw new SupabaseRestError("Supabase REST request failed", response.status, body);
  }
  return body as T;
}

export async function selectRows<T>(table: string, filters?: SupabaseFilter, init?: { select?: string; order?: string; limit?: number; offset?: number }): Promise<T[]> {
  const url = new URL(buildUrl(table, filters, init?.select));
  if (init?.order) url.searchParams.set("order", init.order);
  if (init?.limit !== undefined) url.searchParams.set("limit", String(init.limit));
  if (init?.offset !== undefined) url.searchParams.set("offset", String(init.offset));
  const response = await fetch(url, { headers: headers(), cache: "no-store" });
  return parseResponse<T[]>(response);
}

export async function selectOne<T>(table: string, filters?: SupabaseFilter, select = "*"): Promise<T | null> {
  const response = await fetch(buildUrl(table, filters, select), {
    headers: headers({ accept: "application/vnd.pgrst.object+json" }),
    cache: "no-store"
  });
  if (response.status === 406) return null;
  return parseResponse<T>(response);
}

export async function insertRow<T>(table: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${getSupabaseUrl()}/rest/v1/${table}`, {
    method: "POST",
    headers: headers({ prefer: "return=representation" }),
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  const rows = await parseResponse<T[]>(response);
  if (!rows[0]) throw new SupabaseRestError("Supabase insert returned no rows", response.status);
  return rows[0];
}

export async function upsertRow<T>(table: string, payload: Record<string, unknown>, onConflict: string): Promise<T> {
  const url = new URL(`${getSupabaseUrl()}/rest/v1/${table}`);
  url.searchParams.set("on_conflict", onConflict);
  const response = await fetch(url, {
    method: "POST",
    headers: headers({ prefer: "resolution=merge-duplicates,return=representation" }),
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  const rows = await parseResponse<T[]>(response);
  if (!rows[0]) throw new SupabaseRestError("Supabase upsert returned no rows", response.status);
  return rows[0];
}

export async function updateRows<T>(table: string, filters: SupabaseFilter, payload: Record<string, unknown>): Promise<T[]> {
  const url = buildUrl(table, filters);
  const response = await fetch(url, {
    method: "PATCH",
    headers: headers({ prefer: "return=representation" }),
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  return parseResponse<T[]>(response);
}

export async function uploadPrivateObject(path: string, file: Blob): Promise<void> {
  const response = await fetch(`${getSupabaseUrl()}/storage/v1/object/bill-pdfs/${encodeURI(path)}`, {
    method: "POST",
    headers: headers({ "content-type": file.type || "application/pdf", "x-upsert": "true" }),
    body: file,
    cache: "no-store"
  });
  if (!response.ok) {
    const details = await response.text();
    throw new SupabaseRestError("Supabase storage upload failed", response.status, details);
  }
}