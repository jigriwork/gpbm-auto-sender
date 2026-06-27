"use client";

import { useCallback, useEffect, useState } from "react";
import { useBusinessContext } from "../lib/business-context";
import { readApi, withBusinessId, writeApi } from "../lib/client-data";
import { Panel, StatusPill } from "./ui";

type Field = { name: string; label: string; placeholder?: string; type?: "text" | "json"; required?: boolean };

export function SettingsResourcePage({ apiPath, title, description, fields, defaults = {} }: { apiPath: string; title: string; description: string; fields: Field[]; defaults?: Record<string, string> }) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [form, setForm] = useState<Record<string, string>>(defaults);
  const [message, setMessage] = useState("Loading...");
  const [saving, setSaving] = useState(false);
  const [oneTimeToken, setOneTimeToken] = useState("");
  const [rotatingId, setRotatingId] = useState("");
  const business = useBusinessContext();
  const businessId = business.selectedBusinessId;
  const isAgents = apiPath === "/api/agents";

  const load = useCallback(async () => {
    if (!businessId) {
      setRows([]);
      setMessage(business.status === "loading" ? "Loading business context." : "Select a business to load records.");
      return;
    }
    const result = await readApi<{ data: Array<Record<string, unknown>> }>(withBusinessId(apiPath, businessId));
    if (result.ok) {
      setRows(result.data.data);
      setMessage(result.data.data.length ? "" : "No records yet.");
    } else {
      setMessage(result.message);
    }
  }, [apiPath, business.status, businessId]);

  useEffect(() => { void load(); }, [load]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const payload: Record<string, unknown> = { business_id: businessId };
    try {
      for (const field of fields) {
        const value = form[field.name];
        if (value === undefined || value === "") continue;
        payload[field.name] = field.type === "json" ? JSON.parse(value) : value;
      }
    } catch {
      setSaving(false);
      setMessage("Invalid JSON field value.");
      return;
    }
    const result = await writeApi<{ data?: Record<string, unknown>; one_time_token?: string }>(apiPath, "POST", payload);
    setSaving(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    if (result.data.one_time_token) setOneTimeToken(result.data.one_time_token);
    setForm(defaults);
    setMessage("Saved.");
    await load();
  }

  async function rotateToken(row: Record<string, unknown>) {
    const id = String(row.id ?? "");
    if (!id || !businessId) return;
    setRotatingId(id);
    const result = await writeApi<{ one_time_token?: string }>(`${apiPath}/${id}/rotate-token`, "POST", { business_id: businessId });
    setRotatingId("");
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    if (result.data.one_time_token) setOneTimeToken(result.data.one_time_token);
    setMessage("Token rotated. Copy the new token now.");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
      <Panel title={title}>
        <p className="mb-4 text-sm leading-6 text-neutral-600">{description}</p>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Business: {business.selectedBusiness?.name ?? "Not selected"}</p>
        {message ? <p className="mb-4 rounded border border-neutral-200 p-3 text-sm text-neutral-600">{message}</p> : null}
        {oneTimeToken ? (
          <div className="mb-4 rounded border border-black bg-white p-4">
            <p className="font-semibold">One-time agent token</p>
            <p className="mt-1 text-sm text-neutral-600">Copy now. This token will not be shown again.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
              <code className="overflow-x-auto rounded border border-neutral-300 bg-neutral-50 p-3 text-xs">{oneTimeToken}</code>
              <button className="rounded bg-black px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => void navigator.clipboard?.writeText(oneTimeToken)}>Copy</button>
            </div>
            <button className="mt-3 text-sm font-semibold" type="button" onClick={() => setOneTimeToken("")}>Hide token</button>
          </div>
        ) : null}
        <div className="grid gap-3">
          {rows.map((row) => (
            <div key={String(row.id)} className="rounded border border-neutral-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{String(row.name ?? row.template_name ?? row.device_code ?? row.id)}</h2>
                  <p className="mt-1 text-sm text-neutral-500">{String(row.code ?? row.source_type ?? row.parser_key ?? row.provider_key ?? row.store_id ?? "Tenant scoped")}</p>
                </div>
                <StatusPill>{String(row.status ?? "active")}</StatusPill>
              </div>
              {isAgents ? (
                <button className="mt-3 rounded border border-neutral-300 px-3 py-2 text-xs font-semibold disabled:opacity-60" type="button" disabled={rotatingId === String(row.id)} onClick={() => rotateToken(row)}>
                  {rotatingId === String(row.id) ? "Rotating..." : "Rotate token"}
                </button>
              ) : null}
              {row.one_time_token ? null : <p className="mt-3 text-xs text-neutral-500">ID: {String(row.id)}</p>}
            </div>
          ))}
        </div>
      </Panel>
      <Panel title={`Create ${title.toLowerCase()}`}>
        <form onSubmit={submit} className="grid gap-3">
          {fields.map((field) => (
            <label key={field.name} className="grid gap-1 text-sm font-medium">
              <span>{field.label}</span>
              <input value={form[field.name] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} className="h-10 rounded border border-neutral-300 bg-white px-3 text-sm" placeholder={field.placeholder} required={field.required} />
            </label>
          ))}
          <button disabled={saving} className="h-10 rounded bg-black px-4 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Create"}</button>
          <p className="text-xs leading-5 text-neutral-500">Writes require owner/admin membership or super admin. JSON fields must contain valid JSON.</p>
        </form>
      </Panel>
    </div>
  );
}
