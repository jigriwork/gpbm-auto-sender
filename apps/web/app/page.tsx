import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FileText, Radio, ReceiptText, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "GPBM Auto Sender | Automatic WhatsApp Bill Sender",
  description: "Automatically send bill PDFs to customers on WhatsApp without billing software integration. Works with any billing software that saves PDF bills."
};

const features = [
  ["Folder watcher agent", "A local agent watches the bill PDF folder your billing counter already uses."],
  ["PDF data extraction", "Reads customer name, mobile, bill number, date, and amount from saved bill PDFs."],
  ["Provider selection", "Use MSG91 first, Custom API, or future WhatsApp providers as they are added."],
  ["Dashboard tracking", "Track sent, failed, duplicate, invalid mobile, and retry bills from one place."],
  ["Duplicate protection", "Stops repeat sends for the same bill before they reach the customer."],
  ["Retry system", "Keeps failed or offline sends visible so staff can recover them cleanly."]
];

const steps = [
  ["Save bill PDF", "Your billing software exports or saves the customer bill as a PDF."],
  ["Auto-detect", "The local watcher sees the new file without cashier action."],
  ["Extract mobile", "The parser reads key bill fields from the PDF."],
  ["Send WhatsApp bill", "Your selected provider sends the PDF to the customer."],
  ["Track everything", "The dashboard records sent, failed, duplicate, and retry status."]
];

const software = ["Generic PDF Folder Watcher", "Logic", "Marg", "Tally", "Custom PDF"];
const providers = ["MSG91", "Custom API", "Interakt coming soon", "WATI coming soon", "AiSensy coming soon", "Gupshup coming soon", "Zoko coming soon"];
const metrics = [["Sent today", "128"], ["Failed bills", "4"], ["Duplicate blocked", "7"], ["Agent online", "2/2"], ["Retry queue", "11"]];

const faqs = [
  ["Does this need billing software API?", "No. The core flow works from PDF bills saved in a folder, so expensive billing software API integration is not required."],
  ["Will cashier manually enter number?", "No. The product is designed to avoid manual cashier entry by reading customer details from the bill PDF."],
  ["Can it work with Logic, Marg, or Tally?", "Yes, as long as the software can save PDF bills. Specific parser profiles can improve accuracy for each format."],
  ["Can I use my own WhatsApp API provider?", "Yes. Provider selection is part of the architecture. MSG91 and Custom API are first, with more providers planned."],
  ["What happens if internet fails?", "Failed or queued sends stay visible in the dashboard and can be retried when connectivity is back."],
  ["Will duplicate bills be sent twice?", "Duplicate protection is part of the bill workflow so repeat bill records can be blocked before sending."]
];

