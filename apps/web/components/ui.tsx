import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export function Panel({ children, title, action, description }: { children: React.ReactNode; title?: string; action?: React.ReactNode; description?: string }) {
  return (
    <section className="private-card p-4 sm:p-5">
      {title ? (
        <div className="mb-4 flex flex-col gap-3 border-b border-neutral-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-black">{title}</h2>
            {description ? <p className="mt-1 text-sm leading-6 text-neutral-600">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="private-topbar">
      <div>
        {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold leading-tight text-black sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const toneClass = {
    neutral: "border-neutral-300 bg-white text-neutral-700",
    success: "border-neutral-300 bg-neutral-950 text-white",
    warning: "border-neutral-300 bg-neutral-100 text-neutral-900",
    danger: "border-black bg-white text-black"
  }[tone];
  return <span className={`inline-flex items-center rounded border px-2 py-1 text-xs font-semibold ${toneClass}`}>{children}</span>;
}

export function MetricCard({ label, value, detail }: { label: string; value: React.ReactNode; detail?: string }) {
  return (
    <section className="private-card p-5">
      <p className="text-sm font-medium text-neutral-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-black">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-6 text-neutral-600">{detail}</p> : null}
    </section>
  );
}

export function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-200 py-3 last:border-b-0">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-right text-sm font-semibold text-black">{value}</span>
    </div>
  );
}

export function LoadingState({ title = "Loading", detail = "Reading live data from the backend." }: { title?: string; detail?: string }) {
  return (
    <div className="private-card mb-5 flex items-start gap-3 p-4">
      <Loader2 className="mt-0.5 animate-spin" size={18} />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-neutral-600">{detail}</p>
      </div>
    </div>
  );
}

export function ErrorState({ title = "Needs attention", detail }: { title?: string; detail: string }) {
  return (
    <div className="private-card mb-5 flex items-start gap-3 p-4">
      <AlertCircle className="mt-0.5" size={18} />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-neutral-600">{detail}</p>
      </div>
    </div>
  );
}

export function EmptyState({ title = "No records yet", detail }: { title?: string; detail: string }) {
  return (
    <div className="private-card-compact p-4 text-sm text-neutral-600">
      <p className="font-semibold text-black">{title}</p>
      <p className="mt-1 leading-6">{detail}</p>
    </div>
  );
}

export function Button({ children, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  return <button {...props} className={`${variant === "primary" ? "private-button" : "private-button private-button-secondary"} ${props.className ?? ""}`}>{children}</button>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`private-input text-sm ${props.className ?? ""}`} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`private-input text-sm ${props.className ?? ""}`} />;
}

export function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="private-table min-w-[900px]">
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function SetupStepCard({ index, title, detail, status }: { index: number; title: string; detail: string; status: string }) {
  return (
    <Panel>
      <div className="flex items-start gap-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-black text-sm font-semibold text-white">{index}</span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{title}</h2>
            <StatusPill>{status}</StatusPill>
          </div>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{detail}</p>
        </div>
      </div>
    </Panel>
  );
}

export function AgentHealthBadge({ online }: { online: boolean }) {
  return <StatusPill tone={online ? "success" : "warning"}>{online ? "agent online" : "agent offline"}</StatusPill>;
}

export function ProviderBadge({ configured }: { configured: boolean }) {
  return <StatusPill tone={configured ? "success" : "warning"}>{configured ? "provider configured" : "provider pending"}</StatusPill>;
}

export function StoreBadge({ name }: { name: string }) {
  return <StatusPill>{name}</StatusPill>;
}

export function OneTimeTokenCard({ token, onHide }: { token: string; onHide: () => void }) {
  return (
    <div className="mb-4 rounded border border-black bg-white p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 size={18} />
        <div>
          <p className="font-semibold">One-time agent token</p>
          <p className="mt-1 text-sm text-neutral-600">Copy now. This token will not be shown again.</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <code className="overflow-x-auto rounded border border-neutral-300 bg-neutral-50 p-3 text-xs">{token}</code>
        <Button type="button" onClick={() => void navigator.clipboard?.writeText(token)}>Copy</Button>
      </div>
      <button className="mt-3 text-sm font-semibold" type="button" onClick={onHide}>Hide token</button>
    </div>
  );
}
