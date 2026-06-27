type QueryValue = string | number | boolean | null | undefined;

export class AdminRestError extends Error {
  constructor(message: string, readonly status: number, readonly details?: unknown) {
    super(message);
  }
}

export function supabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error("Missing required local environment variable: NEXT_PUBLIC_SUPABASE_URL");
  return value.replace(/\/$/, "");
}

function serviceRoleKey(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error("Missing required local environment variable: SUPABASE_SERVICE_ROLE_KEY");
  return value;
}

function headers(extra?: HeadersInit): HeadersInit {
  const key = serviceRoleKey();
  return {
    apikey: key,
    authorization: `Bearer ${key}`,
    "content-type": "application/json",
    ...extra
  };
}

function restUrl(table: string, filters?: Record<string, QueryValue>, select = "*"): URL {
  const url = new URL(`${supabaseUrl()}/rest/v1/${table}`);
  url.searchParams.set("select", select);
  for (const [key, value] of Object.entries(filters ?? {})) {
    if (value === undefined) continue;
    url.searchParams.set(key, value === null ? "is.null" : `eq.${value}`);
  }
  return url;
}

async function parse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const body = text ? (JSON.parse(text) as unknown) : null;
  if (!response.ok) throw new AdminRestError("Supabase admin REST request failed", response.status, body);
  return body as T;
}

export async function selectRows<T>(table: string, filters?: Record<string, QueryValue>, options?: { select?: string; limit?: number; order?: string }): Promise<T[]> {
  const url = restUrl(table, filters, options?.select);
  if (options?.limit !== undefined) url.searchParams.set("limit", String(options.limit));
  if (options?.order) url.searchParams.set("order", options.order);
  const response = await fetch(url, { headers: headers(), cache: "no-store" });
  return parse<T[]>(response);
}

export async function selectOne<T>(table: string, filters?: Record<string, QueryValue>, select = "*"): Promise<T | null> {
  const response = await fetch(restUrl(table, filters, select), { headers: headers({ accept: "application/vnd.pgrst.object+json" }), cache: "no-store" });
  if (response.status === 406) return null;
  return parse<T>(response);
}

export async function insertRow<T>(table: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${supabaseUrl()}/rest/v1/${table}`, {
    method: "POST",
    headers: headers({ prefer: "return=representation" }),
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  const rows = await parse<T[]>(response);
  if (!rows[0]) throw new AdminRestError("Supabase insert returned no rows", response.status);
  return rows[0];
}

export async function updateRows<T>(table: string, filters: Record<string, QueryValue>, payload: Record<string, unknown>): Promise<T[]> {
  const response = await fetch(restUrl(table, filters), {
    method: "PATCH",
    headers: headers({ prefer: "return=representation" }),
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  return parse<T[]>(response);
}

export async function listBuckets(): Promise<Array<{ id: string; name: string; public: boolean }>> {
  const response = await fetch(`${supabaseUrl()}/storage/v1/bucket`, { headers: headers(), cache: "no-store" });
  return parse<Array<{ id: string; name: string; public: boolean }>>(response);
}
