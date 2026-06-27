import { createHash, randomBytes } from "node:crypto";
import { loadLocalEnv, requireEnv } from "./lib/local-env";
import { insertRow, selectRows, updateRows } from "./lib/supabase-admin";

loadLocalEnv();

type Args = { business?: string; store?: string; name?: string; machine?: string; rotate: boolean };
type BusinessRow = { id: string; slug: string | null; name: string };
type StoreRow = { id: string; business_id: string; code: string | null; name: string };
type AgentRow = { id: string; name: string; device_code: string | null; status: string };

function parseArgs(argv: string[]): Args {
  const args: Args = { rotate: false };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--rotate") args.rotate = true;
    else if (item === "--business") args.business = argv[++i];
    else if (item === "--store") args.store = argv[++i];
    else if (item === "--name") args.name = argv[++i];
    else if (item === "--machine") args.machine = argv[++i];
    else throw new Error(`Unknown argument: ${item}`);
  }
  return args;
}

function requiredArg(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing required argument: --${name}`);
  return value;
}

function hashAgentToken(token: string): string {
  const pepper = process.env.AGENT_TOKEN_PEPPER;
  if (!pepper) throw new Error("Missing required local environment variable: AGENT_TOKEN_PEPPER");
  return createHash("sha256").update(`${pepper}:${token}`).digest("hex");
}

function deviceCode(storeCode: string, name: string): string {
  const slug = name.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 32) || "AGENT";
  return `${storeCode.toUpperCase()}_${slug}_${randomBytes(3).toString("hex").toUpperCase()}`;
}

async function main() {
  requireEnv(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "AGENT_TOKEN_PEPPER"]);
  const args = parseArgs(process.argv.slice(2));
  const businessSlug = requiredArg(args.business, "business");
  const storeCode = requiredArg(args.store, "store");
  const agentName = requiredArg(args.name, "name");

  const business = (await selectRows<BusinessRow>("businesses", { slug: businessSlug }, { select: "id,slug,name", limit: 1 }))[0];
  if (!business) throw new Error(`Business not found for slug: ${businessSlug}`);

  const store = (await selectRows<StoreRow>("stores", { business_id: business.id, code: storeCode }, { select: "id,business_id,code,name", limit: 1 }))[0];
  if (!store) throw new Error(`Store not found for business/store: ${businessSlug}/${storeCode}`);

  const existing = (await selectRows<AgentRow>("agent_devices", { business_id: business.id, store_id: store.id, name: agentName }, { select: "id,name,device_code,status", limit: 1 }))[0];
  if (existing && !args.rotate) {
    console.log("Agent device already exists. Token was not changed. Re-run with --rotate to generate a new token.");
    console.log(`Agent ID: ${existing.id}`);
    console.log(`Device code: ${existing.device_code ?? "(none)"}`);
    return;
  }

  const plainToken = `gpbm_agent_${randomBytes(32).toString("base64url")}`;
  const payload = {
    business_id: business.id,
    store_id: store.id,
    name: agentName,
    device_code: existing?.device_code ?? deviceCode(storeCode, agentName),
    agent_token_hash: hashAgentToken(plainToken),
    machine_name: args.machine ?? null,
    status: "active"
  };

  const agent = existing
    ? (await updateRows<AgentRow>("agent_devices", { id: existing.id, business_id: business.id, store_id: store.id }, payload))[0]
    : await insertRow<AgentRow>("agent_devices", payload);

  console.log(existing ? "Agent token rotated." : "Agent device created.");
  console.log(`Agent ID: ${agent.id}`);
  console.log(`Device code: ${agent.device_code ?? payload.device_code}`);
  console.log("Plain token (copy now; it is shown only once):");
  console.log(plainToken);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Agent device creation failed.");
  process.exit(1);
});
