import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT_REF = "vbwveakwcsviwqvidjrl";
const PROJECT_URL = "https://vbwveakwcsviwqvidjrl.supabase.co";
const ENV_PATH = ".env.local";
const WEB_ENV_PATH = "apps/web/.env.local";

type ApiKeyRow = {
  name?: string;
  type?: string;
  key?: string;
  api_key?: string;
  value?: string;
  token?: string;
};

function parseEnv(content: string): Map<string, string> {
  const values = new Map<string, string>();
  for (const line of content.split(/\r?\n/)) {
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line.trim());
    if (match) values.set(match[1], match[2]);
  }
  return values;
}

function serializeEnv(values: Map<string, string>): string {
  return Array.from(values.entries()).map(([key, value]) => `${key}=${value}`).join("\n") + "\n";
}

function keyValue(row: ApiKeyRow | undefined): string | undefined {
  return row?.api_key ?? row?.value ?? row?.key ?? row?.token;
}

function rowText(row: ApiKeyRow): string {
  return `${row.name ?? ""} ${row.type ?? ""} ${row.key && row.key.length < 32 ? row.key : ""}`.toLowerCase();
}

function loadSupabaseApiKeys(): { anon?: string; serviceRole?: string } {
  const outputPath = join(process.env.TEMP ?? process.cwd(), `gpbm-supabase-keys-${Date.now()}.json`);
  try {
    const json = execSync(`npx supabase projects api-keys --project-ref ${PROJECT_REF} --output json`, {
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
      shell: true
    });
    writeFileSync(outputPath, json);
    const parsed = JSON.parse(json) as ApiKeyRow[] | { api_keys?: ApiKeyRow[]; keys?: ApiKeyRow[] };
    const rows = Array.isArray(parsed) ? parsed : parsed.api_keys ?? parsed.keys ?? [];
    const anon = rows.find((row) => /anon|publishable/.test(rowText(row)));
    const serviceRole = rows.find((row) => /service/.test(rowText(row)));
    return { anon: keyValue(anon), serviceRole: keyValue(serviceRole) };
  } finally {
    rmSync(outputPath, { force: true });
  }
}

function main() {
  const existing = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
  const values = parseEnv(existing);
  const keys = loadSupabaseApiKeys();

  values.set("NEXT_PUBLIC_SUPABASE_URL", PROJECT_URL);
  if (keys.anon) values.set("NEXT_PUBLIC_SUPABASE_ANON_KEY", keys.anon);
  if (keys.serviceRole) values.set("SUPABASE_SERVICE_ROLE_KEY", keys.serviceRole);
  if (!values.get("APP_ENCRYPTION_KEY")) values.set("APP_ENCRYPTION_KEY", randomBytes(32).toString("base64url"));
  if (!values.get("AGENT_TOKEN_PEPPER")) values.set("AGENT_TOKEN_PEPPER", randomBytes(32).toString("base64url"));
  values.set("MSG91_TEST_MODE", "true");

  const serialized = serializeEnv(values);
  writeFileSync(ENV_PATH, serialized);
  writeFileSync(WEB_ENV_PATH, serialized);

  const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "APP_ENCRYPTION_KEY", "AGENT_TOKEN_PEPPER", "MSG91_TEST_MODE"];
  const missing = required.filter((name) => !values.get(name));
  if (missing.length > 0) throw new Error(`Missing local env names after setup: ${missing.join(", ")}`);
  console.log("Ignored local env file updated. Secret values were not printed.");
}

main();
