import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Loader2,
  X
} from "lucide-react";

export function Panel({ children, title, action, description }: { children: React.ReactNode; title?: string; action?: React.ReactNode; description?: string }) {
  return (
    <section className="private-card p-4 sm:p-5">
      {title ? <SectionHeader title={title} description={description} action={action} /> : null}
      {children}
    </section>
  );
}

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 border-b border-neutral-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-base font-semibold text-black">{title}</h2>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-600">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="private-topbar">
      <div>
        {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold leading-tight text-black sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "muted" }) {
  return <StatusBadge tone={tone}>{children}</StatusBadge>;
}

export function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "muted" }) {
  const toneClass = {
    neutral: "border-neutral-300 bg-white text-neutral-800",
    success: "border-neutral-900 bg-neutral-950 text-white",
    warning: "border-neutral-300 bg-neutral-100 text-neutral-950",
    danger: "border-black bg-white text-black ring-1 ring-black/10",
    muted: "border-neutral-200 bg-neutral-50 text-neutral-600"
  }[tone];
  return <span className={`inline-flex items-center rounded border px-2.5 py-1 text-xs font-semibold leading-none ${toneClass}`}>{children}</span>;
}

export function MetricCard({ label, value, detail, trend }: { label: string; value: React.ReactNode; detail?: string; trend?: string }) {
  return (
    <section className="private-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        {trend ? <StatusBadge tone="muted">{trend}</StatusBadge> : null}
      </div>
      <p className="mt-3 text-3xl font-semibold text-black">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-6 text-neutral-600">{detail}</p> : null}
    </section>
  );
}

export function InsightCard({ title, detail, icon, badge }: { title: string; detail: string; icon?: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <article className="private-card-compact p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {icon ? <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-neutral-100">{icon}</span> : null}
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-neutral-600">{detail}</p>
          </div>
        </div>
        {badge}
      </div>
    </article>
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
    <div className="private-soft-panel mb-5 flex items-start gap-3 p-4">
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
    <div className="private-soft-panel mb-5 flex items-start gap-3 p-4">
      <AlertCircle className="mt-0.5" size={18} />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm text-neutral-600">{detail}</p>
      </div>
    </div>
  );
}

