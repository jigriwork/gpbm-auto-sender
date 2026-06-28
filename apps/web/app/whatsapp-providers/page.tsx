"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, MessageSquare, ShieldCheck, TestTube2 } from "lucide-react";
import { AppShell } from "../../components/nav";
import { AlertBanner, Button, EmptyState, ErrorState, LoadingState, Modal, Panel, SelectInput, StatusBadge, StatusPill, TextInput } from "../../components/ui";
import { useBusinessContext } from "../../lib/business-context";
import { readApi, withBusinessId, writeApi, type ApiState } from "../../lib/client-data";

type ProviderKey = "msg91" | "custom_api" | "interakt_coming_soon" | "wati_coming_soon" | "aisensy_coming_soon" | "gupshup_coming_soon" | "zoko_coming_soon";
type Credential = { id: string; provider_key: ProviderKey; display_name?: string | null; is_default: boolean; status: string; credentials_configured?: boolean };
type CredentialResponse = { data: Credential[] };

const providers: { key: ProviderKey; label: string; fields: string[]; disabled?: boolean; detail: string }[] = [
  { key: "msg91", label: "MSG91", fields: ["auth_key", "integrated_number", "namespace"], detail: "First provider implementation target." },
  { key: "custom_api", label: "Custom API", fields: ["endpoint", "method", "headers"], detail: "For businesses with a custom WhatsApp endpoint." },
  { key: "interakt_coming_soon", label: "Interakt", fields: [], disabled: true, detail: "Adapter slot ready later." },
  { key: "wati_coming_soon", label: "WATI", fields: [], disabled: true, detail: "Adapter slot ready later." },
  { key: "aisensy_coming_soon", label: "AiSensy", fields: [], disabled: true, detail: "Adapter slot ready later." },
  { key: "gupshup_coming_soon", label: "Gupshup", fields: [], disabled: true, detail: "Adapter slot ready later." },
  { key: "zoko_coming_soon", label: "Zoko", fields: [], disabled: true, detail: "Adapter slot ready later." }
];

