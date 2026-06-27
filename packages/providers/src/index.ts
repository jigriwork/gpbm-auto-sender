import type { SendBillMessageInput, WhatsAppProviderKey } from "@gpbm/shared";

export type ProviderSendResult = {
  ok: boolean;
  provider_message_id?: string;
  error_code?: string;
  error_message?: string;
};

export interface WhatsAppProviderAdapter {
  key: WhatsAppProviderKey;
  displayName: string;
  sendBillMessage(input: SendBillMessageInput): Promise<ProviderSendResult>;
}

export type Msg91CredentialConfig = {
  auth_key?: string;
  integrated_number?: string;
  sender?: string;
  template_id?: string;
  language?: string;
  namespace?: string;
};

export class Msg91ProviderAdapter implements WhatsAppProviderAdapter {
  key = "msg91" as const;
  displayName = "MSG91";

  async sendBillMessage(input: SendBillMessageInput): Promise<ProviderSendResult> {
    const testMode = process.env.MSG91_TEST_MODE !== "false";
    if (testMode) {
      return {
        ok: true,
        provider_message_id: `msg91_test_${input.business_id}_${input.bill_number}`
      };
    }

    // Required real-send shape, kept intentionally disabled until verified against
    // MSG91's live WhatsApp API docs/account configuration:
    // - auth_key
    // - integrated_number / sender
    // - template_id
    // - language
    // - template_variables
    // - pdf_url/media URL
    // TODO: Implement only after endpoint, payload field names, template namespace,
    // and media handling are confirmed for the owner's MSG91 account.
    return {
      ok: false,
      error_code: "MSG91_LIVE_SEND_NOT_IMPLEMENTED",
      error_message: "MSG91 live sending is disabled until endpoint fields and templates are verified."
    };
  }
}

export class CustomApiProviderAdapter implements WhatsAppProviderAdapter {
  key = "custom_api" as const;
  displayName = "Custom API";

  async sendBillMessage(input: SendBillMessageInput): Promise<ProviderSendResult> {
    void input;
    return {
      ok: false,
      error_code: "CUSTOM_API_NOT_CONFIGURED",
      error_message: "Custom API adapter placeholder needs a server-side endpoint configuration."
    };
  }
}

export class DisabledTestProviderAdapter implements WhatsAppProviderAdapter {
  key = "test_disabled" as const;
  displayName = "Disabled Test Provider";

  async sendBillMessage(input: SendBillMessageInput): Promise<ProviderSendResult> {
    return {
      ok: true,
      provider_message_id: `test_${input.business_id}_${input.bill_number}`
    };
  }
}

export function createProviderAdapter(provider: WhatsAppProviderKey): WhatsAppProviderAdapter {
  if (provider === "msg91") return new Msg91ProviderAdapter();
  if (provider === "custom_api") return new CustomApiProviderAdapter();
  return new DisabledTestProviderAdapter();
}
