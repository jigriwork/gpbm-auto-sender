import { createDecipheriv, createHash, randomBytes } from "node:crypto";
import { getRequiredServerEnv } from "./env";
import { selectRows } from "./supabase-rest";

export type ProviderCredentialRow = {
  id: string;
  business_id: string;
  provider_key: string;
  display_name: string | null;
  encrypted_credentials: Record<string, unknown>;
  is_default: boolean;
  status: string;
};

function encryptionKey(): Buffer {
  return createHash("sha256").update(getRequiredServerEnv("APP_ENCRYPTION_KEY")).digest();
}

export function decryptCredentialPayload(payload: Record<string, unknown>): Record<string, unknown> {
  // TODO: Replace this app-level AES-GCM helper with Supabase Vault or KMS-backed
  // envelope encryption before production credential onboarding.
  if (typeof payload.ciphertext !== "string" || typeof payload.iv !== "string" || typeof payload.authTag !== "string") {
    return payload;
  }

  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(payload.iv, "base64"));
  decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(payload.ciphertext, "base64")), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8")) as Record<string, unknown>;
}

export function credentialEncryptionPlaceholder(): Record<string, string> {
  return {
    iv: randomBytes(12).toString("base64"),
    note: "Use encryptCredentialPayload before storing real credentials. This placeholder contains no secret material."
  };
}

export async function getDefaultProviderCredentials(businessId: string): Promise<ProviderCredentialRow | null> {
  const rows = await selectRows<ProviderCredentialRow>("provider_credentials", {
    business_id: businessId,
    is_default: true,
    status: "active"
  });
  return rows[0] ?? null;
}