export default function WhatsAppProvidersPage() {
  const [state, setState] = useState<ApiState<Credential[]>>({ status: "loading" });
  const [provider, setProvider] = useState<ProviderKey>("msg91");
  const [displayName, setDisplayName] = useState("MSG91");
  const [isDefault, setIsDefault] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saveMessage, setSaveMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const business = useBusinessContext();

  const selected = useMemo(() => providers.find((item) => item.key === provider) ?? providers[0], [provider]);

  useEffect(() => {
    const nextFields = Object.fromEntries(selected.fields.map((field) => [field, ""]));
    setFields(nextFields);
    setDisplayName(selected.label);
  }, [selected]);

  useEffect(() => {
    let active = true;
    if (!business.selectedBusinessId) {
      setState({ status: business.status === "loading" ? "loading" : "auth", data: [], message: business.message || "Select a business to load provider settings." });
      return;
    }
    readApi<CredentialResponse>(withBusinessId("/api/provider-credentials", business.selectedBusinessId)).then((result) => {
      if (!active) return;
      if (result.ok) setState(result.data.data.length ? { status: "ready", data: result.data.data } : { status: "empty", data: [], message: "No provider credentials are configured yet." });
      else setState({ status: result.status === 401 ? "auth" : "error", data: [], message: result.message });
    });
    return () => {
      active = false;
    };
  }, [business.message, business.selectedBusinessId, business.status, saveMessage]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage("");
    if (!business.selectedBusinessId) {
      setSaveMessage("Select a business before saving credentials.");
      return;
    }
    const response = await writeApi("/api/provider-credentials", "POST", {
      business_id: business.selectedBusinessId,
      provider_key: provider,
      display_name: displayName,
      is_default: isDefault,
      status: enabled ? "active" : "disabled",
      credentials: fields
    });
    setSaveMessage(response.ok ? "Saved securely. Secret values are write-only and stay server-side." : response.message || "Credentials could not be saved safely.");
    if (response.ok) setModalOpen(false);
  }

  async function patchCredential(credential: Credential, patch: Partial<Credential>) {
    if (!business.selectedBusinessId) {
      setSaveMessage("Select a business before updating provider settings.");
      return;
    }
    const response = await writeApi(`/api/provider-credentials/${credential.id}`, "PATCH", { business_id: business.selectedBusinessId, ...patch });
    setSaveMessage(response.ok ? "Provider setting updated securely." : response.message || "Provider setting could not be updated.");
  }

  return (
    <AppShell title="WhatsApp Providers" eyebrow="Provider setup" subtitle="Choose the provider per business, keep credentials server-side, and block live sends until setup is confirmed.">
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <ProviderMetric title="Credential safety" detail="Saved values are never displayed back." icon={<ShieldCheck size={18} />} />
        <ProviderMetric title="Test message" detail="Placeholder until provider credentials and template are confirmed." icon={<TestTube2 size={18} />} />
        <ProviderMetric title="Default provider" detail="One provider can be marked default per business." icon={<MessageSquare size={18} />} />
      </div>

      <Panel title="Provider choices" description="MSG91 and Custom API are actionable now. Other providers are deliberately marked coming soon.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {providers.map((item) => (
            <button key={item.key} type="button" disabled={item.disabled} onClick={() => { setProvider(item.key); setModalOpen(true); }} className="private-card-compact p-4 text-left transition hover:border-black disabled:cursor-not-allowed disabled:opacity-60">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{item.label}</p>
                <StatusBadge tone={item.disabled ? "muted" : "success"}>{item.disabled ? "coming soon" : "available"}</StatusBadge>
              </div>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{item.detail}</p>
            </button>
          ))}
        </div>
      </Panel>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Configured credentials" action={<Button type="button" onClick={() => setModalOpen(true)}>Add credential</Button>}>
          {state.status === "loading" ? <LoadingState title="Loading providers" detail="Reading redacted provider credential status." /> : null}
          {state.status === "auth" || state.status === "error" ? <ErrorState title="Provider settings unavailable" detail={state.message ?? "Provider credentials could not be loaded."} /> : null}
          {state.status === "empty" ? <EmptyState detail={state.message} /> : null}
          <div className="mt-3 grid gap-3">
            {(state.data ?? []).map((credential) => (
              <div key={credential.id} className="private-card-compact p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold">{credential.display_name ?? credential.provider_key}</p>
                    <p className="mt-1 text-sm text-neutral-500">Secrets saved: {credential.credentials_configured ? "redacted" : "not configured"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill>{credential.is_default ? "default" : credential.status}</StatusPill>
                    <StatusBadge tone={credential.credentials_configured ? "success" : "warning"}>{credential.credentials_configured ? "configured" : "needs secrets"}</StatusBadge>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" type="button" onClick={() => patchCredential(credential, { is_default: true })}>Set default</Button>
                  <Button variant="secondary" type="button" onClick={() => patchCredential(credential, { status: credential.status === "active" ? "disabled" : "active" })}>{credential.status === "active" ? "Disable" : "Enable"}</Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Provider setup checklist">
          <div className="grid gap-3 text-sm">
            {["Select provider", "Save credentials server-side", "Mark default provider", "Create WhatsApp template", "Run test message", "Enable live sends"].map((item, index) => (
              <div key={item} className="flex items-start gap-3 rounded border border-neutral-200 bg-white p-3">
                {index < 2 ? <CheckCircle2 size={16} className="mt-1" /> : <span className="mt-2 h-2 w-2 rounded-full bg-neutral-400" />}
                <div>
                  <p className="font-semibold">{item}</p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">{index > 3 ? "Placeholder until live provider confirmation." : "Ready in current UI/backend flow."}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <AlertBanner title="Live sends disabled until confirmed" detail="Do not enable real customer sends until provider credentials, templates, parser samples, and agent flow are verified." tone="warning" />
          </div>
        </Panel>
      </div>

      {saveMessage ? <div className="mt-5"><AlertBanner title="Provider update" detail={saveMessage} /></div> : null}

      <Modal open={modalOpen} title="Add provider credential" onClose={() => setModalOpen(false)}>
        <form className="grid gap-4" onSubmit={save}>
          <label className="grid gap-1 text-sm font-medium">
            <span>Provider</span>
            <SelectInput value={provider} onChange={(event) => setProvider(event.target.value as ProviderKey)}>
              {providers.map((item) => <option key={item.key} value={item.key} disabled={item.disabled}>{item.label}{item.disabled ? " coming soon" : ""}</option>)}
            </SelectInput>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            <span>Display name</span>
            <TextInput value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </label>
          {selected.fields.map((field) => (
            <label key={field} className="grid gap-1 text-sm font-medium">
              <span>{field.replaceAll("_", " ")}</span>
              <TextInput type={field.includes("key") || field.includes("headers") ? "password" : "text"} value={fields[field] ?? ""} onChange={(event) => setFields((current) => ({ ...current, [field]: event.target.value }))} placeholder="Saved values are never displayed" />
            </label>
          ))}
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} /> Default provider</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /> Enabled</label>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={selected.disabled}>Save securely</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

function ProviderMetric({ title, detail, icon }: { title: string; detail: string; icon: React.ReactNode }) {
  return <div className="private-card p-4"><span className="grid h-10 w-10 place-items-center rounded bg-neutral-100">{icon}</span><p className="mt-4 font-semibold">{title}</p><p className="mt-1 text-sm leading-6 text-neutral-600">{detail}</p></div>;
}
