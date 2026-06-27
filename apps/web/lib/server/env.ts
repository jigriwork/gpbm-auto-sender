export function getRequiredServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseUrl(): string {
  return getRequiredServerEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
}

export function getServiceRoleKey(): string {
  return getRequiredServerEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function getAnonKey(): string {
  return getRequiredServerEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}