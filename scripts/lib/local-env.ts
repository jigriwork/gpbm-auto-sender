import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ENV_FILES = [".env", ".env.local", "apps/web/.env", "apps/web/.env.local"];

export function loadLocalEnv(): void {
  for (const file of ENV_FILES) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;
    const content = readFileSync(path, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key]) continue;
      process.env[key] = parseEnvValue(rawValue);
    }
  }
}

function parseEnvValue(value: string): string {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function missingEnv(names: string[]): string[] {
  return names.filter((name) => !process.env[name]);
}

export function requireEnv(names: string[]): void {
  const missing = missingEnv(names);
  if (missing.length > 0) {
    throw new Error(`Missing required local environment variables: ${missing.join(", ")}`);
  }
}
