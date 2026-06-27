import { loadLocalEnv, requireEnv } from "./lib/local-env";
import { authAdminFindUserByEmail, authAdminGetUserById, upsertRow } from "./lib/supabase-admin";

loadLocalEnv();

type Args = { email?: string; uid?: string; role?: "super_admin" | "support_admin"; status?: string };
type PlatformAdminRow = { id: string; user_id: string; email: string; role: string; status: string };

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item === "--email") args.email = argv[++i]?.replace(/^mailto:/, "");
    else if (item === "--uid") args.uid = argv[++i];
    else if (item === "--role") args.role = argv[++i] as Args["role"];
    else if (item === "--status") args.status = argv[++i];
    else throw new Error(`Unknown argument: ${item}`);
  }
  return args;
}

async function main() {
  requireEnv(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  const args = parseArgs(process.argv.slice(2));
  if (!args.uid && !args.email) throw new Error("Provide --uid or --email.");
  const role = args.role ?? "super_admin";
  if (!["super_admin", "support_admin"].includes(role)) throw new Error("Invalid --role.");

  const user = args.uid ? await authAdminGetUserById(args.uid) : await authAdminFindUserByEmail(args.email!);
  if (!user) throw new Error("Auth user was not found; not creating duplicate users.");
  const email = args.email ?? user.email;
  if (!email) throw new Error("Email is required when auth user has no email.");
  if (args.email && user.email && user.email.toLowerCase() !== args.email.toLowerCase()) throw new Error("Auth user email does not match requested email.");

  const row = await upsertRow<PlatformAdminRow>("platform_admins", { user_id: user.id, email, role, status: args.status ?? "active" }, "user_id");
  console.log(`Platform admin ${row.user_id} (${row.email}) set to ${row.role}/${row.status}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Platform admin add failed.");
  process.exit(1);
});