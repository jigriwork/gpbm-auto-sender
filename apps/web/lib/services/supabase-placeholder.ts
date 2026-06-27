export function createSupabasePlaceholder() {
  return {
    connected: false,
    reason: "Supabase client will be connected by Cline after schema, RLS, and server-only credential handling are ready."
  };
}
