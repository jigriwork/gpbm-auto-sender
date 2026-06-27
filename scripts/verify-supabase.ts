import { loadLocalEnv, missingEnv, requireEnv } from "./lib/local-env";
import { listBuckets, selectRows } from "./lib/supabase-admin";

loadLocalEnv();

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "APP_ENCRYPTION_KEY",
  "AGENT_TOKEN_PEPPER",
  "MSG91_TEST_MODE"
];

const REQUIRED_TABLES = [
  "businesses",
  "business_users",
  "stores",
  "billing_sources",
  "parser_profiles",
  "whatsapp_providers",
  "provider_credentials",
  "whatsapp_templates",
  "agent_devices",
  "bill_documents",
  "bill_events",
  "audit_logs",
  "subscription_plans",
  "business_subscriptions"
];

type BusinessRow = { id: string; slug: string | null; name: string };
type StoreRow = { id: string; code: string | null; name: string };

async function main() {
  const missing = missingEnv(REQUIRED_ENV);
  if (missing.length > 0) {
    throw new Error(`Missing required local environment variables: ${missing.join(", ")}`);
  }
  requireEnv(REQUIRED_ENV);

  console.log("Supabase verification started.");
  for (const table of REQUIRED_TABLES) {
    await selectRows(table, undefined, { select: "id", limit: 1 });
    console.log(`OK table: ${table}`);
  }

  const business = (await selectRows<BusinessRow>("businesses", { slug: "gpbm" }, { select: "id,slug,name", limit: 1 }))[0];
  if (!business) throw new Error("GPBM seed business is missing.");
  console.log("OK seed business: gpbm");

  const stores = await selectRows<StoreRow>("stores", { business_id: business.id }, { select: "id,code,name" });
  for (const code of ["GP", "BM"]) {
    if (!stores.some((store) => store.code === code)) throw new Error(`Seed store is missing: ${code}`);
    console.log(`OK seed store: ${code}`);
  }

  const providerOptions = await selectRows("whatsapp_providers", undefined, { select: "provider_key,status" });
  if (providerOptions.length < 2) throw new Error("Provider seed options are missing or incomplete.");
  console.log(`OK provider seed options: ${providerOptions.length}`);

  const parserProfiles = await selectRows("parser_profiles", { business_id: business.id }, { select: "id,name,parser_key" });
  for (const name of ["generic_pdf_v1", "gpbm_go_planet_demo", "gpbm_brand_mark_demo"]) {
    if (!parserProfiles.some((profile) => (profile as { name: string }).name === name)) throw new Error(`Parser seed profile is missing: ${name}`);
    console.log(`OK parser profile: ${name}`);
  }

  const billingSources = await selectRows("billing_sources", { business_id: business.id }, { select: "id,name,source_type" });
  if (!billingSources.some((source) => (source as { source_type: string }).source_type === "generic_pdf_folder")) throw new Error("Generic PDF Folder Watcher billing source is missing.");
  console.log("OK billing source: generic_pdf_folder");

  const buckets = await listBuckets();
  const billBucket = buckets.find((bucket) => bucket.id === "bill-pdfs" || bucket.name === "bill-pdfs");
  if (!billBucket) throw new Error("Storage bucket is missing: bill-pdfs");
  console.log(`OK storage bucket: bill-pdfs (${billBucket.public ? "public" : "private"})`);

  console.log("Supabase verification completed successfully.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Supabase verification failed.");
  process.exit(1);
});
