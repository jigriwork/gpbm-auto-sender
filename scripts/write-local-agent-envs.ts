import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadLocalEnv, requireEnv } from "./lib/local-env";
import { selectRows } from "./lib/supabase-admin";

loadLocalEnv();

type BusinessRow = { id: string; slug: string | null };
type StoreRow = { id: string; code: string | null };
type BillingSourceRow = { id: string; store_id: string | null; source_type: string };
type ParserProfileRow = { id: string; store_id: string | null; name: string };

const configs = [
  { storeCode: "GP", tokenFile: "apps/agent/data/gp-agent.token", envFile: "apps/agent/data/gp.env.local", parserProfileKey: "gpbm_go_planet_demo" },
  { storeCode: "BM", tokenFile: "apps/agent/data/bm-agent.token", envFile: "apps/agent/data/bm.env.local", parserProfileKey: "gpbm_brand_mark_demo" }
];

function readToken(path: string): string {
  if (!existsSync(path)) throw new Error(`Missing local token file: ${path}`);
  return readFileSync(path, "utf8").trim();
}

function upsertEnvValue(path: string, key: string, value: string): void {
  const current = existsSync(path) ? readFileSync(path, "utf8") : "";
  const line = `${key}=${value}`;
  const next = new RegExp(`^${key}=.*$`, "m").test(current)
    ? current.replace(new RegExp(`^${key}=.*$`, "m"), line)
    : `${current}${current && !current.endsWith("\n") ? "\n" : ""}${line}\n`;
  writeFileSync(path, next);
}

async function main() {
  requireEnv(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  mkdirSync("apps/agent/data", { recursive: true });
  const business = (await selectRows<BusinessRow>("businesses", { slug: "gpbm" }, { select: "id,slug", limit: 1 }))[0];
  if (!business) throw new Error("Business not found: gpbm");
  const stores = await selectRows<StoreRow>("stores", { business_id: business.id }, { select: "id,code" });
  const sources = await selectRows<BillingSourceRow>("billing_sources", { business_id: business.id }, { select: "id,store_id,source_type" });
  const profiles = await selectRows<ParserProfileRow>("parser_profiles", { business_id: business.id }, { select: "id,store_id,name" });

  for (const config of configs) {
    const store = stores.find((row) => row.code === config.storeCode);
    if (!store) throw new Error(`Store not found: ${config.storeCode}`);
    const source = sources.find((row) => row.store_id === store.id && row.source_type === "generic_pdf_folder");
    const profile = profiles.find((row) => row.name === config.parserProfileKey);
    if (!source) throw new Error(`Billing source not found for store: ${config.storeCode}`);
    if (!profile) throw new Error(`Parser profile not found: ${config.parserProfileKey}`);
    const token = readToken(config.tokenFile);
    writeFileSync(config.envFile, [
      "AGENT_API_BASE_URL=http://localhost:3000",
      `AGENT_TOKEN=${token}`,
      `AGENT_BUSINESS_ID=${business.id}`,
      `AGENT_STORE_ID=${store.id}`,
      `AGENT_BILLING_SOURCE_ID=${source.id}`,
      `AGENT_PARSER_PROFILE_ID=${profile.id}`,
      "AGENT_APP_VERSION=0.1.0",
      `BUSINESS_SLUG=gpbm`,
      `STORE_CODE=${config.storeCode}`,
      `PARSER_PROFILE_KEY=${config.parserProfileKey}`,
      "AGENT_INCOMING_FOLDER=",
      "AGENT_SENT_FOLDER=",
      "AGENT_FAILED_FOLDER=",
      "AGENT_DUPLICATE_FOLDER=",
      ""
    ].join("\n"));
  }

  upsertEnvValue(".env.local", "AGENT_TOKEN", readToken("apps/agent/data/gp-agent.token"));
  upsertEnvValue(".env.local", "STORE_CODE", "GP");
  console.log("Ignored local agent env files were written. Tokens were not printed.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Local agent env write failed.");
  process.exit(1);
});
