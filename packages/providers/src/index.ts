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

export class Msg91ProviderAdapter implements WhatsAppProviderAdapter {
  key = "msg91" as const;
  displayName = "MSG91";

  async sendBillMessage(input: SendBillMessageInput): Promise<ProviderSendResult> {
    void input;
    return {
      ok: false,
      error_code: "MSG91_NOT_CONFIGURED",
      error_message: "MSG91 adapter placeholder is ready for server-side credentials."
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
