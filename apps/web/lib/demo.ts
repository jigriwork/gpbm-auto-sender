import type { AgentDevice, BillDocument, BillingSource, Business, ParserProfile, Store, WhatsAppProviderConfig } from "@gpbm/shared";

export const demoBusiness: Business = {
  id: "biz_gpbm_demo",
  name: "GPBM",
  plan: "starter",
  status: "active",
  created_at: "2026-06-27T00:00:00.000Z"
};

export const demoStores: Store[] = [
  { id: "store_go_planet", business_id: demoBusiness.id, name: "Go Planet", status: "active" },
  { id: "store_brand_mark", business_id: demoBusiness.id, name: "Brand Mark", status: "active" }
];

export const demoBillingSources: BillingSource[] = [
  {
    id: "src_generic_folder",
    business_id: demoBusiness.id,
    store_id: "store_go_planet",
    name: "Generic PDF Folder Watcher",
    source_type: "generic_pdf_folder",
    status: "active"
  },
  {
    id: "src_brand_generic_folder",
    business_id: demoBusiness.id,
    store_id: "store_brand_mark",
    name: "Generic PDF Folder Watcher",
    source_type: "generic_pdf_folder",
    status: "active"
  }
];

export const demoProviders: WhatsAppProviderConfig[] = [
  {
    id: "provider_msg91_demo",
    business_id: demoBusiness.id,
    provider: "msg91",
    display_name: "MSG91",
    status: "test_mode",
    credentials_configured: false
  }
];

export const demoParserProfiles: ParserProfile[] = [
  {
    id: "parser_generic_pdf_v1",
    business_id: demoBusiness.id,
    name: "generic_pdf_v1",
    source_type: "generic_pdf_folder",
    required_fields: ["customer_mobile", "bill_number", "bill_date"],
    confidence_threshold: 0.75,
    status: "active"
  },
  {
    id: "parser_logic_pdf_v1",
    business_id: demoBusiness.id,
    name: "logic_pdf_v1",
    source_type: "logic_pdf",
    required_fields: ["customer_mobile", "bill_number"],
    confidence_threshold: 0.8,
    status: "draft"
  },
  {
    id: "parser_gpbm_go_planet_demo",
    business_id: demoBusiness.id,
    store_id: "store_go_planet",
    name: "gpbm_go_planet_demo",
    source_type: "custom_pdf",
    required_fields: ["customer_mobile", "customer_name", "bill_number"],
    confidence_threshold: 0.78,
    status: "draft"
  },
  {
    id: "parser_gpbm_brand_mark_demo",
    business_id: demoBusiness.id,
    store_id: "store_brand_mark",
    name: "gpbm_brand_mark_demo",
    source_type: "custom_pdf",
    required_fields: ["customer_mobile", "customer_name", "bill_number"],
    confidence_threshold: 0.78,
    status: "draft"
  }
];

export const demoAgents: AgentDevice[] = [
  {
    id: "agent_go_planet_windows",
    business_id: demoBusiness.id,
    store_id: "store_go_planet",
    name: "Go Planet billing PC",
    status: "online",
    last_seen_at: "2026-06-27T09:10:00.000Z"
  },
  {
    id: "agent_brand_mark_windows",
    business_id: demoBusiness.id,
    store_id: "store_brand_mark",
    name: "Brand Mark billing PC",
    status: "offline",
    last_seen_at: "2026-06-26T18:40:00.000Z"
  }
];

export const demoBills: BillDocument[] = [
  {
    id: "bill_1001",
    business_id: demoBusiness.id,
    store_id: "store_go_planet",
    customer_name: "Demo Customer",
    customer_mobile: "+919999999999",
    bill_number: "GP-1001",
    bill_date: "2026-06-27",
    bill_amount: 2840,
    status: "sent",
    pdf_path: "private/bills/gp-1001.pdf",
    created_at: "2026-06-27T09:00:00.000Z"
  },
  {
    id: "bill_1002",
    business_id: demoBusiness.id,
    store_id: "store_brand_mark",
    customer_name: "Needs Review",
    customer_mobile: "",
    bill_number: "BM-991",
    bill_date: "2026-06-27",
    bill_amount: 1120,
    status: "invalid_mobile",
    pdf_path: "private/bills/bm-991.pdf",
    created_at: "2026-06-27T09:18:00.000Z"
  }
];

export const metricCards = [
  { label: "Sent today", value: "128", detail: "Across 2 demo stores" },
  { label: "Failed", value: "4", detail: "Provider or upload errors" },
  { label: "Duplicates", value: "7", detail: "Stopped before sending" },
  { label: "Invalid mobile", value: "3", detail: "Parser needs review" },
  { label: "Retry queue", value: "11", detail: "Offline-safe pending bills" },
  { label: "Agents online", value: "1/2", detail: "Last heartbeat tracked" }
];