export function EmptyState({ title = "No records yet", detail, action }: { title?: string; detail: string; action?: React.ReactNode }) {
  return (
    <div className="private-soft-panel p-5 text-sm text-neutral-600">
      <p className="font-semibold text-black">{title}</p>
      <p className="mt-1 leading-6">{detail}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function AlertBanner({ title, detail, tone = "neutral" }: { title: string; detail: string; tone?: "neutral" | "warning" | "danger" }) {
  const toneClass = tone === "danger" ? "border-black bg-white" : tone === "warning" ? "border-neutral-300 bg-neutral-100" : "border-neutral-200 bg-white";
  return (
    <div className={`rounded border p-4 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6 text-neutral-600">{detail}</p>
        </div>
      </div>
    </div>
  );
}

export function Button({ children, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const variantClass = variant === "primary" ? "private-button" : variant === "secondary" ? "private-button private-button-secondary" : "private-button private-button-ghost";
  return <button {...props} className={`${variantClass} private-focus-ring ${props.className ?? ""}`}>{children}</button>;
}

export function CTAButton({ children, href, variant = "primary" }: { children: React.ReactNode; href: string; variant?: "primary" | "secondary" }) {
  return <a href={href} className={`${variant === "primary" ? "private-button" : "private-button private-button-secondary"} private-focus-ring`}>{children}</a>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`private-input private-focus-ring text-sm ${props.className ?? ""}`} />;
}

export function TextareaInput(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`private-input private-focus-ring min-h-24 py-3 text-sm ${props.className ?? ""}`} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`private-input private-focus-ring text-sm ${props.className ?? ""}`} />;
}

export function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="hidden overflow-x-auto lg:block">
      <table className="private-table min-w-[980px]">
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function MobileDataCard({ title, subtitle, rows, footer }: { title: string; subtitle?: string; rows: Array<[string, React.ReactNode]>; footer?: React.ReactNode }) {
  return (
    <article className="private-card-compact p-4 lg:hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-neutral-500">{subtitle}</p> : null}
        </div>
      </div>
      <div className="mt-3 grid gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-neutral-500">{label}</span>
            <span className="text-right font-medium">{value}</span>
          </div>
        ))}
      </div>
      {footer ? <div className="mt-4 border-t border-neutral-200 pt-3">{footer}</div> : null}
    </article>
  );
}

export function FilterBar({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="private-card p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">{children}</div>
      {action ? <div className="mt-4 flex justify-end">{action}</div> : null}
    </div>
  );
}

export function FormCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Panel title={title} description={description}>
      <div className="grid gap-4">{children}</div>
    </Panel>
  );
}

export function Drawer({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid bg-black/40 p-3 sm:place-items-end sm:p-0">
      <button aria-label="Close drawer" className="absolute inset-0 cursor-default" type="button" onClick={onClose} />
      <section className="relative ml-auto h-full w-full max-w-xl overflow-y-auto rounded bg-white p-5 shadow-2xl sm:rounded-none">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-neutral-200 pb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button aria-label="Close" className="grid h-10 w-10 place-items-center rounded border border-neutral-300" type="button" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
      <section className="w-full max-w-2xl rounded bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-neutral-200 pb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button aria-label="Close" className="grid h-10 w-10 place-items-center rounded border border-neutral-300" type="button" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function ConfirmDialog({ open, title, detail, confirmLabel = "Confirm", onConfirm, onClose }: { open: boolean; title: string; detail: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm leading-6 text-neutral-600">{detail}</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="button" onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: Array<{ value: string; label: string; count?: number }>; active: string; onChange: (value: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-neutral-200 pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`shrink-0 rounded border px-3 py-2 text-sm font-semibold ${active === tab.value ? "border-black bg-black text-white" : "border-neutral-300 bg-white text-black"}`}
        >
          {tab.label}{tab.count !== undefined ? ` ${tab.count}` : ""}
        </button>
      ))}
    </div>
  );
}

export function ProgressChecklist({ items }: { items: Array<{ label: string; done: boolean; detail?: string }> }) {
  const done = items.filter((item) => item.done).length;
  const pct = Math.round((done / Math.max(items.length, 1)) * 100);
  return (
    <div className="private-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">Setup progress</p>
        <StatusBadge>{pct}%</StatusBadge>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded bg-neutral-200">
        <div className="h-full bg-black" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-3 text-sm">
            {item.done ? <CheckCircle2 className="mt-0.5 shrink-0" size={16} /> : <Clock3 className="mt-0.5 shrink-0 text-neutral-500" size={16} />}
            <div>
              <p className="font-medium">{item.label}</p>
              {item.detail ? <p className="text-xs leading-5 text-neutral-500">{item.detail}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Timeline({ items }: { items: Array<{ title: string; detail: string; status?: string }> }) {
  return (
    <div className="grid gap-0">
      {items.map((item, index) => (
        <div key={item.title} className="grid grid-cols-[28px_1fr] gap-3">
          <div className="grid justify-items-center">
            <span className="mt-1 grid h-7 w-7 place-items-center rounded-full border border-neutral-300 bg-white text-xs font-semibold">{index + 1}</span>
            {index < items.length - 1 ? <span className="h-full w-px bg-neutral-200" /> : null}
          </div>
          <div className="pb-5">
            <div className="private-card-compact p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{item.detail}</p>
                </div>
                {item.status ? <StatusBadge tone="muted">{item.status}</StatusBadge> : null}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SetupStepCard({ index, title, detail, status, action, required = true }: { index: number; title: string; detail: string; status: string; action?: React.ReactNode; required?: boolean }) {
  const done = ["done", "ready", "complete", "configured"].includes(status.toLowerCase());
  return (
    <Panel>
      <div className="flex items-start gap-4">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded text-sm font-semibold ${done ? "bg-black text-white" : "border border-neutral-300 bg-white text-black"}`}>{index}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{title}</h2>
            <StatusBadge tone={done ? "success" : "warning"}>{status}</StatusBadge>
            <StatusBadge tone="muted">{required ? "required" : "optional"}</StatusBadge>
          </div>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{detail}</p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </Panel>
  );
}

export function AgentHealthBadge({ online }: { online: boolean }) {
  return <StatusBadge tone={online ? "success" : "warning"}>{online ? "agent online" : "agent offline"}</StatusBadge>;
}

export function ProviderBadge({ configured }: { configured: boolean }) {
  return <StatusBadge tone={configured ? "success" : "warning"}>{configured ? "provider configured" : "provider pending"}</StatusBadge>;
}

export function StoreBadge({ name }: { name: string }) {
  return <StatusBadge>{name}</StatusBadge>;
}

export function OneTimeTokenCard({ token, onHide }: { token: string; onHide: () => void }) {
  return (
    <div className="mb-4 rounded border border-black bg-white p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 size={18} />
        <div>
          <p className="font-semibold">One-time agent token</p>
          <p className="mt-1 text-sm text-neutral-600">Copy now. This token will not be shown again after refresh.</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <code className="overflow-x-auto rounded border border-neutral-300 bg-neutral-50 p-3 text-xs">{token}</code>
        <Button type="button" onClick={() => void navigator.clipboard?.writeText(token)}><Copy size={15} /> Copy</Button>
      </div>
      <button className="mt-3 text-sm font-semibold" type="button" onClick={onHide}>Hide token</button>
    </div>
  );
}

export function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} className="inline-flex items-center gap-2 text-sm font-semibold">{children} <ChevronRight size={15} /></a>;
}

export function ArrowCTA({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-2">{children} <ArrowRight size={16} /></span>;
}
