import { demoBusiness, demoStores } from "./demo";
import { createBrowserSupabaseClient } from "./supabase-browser";

export type ApiState<T> =
  | { status: "loading"; data?: T; message?: string }
  | { status: "ready"; data: T; message?: string }
  | { status: "empty"; data?: T; message: string }
  | { status: "auth"; data?: T; message: string }
  | { status: "error"; data?: T; message: string };

export const defaultBusinessId = process.env.NEXT_PUBLIC_DEMO_BUSINESS_ID ?? demoBusiness.id;

export const selectedBusinessKey = "gpbm_selected_business_id";

export function getBusinessId() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(selectedBusinessKey) ?? window.localStorage.getItem("gpbm_business_id") ?? "";
}

export function setSelectedBusinessId(value: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(selectedBusinessKey, value);
}

export async function getSupabaseAccessToken(): Promise<string> {
  if (typeof window === "undefined") return "";
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

function safeApiMessage(status: number, body: Record<string, unknown>) {
  const error = body.error as { code?: string; message?: string } | undefined;
  const isAuth = status === 401 || error?.code === "UNAUTHORIZED_DASHBOARD";
  if (isAuth) return "Please sign in to load live data.";
  return typeof error?.message === "string" && error.message.length < 160 ? error.message : "Live data is not available right now.";
}

export async function apiRequest<T>(path: string, options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: Record<string, unknown> } = {}): Promise<ApiResult<T>> {
  try {
    const token = await getSupabaseAccessToken();
    if (!token) return { ok: false, status: 401, message: "Please sign in to load live data." };
    const response = await fetch(path, {
      method: options.method ?? "GET",
      cache: "no-store",
      headers: { authorization: `Bearer ${token}`, ...(options.body ? { "content-type": "application/json" } : {}) },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, status: response.status, message: safeApiMessage(response.status, body) };
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, status: 0, message: "Backend connection is not ready in this browser session." };
  }
}

export async function readApi<T>(path: string): Promise<ApiResult<T>> {
  return apiRequest<T>(path);
}

export async function writeApi<T>(path: string, method: "POST" | "PATCH" | "DELETE", body: Record<string, unknown>): Promise<ApiResult<T>> {
  return apiRequest<T>(path, { method, body });
}

export function withBusinessId(path: string, businessId?: string | null) {
  if (!businessId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}business_id=${encodeURIComponent(businessId)}`;
}

export function storeName(storeId?: string | null) {
  return demoStores.find((store) => store.id === storeId)?.name ?? storeId ?? "Unassigned";
}

export function formatDateTime(value?: string | null) {
  if (!value) return "Pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function formatMoney(value?: number | string | null, currency = "INR") {
  if (value === undefined || value === null || value === "") return "Pending";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return String(value);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(numeric);
}

export function redactName(value?: string | null) {
  if (!value?.trim()) return "Customer pending";
  const [first] = value.trim().split(/\s+/);
  return `${first.slice(0, 1)}${first.length > 1 ? "***" : ""}`;
}

export function redactMobile(value?: string | null) {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (digits.length < 4) return "Missing";
  return `******${digits.slice(-4)}`;
}

export function safeMessage(value?: string | null) {
  if (!value) return "No safe reason recorded yet.";
  return value.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]").replace(/\b\d{8,}\b/g, "[number]").slice(0, 140);
}
