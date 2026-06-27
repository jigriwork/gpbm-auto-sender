"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getBusinessId, readApi, writeApi } from "../lib/client-data";
import { Panel, StatusPill } from "./ui";

type Field = { name: string; label: string; placeholder?: string; type?: "text" | "json"; required?: boolean };

export function SettingsResourcePage({ apiPath, title, description, fields, defaults = {} }: { apiPath: string; title: string; description: string; fields: Field[]; defaults?: Record<string, string> }) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [form, setForm] = useState<Record<string, string>>(defaults);
  const [message, setMessage] = useState("Loading...");
  const [saving, setSaving] = useState(false);
  const businessId = useMemo(() => getBusinessId(), []);

  const load = useCallback(async () => {
    const result = await readApi<{ data: Array<Record<string, unknown>> }>(`${apiPath}?business_id=${encodeURIComponent(businessId)}`);
    if (result.ok) {
      setRows(result.data.data);
      setMessage(result.data.data.length ? "" : "No records yet.");
    } else {
      setMessage(result.message);
    }
  }, [apiPath, businessId]);

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
    const result = await writeApi(apiPath, "POST", payload);
    setSaving(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setForm(defaults);
    setMessage("Saved.");
    await load();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
      <Panel title={title}>
        <p className="mb-4 text-sm leading-6 text-neutral-600">{description}</p>
        {message ? <p className="mb-4 rounded border border-neutral-200 p-3 text-sm text-neutral-600">{message}</p> : null}
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