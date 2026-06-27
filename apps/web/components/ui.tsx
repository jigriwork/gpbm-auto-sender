export function Panel({ children, title, action }: { children: React.ReactNode; title?: string; action?: React.ReactNode }) {
  return (
    <section className="rounded border border-neutral-300 bg-white p-4 shadow-sm sm:p-5">
      {title ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-black">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatusPill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-700">{children}</span>;
}

export function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-200 py-3 last:border-b-0">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-right text-sm font-medium text-black">{value}</span>
    </div>
  );
}
