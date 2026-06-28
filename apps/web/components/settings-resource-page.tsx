"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, RotateCw } from "lucide-react";
import { useBusinessContext } from "../lib/business-context";
import { readApi, withBusinessId, writeApi } from "../lib/client-data";
import {
  AlertBanner,
  Button,
  EmptyState,
  MobileDataCard,
  Modal,
  OneTimeTokenCard,
  Panel,
  StatusBadge,
  TextInput,
  TextareaInput
} from "./ui";

type Field = { name: string; label: string; placeholder?: string; type?: "text" | "json" | "textarea"; required?: boolean; help?: string };

export function SettingsResourcePage({
  apiPath,
  title,
  description,
  fields,
  defaults = {},
  concept,
  guidance = []
}: {
  apiPath: string;
  title: string;
  description: string;
  fields: Field[];
  defaults?: Record<string, string>;
  concept?: string;
  guidance?: string[];
}) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [form, setForm] = useState<Record<string, string>>(defaults);
  const [message, setMessage] = useState("Loading...");
  const [saving, setSaving] = useState(false);
  const [oneTimeToken, setOneTimeToken] = useState("");
  const [rotatingId, setRotatingId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
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
      setMessage(result.data.data.length ? "" : "No live records yet.");
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
    setModalOpen(false);
    setMessage("Saved. Live list refreshed.");
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
    <div className="grid gap-5 xl:grid-cols-[1fr_0.72fr]">
      <Panel
        title={title}
        description={description}
        action={<Button type="button" onClick={() => setModalOpen(true)}><Plus size={16} /> Create</Button>}
      >
        <div className="mb-4 grid gap-3">
          {concept ? <AlertBanner title="How this works" detail={concept} /> : null}
          {message ? <p className="rounded border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">{message}</p> : null}
          {oneTimeToken ? <OneTimeTokenCard token={oneTimeToken} onHide={() => setOneTimeToken("")} /> : null}
        </div>

        <div className="hidden gap-3 lg:grid">
          {rows.length ? rows.map((row) => <ResourceRow key={String(row.id)} row={row} isAgents={isAgents} rotatingId={rotatingId} onRotate={rotateToken} />) : <EmptyState detail="Create the first live record for this business. Demo examples are not treated as real records here." />}
        </div>
        <div className="grid gap-3 lg:hidden">
          {rows.length ? rows.map((row) => (
            <MobileDataCard
              key={String(row.id)}
              title={String(row.name ?? row.template_name ?? row.device_code ?? row.id)}
              subtitle={String(row.code ?? row.source_type ?? row.parser_key ?? row.provider_key ?? row.store_id ?? "Tenant scoped")}
              rows={[
                ["Status", <StatusBadge key="status">{String(row.status ?? "active")}</StatusBadge>],
                ["ID", String(row.id ?? "Pending")]
              ]}
              footer={isAgents ? <Button variant="secondary" type="button" disabled={rotatingId === String(row.id)} onClick={() => rotateToken(row)}>{rotatingId === String(row.id) ? "Rotating" : "Rotate token"}</Button> : null}
            />
          )) : <EmptyState detail="Create the first live record for this business." />}
        </div>
      </Panel>

      <Panel title="Setup guidance" description="These notes keep the UI honest about what is live and what still needs backend or sample data.">
        <div className="grid gap-3">
          <div className="private-soft-panel p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Business</p>
            <p className="mt-2 font-semibold">{business.selectedBusiness?.name ?? "Not selected"}</p>
            <p className="mt-1 text-sm text-neutral-600">Writes require owner/admin membership or super admin.</p>
          </div>
          {guidance.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded border border-neutral-200 bg-white p-3 text-sm">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-black" />
              <span className="leading-6 text-neutral-700">{item}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Modal open={modalOpen} title={`Create ${title.toLowerCase()}`} onClose={() => setModalOpen(false)}>
        <form onSubmit={submit} className="grid gap-4">
          {fields.map((field) => (
            <label key={field.name} className="grid gap-1 text-sm font-medium">
              <span>{field.label}</span>
              {field.type === "textarea" ? (
                <TextareaInput value={form[field.name] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} placeholder={field.placeholder} required={field.required} />
              ) : (
                <TextInput value={form[field.name] ?? ""} onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))} placeholder={field.placeholder} required={field.required} />
              )}
              {field.help ? <span className="text-xs leading-5 text-neutral-500">{field.help}</span> : null}
            </label>
          ))}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button disabled={saving}>{saving ? "Saving..." : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ResourceRow({ row, isAgents, rotatingId, onRotate }: { row: Record<string, unknown>; isAgents: boolean; rotatingId: string; onRotate: (row: Record<string, unknown>) => void }) {
  return (
    <div className="private-card-compact grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold">{String(row.name ?? row.template_name ?? row.device_code ?? row.id)}</h2>
          <StatusBadge>{String(row.status ?? "active")}</StatusBadge>
        </div>
        <p className="mt-1 text-sm text-neutral-500">{String(row.code ?? row.source_type ?? row.parser_key ?? row.provider_key ?? row.store_id ?? "Tenant scoped")}</p>
        <p className="mt-3 text-xs text-neutral-500">ID: {String(row.id)}</p>
      </div>
      {isAgents ? (
        <Button variant="secondary" type="button" disabled={rotatingId === String(row.id)} onClick={() => onRotate(row)}>
          <RotateCw size={15} /> {rotatingId === String(row.id) ? "Rotating" : "Rotate token"}
        </Button>
      ) : null}
    </div>
  );
}