export default function Home() {
  return (
    <main className="bg-[#f7f7f4] text-black">
      <header className="sticky top-0 z-20 border-b border-neutral-300 bg-[#f7f7f4]/95 px-4 backdrop-blur sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded bg-black text-sm font-black text-white">GA</span>
            <span className="text-sm font-semibold sm:text-base">GPBM Auto Sender</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-700 md:flex">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="inline-flex h-10 items-center rounded border border-neutral-300 px-4 text-sm font-semibold">Login</Link>
            <a href="#how" className="hidden h-10 items-center rounded bg-black px-4 text-sm font-semibold text-white sm:inline-flex">See flow</a>
          </div>
        </div>
      </header>

      <section className="px-4 pb-10 pt-12 sm:px-6 lg:px-10 lg:pb-16 lg:pt-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">Retail bill automation</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] text-black sm:text-6xl lg:text-7xl">Send every bill on WhatsApp automatically.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-700">
              No billing software integration needed. If your billing software can save a PDF, GPBM Auto Sender can send it to your customer.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="inline-flex h-12 items-center justify-center rounded bg-black px-6 text-sm font-semibold text-white">Login</Link>
              <a href="#how" className="inline-flex h-12 items-center justify-center gap-2 rounded border border-neutral-300 px-6 text-sm font-semibold">
                See how it works <ArrowRight size={16} />
              </a>
            </div>
            <p className="mt-6 max-w-xl text-sm leading-6 text-neutral-600">Built for retail showrooms, garment stores, supermarkets, electronics stores, billing counters, and multi-store Indian retail businesses.</p>
          </div>
          <DashboardMock />
        </div>
      </section>

      <section className="border-y border-neutral-300 bg-white px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {[
            ["Integrations are expensive", "Traditional billing software APIs take time, money, and vendor support."],
            ["Cashiers are busy", "Manual bill sending at the counter creates delays and mistakes."],
            ["Customers expect WhatsApp", "PDF bills should reach customers where they already read messages."],
            ["Tracking matters", "Owners need proof of sent, failed, duplicate, and retry status."]
          ].map(([title, text]) => (
            <article key={title} className="rounded border border-neutral-200 p-4">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <Section id="features" eyebrow="Solution" title="Automation around the bill PDF you already create.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map(([title, text]) => (
            <article key={title} className="rounded border border-neutral-300 bg-white p-5 shadow-sm">
              <CheckCircle2 size={20} />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="how" eyebrow="How it works" title="From saved PDF to delivered WhatsApp bill.">
        <div className="grid gap-3 lg:grid-cols-5">
          {steps.map(([title, text], index) => (
            <article key={title} className="rounded border border-neutral-300 bg-white p-5">
              <span className="grid h-9 w-9 place-items-center rounded bg-black text-sm font-semibold text-white">{index + 1}</span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Compatibility" title="Works with any billing software that can save PDF bills.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Supported billing sources">
            <PillGrid items={software} />
            <p className="mt-5 text-sm leading-6 text-neutral-600">Start with Generic PDF Folder Watcher, then add software-specific profiles for Logic, Marg, Tally, or custom formats.</p>
          </Panel>
          <Panel title="Selectable WhatsApp providers">
            <PillGrid items={providers} />
            <p className="mt-5 text-sm leading-6 text-neutral-600">Provider credentials are kept server-side per business. MSG91 is first, but the platform is not locked to one provider.</p>
          </Panel>
        </div>
      </Section>

      <Section eyebrow="Multi-store SaaS" title="Built for one store today and many businesses tomorrow.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {["Multiple businesses", "Multiple stores", "Store-wise dashboard", "Separate provider credentials", "Super admin support"].map((item) => (
            <article key={item} className="rounded border border-neutral-300 bg-white p-5">
              <ShieldCheck size={20} />
              <h3 className="mt-4 font-semibold">{item}</h3>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Dashboard preview" title="Know what happened to every bill.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map(([label, value]) => (
            <article key={label} className="rounded border border-neutral-300 bg-white p-5">
              <p className="text-sm text-neutral-500">{label}</p>
              <p className="mt-3 text-3xl font-semibold">{value}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="pricing" eyebrow="Pricing" title="Simple plans for growing retail teams.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Starter", "For one or two stores testing automatic bill sending."],
            ["Growth", "For multi-store businesses that need more agents and volume."],
            ["Scale", "For larger retail operations with custom support needs."]
          ].map(([name, text]) => (
            <article key={name} className="rounded border border-neutral-300 bg-white p-6">
              <h3 className="text-xl font-semibold">{name}</h3>
              <p className="mt-4 text-sm leading-6 text-neutral-600">{text}</p>
              <p className="mt-6 rounded border border-neutral-200 p-3 text-sm font-semibold">Pricing can be configured later.</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="faq" eyebrow="FAQ" title="Practical answers before setup.">
        <div className="grid gap-3 lg:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <article key={question} className="rounded border border-neutral-300 bg-white p-5">
              <h3 className="font-semibold">{question}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{answer}</p>
            </article>
          ))}
        </div>
      </Section>

      <footer className="border-t border-neutral-300 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
          <p><span className="font-semibold text-black">GPBM Auto Sender</span> - Built for retail bill automation</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/login" className="font-semibold text-black">Login</Link>
            <span>Provider secrets stay server-side.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Section({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">{eyebrow}</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded border border-neutral-300 bg-white p-5 shadow-sm">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </article>
  );
}

function PillGrid({ items }: { items: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => <span key={item} className="rounded border border-neutral-300 px-3 py-2 text-sm font-medium">{item}</span>)}
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="rounded border border-neutral-300 bg-white p-4 shadow-xl sm:p-5">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <p className="text-sm font-semibold">Live bill flow</p>
          <p className="mt-1 text-xs text-neutral-500">Folder watcher to WhatsApp delivery</p>
        </div>
        <span className="rounded bg-black px-3 py-1 text-xs font-semibold text-white">Agent online</span>
      </div>
      <div className="mt-5 grid gap-3">
        {[
          [FileText, "Bill detected", "GP-1048.pdf saved in billing folder"],
          [Clock3, "WhatsApp queued", "Mobile and bill details extracted"],
          [ReceiptText, "Sent", "Customer received PDF bill"],
          [Radio, "Dashboard updated", "Sent today, retry queue, duplicates tracked"]
        ].map(([Icon, title, detail]) => {
          const VisualIcon = Icon as typeof FileText;
          return (
            <div key={String(title)} className="flex items-start gap-3 rounded border border-neutral-200 p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-neutral-100"><VisualIcon size={18} /></span>
              <div>
                <p className="font-semibold">{String(title)}</p>
                <p className="mt-1 text-sm text-neutral-600">{String(detail)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {["Sent", "Failed", "Retry"].map((label, index) => (
          <div key={label} className="rounded border border-neutral-200 p-3">
            <p className="text-xs text-neutral-500">{label}</p>
            <p className="mt-2 text-xl font-semibold">{[128, 4, 11][index]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
