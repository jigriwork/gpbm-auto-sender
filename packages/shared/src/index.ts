export type TenantStatus = "active" | "inactive" | "suspended";
export type PlanCode = "starter" | "growth" | "scale" | "enterprise";

export type Business = {
  id: string;
  name: string;
  plan: PlanCode;
  status: TenantStatus;
  created_at: string;
};

export type BusinessUser = {
  id: string;
  business_id: string;
  email: string;
  role: "owner" | "admin" | "operator" | "viewer";
  status: TenantStatus;
};

export type Store = {
  id: string;
  business_id: string;
  name: string;
  status: TenantStatus;
};

export type BillingSourceType = "generic_pdf_folder" | "logic_pdf" | "marg_pdf" | "tally_pdf" | "custom_pdf";

export type BillingSource = {
  id: string;
  business_id: string;
  store_id: string;
  name: string;
  source_type: BillingSourceType;
  status: TenantStatus;
};

export type ParserField =
  | "customer_name"
  | "customer_mobile"
  | "bill_number"
  | "bill_date"
  | "bill_amount";

export type ParserProfile = {
  id: string;
  business_id: string;
  store_id?: string;
  name: string;
  source_type: BillingSourceType;
  required_fields: ParserField[];
  confidence_threshold: number;
  status: "active" | "draft" | "disabled";
};

export type WhatsAppProviderKey =
  | "msg91"
  | "custom_api"
  | "interakt"
  | "wati"
  | "aisensy"
  | "gupshup"
  | "zoko"
  | "test_disabled";

export type WhatsAppProviderConfig = {
  id: string;
  business_id: string;
  provider: WhatsAppProviderKey;
  display_name: string;
  status: "active" | "test_mode" | "disabled";
  credentials_configured: boolean;
};

export type WhatsAppTemplate = {
  id: string;
  business_id: string;
  provider: WhatsAppProviderKey;
  provider_template_id: string;
  name: string;
  variables: string[];
  status: "active" | "draft" | "disabled";
};

export type AgentDevice = {
  id: string;
  business_id: string;
  store_id: string;
  name: string;
  status: "online" | "offline" | "disabled";
  last_seen_at?: string;
};

export type BillStatus =
  | "detected"
  | "parsing"
  | "parsed"
  | "parsing_failed"
  | "invalid_mobile"
  | "duplicate"
  | "queued"
  | "uploading"
  | "sending"
  | "sent"
  | "failed"
  | "retrying";

export type BillDocument = {
  id: string;
  business_id: string;
  store_id: string;
  customer_name?: string;
  customer_mobile?: string;
  bill_number?: string;
  bill_date?: string;
  bill_amount?: number;
  status: BillStatus;
  pdf_path: string;
  pdf_hash?: string;
  created_at: string;
};

export type BillEvent = {
  id: string;
  business_id: string;
  bill_document_id: string;
  status: BillStatus;
  message?: string;
  created_at: string;
};

export type AuditLog = {
  id: string;
  business_id: string;
  actor_id?: string;
  action: string;
  target_type: string;
  target_id?: string;
  created_at: string;
};

export type SendBillMessageInput = {
  business_id: string;
  store_id: string;
  provider: WhatsAppProviderKey;
  customer_name: string;
  customer_mobile: string;
  bill_number: string;
  bill_date: string;
  bill_amount?: number;
  pdf_url: string;
  template_id: string;
  template_variables: Record<string, string | number | undefined>;
};

export type AgentConfig = {
  business_id: string;
  store_id: string;
  billing_source_id: string;
  parser_profile_id: string;
  agent_token: string;
  incoming_folder: string;
  sent_folder: string;
  failed_folder: string;
  duplicate_folder: string;
};
