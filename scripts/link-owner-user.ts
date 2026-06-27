import { loadLocalEnv, requireEnv } from "./lib/local-env";
import { authAdminFindUserByEmail, authAdminGetUserById, selectRows, upsertRow } from "./lib/supabase-admin";

loadLocalEnv();

type Args = { email?: string; uid?: string; business?: string; role?: "owner" | "admin" | "staff" | "viewer" };
type BusinessRow = { id: string; slug: string | null; name: string };
type BusinessUserRow = { id: string; business_id: string; user_id: string; role: string };

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--email") args.email = argv[++i]?.replace(/^mailto:/, "");
    else if (item === "--uid") args.uid = argv[++i];
    else if (item === "--business") args.business = argv[++i];
    else if (item === "--role") args.role = argv[++i] as Args["role"];
    else throw new Error(`Unknown argument: ${item}`);
  }
  return args;
}

async function main() {
  requireEnv(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  const args = parseArgs(process.argv.slice(2));
  if (!args.uid && !args.email) throw new Error("Provide --uid or --email.");
  if (!args.business) throw new Error("Provide --business slug.");
  const role = args.role ?? "owner";
  if (!["owner", "admin", "staff", "viewer"].includes(role)) throw new Error("Invalid --role.");

  const user = args.uid ? await authAdminGetUserById(args.uid) : await authAdminFindUserByEmail(args.email!);
  if (!user) throw new Error("Auth user was not found; not creating duplicate users.");
  if (args.email && user.email?.toLowerCase() !== args.email.toLowerCase()) throw new Error("Auth user email does not match requested email.");

  const business = (await selectRows<BusinessRow>("businesses", { slug: args.business }, { select: "id,slug,name", limit: 1 }))[0];
  if (!business) throw new Error(`Business not found for slug: ${args.business}`);

  const membership = await upsertRow<BusinessUserRow>("business_users", { business_id: business.id, user_id: user.id, role }, "business_id,user_id");
  console.log(`Linked user ${user.id} (${user.email ?? "no-email"}) to business ${business.slug ?? business.id} as ${membership.role}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Owner link failed.");
  process.exit(1);
});