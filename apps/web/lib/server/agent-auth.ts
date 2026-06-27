import { createHash, timingSafeEqual } from "node:crypto";
import { getRequiredServerEnv } from "./env";
import { selectRows } from "./supabase-rest";

export type AgentDeviceRow = {
  id: string;
  business_id: string;
  store_id: string;
  name: string;
  device_code: string | null;
  agent_token_hash: string;
  status: string;
};

export function hashAgentToken(token: string): string {
  const pepper = getRequiredServerEnv("AGENT_TOKEN_PEPPER");
  return createHash("sha256").update(`${pepper}:${token}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  return header.slice("bearer ".length).trim() || null;
}

export async function authenticateAgent(request: Request): Promise<AgentDeviceRow | null> {
  const token = readBearerToken(request);
  if (!token) return null;
  const tokenHash = hashAgentToken(token);
  const candidates = await selectRows<AgentDeviceRow>("agent_devices", { status: "active" });
  return candidates.find((agent) => safeEqual(agent.agent_token_hash, tokenHash)) ?? null;
}