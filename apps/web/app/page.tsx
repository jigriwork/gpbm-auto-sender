import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FileText, Radio, ReceiptText, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "GPBM Auto Sender | Automatic WhatsApp Bill Sender",
  description: "Automatically send bill PDFs to customers on WhatsApp without billing software integration. Works with any billing software that saves PDF bills."
};

const features = [
  ["Folder watcher", "Watches the folder your billing counter already uses."],
  ["PDF extraction", "Reads mobile, bill number, date, amount, and customer details."],
  ["Provider choice", "Use MSG91, Custom API, or future WhatsApp providers."],
  ["Live dashboard", "Track sent, failed, duplicate, invalid, and retry bills."],
  ["Duplicate guard", "Blocks repeat bills before customers receive duplicates."],
  ["Retry queue", "Keeps failed sends visible until staff resolves them."]
];

const steps = ["Save PDF", "Auto-detect", "Extract mobile", "Send WhatsApp", "Track status"];
const software = ["Generic PDF Folder Watcher", "Logic", "Marg", "Tally", "Custom PDF"];
const providers = ["MSG91", "Custom API", "Interakt soon", "WATI soon", "AiSensy soon", "Gupshup soon", "Zoko soon"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] text-black">
      <header className="sticky top-0 z-30 border-b border-neutral-300 bg-[#f7f7f4]/95 px-4 backdrop-blur sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded bg-black text-sm font-black text-white">GA</span>
            <span>
              <span className="block text-sm font-semibold">GPBM Auto Sender</span>
              <span className="hidden text-xs text-neutral-500 sm:block">Automatic WhatsApp bill sender</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-neutral-700 lg:flex">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="private-button private-button-secondary">Login</Link>
            <a href="#how" className="private-button hidden sm:inline-flex">View demo</a>
          </div>
        </div>
      </header>

      <section className="px-4 pb-12 pt-10 sm:px-6 lg:px-10 lg:pb-20 lg:pt-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-neutral-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-neutral-600">Built for Indian retail counters</div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.01] sm:text-6xl lg:text-7xl">Send every bill on WhatsApp automatically.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-700">
              No billing software integration needed. If your billing software can save a PDF, GPBM Auto Sender can send it to your customer.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="private-button h-12 px-6">Login</Link>
              <a href="#how" className="private-button private-button-secondary h-12 px-6">See how it works <ArrowRight size={16} /></a>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-neutral-700 sm:grid-cols-3">
              <Proof label="No API dependency" value="PDF-first" />
              <Proof label="Counter friendly" value="No manual entry" />
              <Proof label="SaaS ready" value="Multi-store" />
            </div>
          </div>
          <ProductVisual />
        </div>
      </section>

      <section className="border-y border-neutral-300 bg-black px-4 py-8 text-white sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {[
            ["Integration cost", "Billing software APIs are expensive and slow to arrange."],
            ["Counter mistakes", "Cashiers should not manually forward every bill."],
            ["Customer habit", "Customers expect bills on WhatsApp."],
            ["Owner control", "Every failed, duplicate, and retry bill must be visible."]
          ].map(([title, detail]) => (
            <article key={title} className="rounded border border-neutral-800 bg-neutral-950 p-5">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-400">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <Section id="features" eyebrow="Solution" title="A practical automation layer around your existing bill PDF.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map(([title, text]) => <FeatureCard key={title} title={title} text={text} />)}
        </div>
      </Section>

      <Section id="how" eyebrow="How it works" title="From saved bill PDF to customer WhatsApp in five steps.">
        <div className="grid gap-3 lg:grid-cols-5">
          {steps.map((step, index) => (
            <article key={step} className="private-card p-5">
              <span className="grid h-10 w-10 place-items-center rounded bg-black text-sm font-semibold text-white">{index + 1}</span>
              <h3 className="mt-5 font-semibold">{step}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{["Billing software saves PDF.", "Agent watches the folder.", "PDF fields are read.", "Provider sends bill PDF.", "Dashboard records status."][index]}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Compatibility" title="Not locked to one software or one WhatsApp provider.">
        <div className="grid gap-5 lg:grid-cols-2">
          <InfoPanel title="Billing software">
            <PillGrid items={software} />
            <p className="mt-5 text-sm leading-6 text-neutral-600">Any billing software that can save PDF bills can fit the workflow. Parser profiles can be added per format.</p>
          </InfoPanel>
          <InfoPanel title="WhatsApp providers">
            <PillGrid items={providers} />
            <p className="mt-5 text-sm leading-6 text-neutral-600">Provider credentials stay server-side and are scoped per business.</p>
          </InfoPanel>
        </div>
      </Section>

      <Section eyebrow="Multi-store SaaS" title="Designed for GPBM today and future businesses tomorrow.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {["Businesses", "Stores", "Store-wise dashboard", "Provider credentials", "Super admin"].map((item) => (
            <article key={item} className="private-card p-5">
              <ShieldCheck size={20} />
              <p className="mt-4 font-semibold">{item}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="pricing" eyebrow="Pricing" title="Starter, Growth, and Scale plans can be configured later.">
        <div className="grid gap-4 md:grid-cols-3">
          {["Starter", "Growth", "Scale"].map((plan) => (
            <article key={plan} className="private-card p-6">
              <p className="text-xl font-semibold">{plan}</p>
              <p className="mt-4 text-sm leading-6 text-neutral-600">For retail teams moving bill delivery from manual work to automatic WhatsApp tracking.</p>
              <p className="mt-6 rounded border border-neutral-200 bg-neutral-50 p-3 text-sm font-semibold">Pricing can be configured later.</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="faq" eyebrow="FAQ" title="Clear answers before setup.">
        <div className="grid gap-3 lg:grid-cols-2">
          {[
            ["Does this need billing software API?", "No. The core flow works from PDF bills saved in a folder."],
            ["Will cashier manually enter number?", "No. Customer details are read from the bill PDF."],
            ["Can it work with Logic, Marg, or Tally?", "Yes, if the software can save PDF bills."],
            ["Can I use my own provider?", "Yes. Provider selection is part of the platform."],
            ["What happens if internet fails?", "Failed and retrying records stay visible in the dashboard."],
            ["Will duplicate bills be sent twice?", "Duplicate protection is part of the bill workflow."]
          ].map(([q, a]) => (
            <article key={q} className="private-card p-5">
              <h3 className="font-semibold">{q}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{a}</p>
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
    <section id={id} className="px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">{eyebrow}</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">{title}</h2>
        <div className="mt-9">{children}</div>
      </div>
    </section>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="private-card p-6">
      <CheckCircle2 size={20} />
      <h3 className="mt-5 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p>
    </article>
  );
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="private-card p-6">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </article>
  );
}

function PillGrid({ items }: { items: string[] }) {
  return <div className="mt-4 flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold">{item}</span>)}</div>;
}

function Proof({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-neutral-300 bg-white p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function ProductVisual() {
  return (
    <div className="private-card overflow-hidden bg-white">
      <div className="border-b border-neutral-200 bg-black p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Live bill command center</p>
            <p className="mt-1 text-xs text-neutral-400">PDF folder watcher to WhatsApp delivery</p>
          </div>
          <span className="rounded border border-neutral-700 px-3 py-1 text-xs font-semibold">Agent online</span>
        </div>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="grid gap-3">
          {[
            [FileText, "Bill detected", "GP-1048.pdf saved in billing folder"],
            [Clock3, "WhatsApp queued", "Mobile and bill details extracted"],
            [ReceiptText, "Sent", "Customer received PDF bill"],
            [Radio, "Dashboard updated", "Sent, failed, duplicates tracked"]
          ].map(([Icon, title, detail]) => {
            const VisualIcon = Icon as typeof FileText;
            return (
              <div key={String(title)} className="private-card-compact flex items-start gap-3 p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-neutral-100"><VisualIcon size={18} /></span>
                <div>
                  <p className="font-semibold">{String(title)}</p>
                  <p className="mt-1 text-sm text-neutral-600">{String(detail)}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid gap-3">
          {[["Sent today", "128"], ["Failed", "4"], ["Retry queue", "11"], ["Duplicates", "7"]].map(([label, value]) => (
            <div key={label} className="rounded border border-neutral-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
