import { createProviderAdapter } from "@gpbm/providers";
import type { SendBillMessageInput, WhatsAppProviderKey } from "@gpbm/shared";
import { decryptCredentialPayload, getDefaultProviderCredentials } from "./provider-credentials";

export async function sendBillViaConfiguredProvider(input: Omit<SendBillMessageInput, "provider"> & { provider?: string }) {
  const credential = await getDefaultProviderCredentials(input.business_id);
  const provider = (input.provider ?? credential?.provider_key ?? "test_disabled") as WhatsAppProviderKey;
  const credentials = credential ? decryptCredentialPayload(credential.encrypted_credentials) : {};
  void credentials;

  // Credentials intentionally stay server-side. Provider package adapters remain generic;
  // TODO: pass normalized credential config into real MSG91/custom API wrappers once live credentials/templates exist.
  const adapter = createProviderAdapter(provider);
  return adapter.sendBillMessage({
    ...input,
    provider,
    customer_name: input.customer_name,
    customer_mobile: input.customer_mobile,
    bill_number: input.bill_number,
    bill_date: input.bill_date,
    pdf_url: input.pdf_url,
    template_id: input.template_id,
    template_variables: input.template_variables
  });
}