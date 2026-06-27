import type { AgentConfig } from "@gpbm/shared";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadAgentConfig(): AgentConfig {
  return {
    business_id: requiredEnv("AGENT_BUSINESS_ID"),
    store_id: requiredEnv("AGENT_STORE_ID"),
    billing_source_id: requiredEnv("AGENT_BILLING_SOURCE_ID"),
    parser_profile_id: requiredEnv("AGENT_PARSER_PROFILE_ID"),
    agent_token: requiredEnv("AGENT_TOKEN"),
    incoming_folder: requiredEnv("AGENT_INCOMING_FOLDER"),
    sent_folder: requiredEnv("AGENT_SENT_FOLDER"),
    failed_folder: requiredEnv("AGENT_FAILED_FOLDER"),
    duplicate_folder: requiredEnv("AGENT_DUPLICATE_FOLDER"),
    api_base_url: process.env.AGENT_API_BASE_URL ?? "http://localhost:3000",
    app_version: process.env.AGENT_APP_VERSION ?? "0.1.0",
    machine_name: process.env.AGENT_MACHINE_NAME ?? process.env.COMPUTERNAME ?? "unknown-windows-agent"
  };
}
