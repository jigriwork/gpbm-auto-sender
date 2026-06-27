"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/nav";
import { Button, EmptyState, ErrorState, LoadingState, Panel, SelectInput, StatusPill, TextInput } from "../../components/ui";
import { useBusinessContext } from "../../lib/business-context";
import { readApi, withBusinessId, writeApi, type ApiState } from "../../lib/client-data";

type ProviderKey = "msg91" | "custom_api" | "interakt_coming_soon" | "wati_coming_soon" | "aisensy_coming_soon" | "gupshup_coming_soon" | "zoko_coming_soon";
type Credential = { id: string; provider_key: ProviderKey; display_name?: string | null; is_default: boolean; status: string; credentials_configured?: boolean };
type CredentialResponse = { data: Credential[] };

const providers: { key: ProviderKey; label: string; fields: string[]; disabled?: boolean }[] = [
  { key: "msg91", label: "MSG91", fields: ["auth_key", "integrated_number", "namespace"] },
  { key: "custom_api", label: "Custom API", fields: ["endpoint", "method", "headers"] },
  { key: "interakt_coming_soon", label: "Interakt", fields: [], disabled: true },
  { key: "wati_coming_soon", label: "WATI", fields: [], disabled: true },
  { key: "aisensy_coming_soon", label: "AiSensy", fields: [], disabled: true },
  { key: "gupshup_coming_soon", label: "Gupshup", fields: [], disabled: true },
  { key: "zoko_coming_soon", label: "Zoko", fields: [], disabled: true }
];

export default function WhatsAppProvidersPage() {
  const [state, setState] = useState<ApiState<Credential[]>>({ status: "loading" });
  const [provider, setProvider] = useState<ProviderKey>("msg91");
  const [displayName, setDisplayName] = useState("MSG91");
  const [isDefault, setIsDefault] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saveMessage, setSaveMessage] = useState("");
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
    <AppShell title="WhatsApp Providers" eyebrow="Setup" subtitle="Connect WhatsApp provider credentials safely. Saved secrets are never displayed back in the browser.">
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Panel title="Configured credentials">
          {state.status === "loading" ? <LoadingState title="Loading providers" detail="Reading redacted provider credential status." /> : null}
          {state.status === "auth" || state.status === "error" ? <ErrorState title="Provider settings unavailable" detail={state.message ?? "Provider credentials could not be loaded."} /> : null}
          {state.status === "empty" ? <EmptyState detail={state.message} /> : null}
          <div className="mt-3 grid gap-3">
            {(state.data ?? []).map((credential) => (
              <div key={credential.id} className="private-card-compact p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{credential.display_name ?? credential.provider_key}</p>
                    <p className="mt-1 text-sm text-neutral-500">Secrets saved: {credential.credentials_configured ? "redacted" : "not configured"}</p>
                  </div>
                  <StatusPill>{credential.is_default ? "default" : credential.status}</StatusPill>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" type="button" onClick={() => patchCredential(credential, { is_default: true })}>Set default</Button>
                  <Button variant="secondary" type="button" onClick={() => patchCredential(credential, { status: credential.status === "active" ? "disabled" : "active" })}>{credential.status === "active" ? "Disable" : "Enable"}</Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Add provider">
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
            <Button type="submit" disabled={selected.disabled}>Save securely</Button>
            {saveMessage ? <p className="text-sm text-neutral-600">{saveMessage}</p> : null}
          </form>
        </Panel>
      </div>
    </AppShell>
  );
}
