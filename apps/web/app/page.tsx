import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  FolderSync,
  MessageSquare,
  Radio,
  ReceiptText,
  RotateCw,
  ShieldCheck,
  Store,
  Workflow
} from "lucide-react";

export const metadata: Metadata = {
  title: "GPBM Auto Sender | Automatic WhatsApp Bill Sender",
  description: "Send every bill on WhatsApp automatically, without changing your billing software."
};

const problems = [
  ["Integrations are expensive", "Billing software APIs can be slow, costly, and different for every store."],
  ["Manual sending is messy", "Cashiers should not search PDFs, copy numbers, and forward bills one by one."],
  ["Customers expect WhatsApp", "Retail customers want the bill where they already communicate."],
  ["Owners need proof", "Failed, duplicate, invalid, and retry bills must be tracked in one place."]
];

const solution = [
  [FolderSync, "Folder watcher", "Use the same PDF folder your billing counter already saves into."],
  [FileText, "PDF extraction", "Read customer name, mobile, bill number, date, and amount from the bill."],
  [MessageSquare, "Provider layer", "Start with MSG91 or Custom API, with other WhatsApp providers ready later."],
  [ShieldCheck, "Duplicate guard", "Block repeat bills using bill details, store, mobile, and PDF hash."],
  [RotateCw, "Retry queue", "Keep failed or offline sends visible until they are resolved."],
  [ReceiptText, "Bill dashboard", "Track sent, failed, invalid mobile, duplicate, queued, and retrying records."]
];

const how = [
  ["Billing software saves PDF", "Logic, Marg, Tally, or any tool saves the customer bill into a local folder."],
  ["Agent detects bill", "The local Windows agent watches incoming, sent, failed, and duplicate folders."],
  ["Fields are extracted", "Parser profiles pull name, mobile, amount, bill date, and bill number."],
  ["WhatsApp is queued", "The selected business provider sends the bill PDF through a template."],
  ["Dashboard tracks proof", "Owners see store-wise sent, failed, duplicate, retry, and agent status."]
];

const billingSources = ["Generic PDF Folder Watcher", "Logic profile", "Marg profile", "Tally profile", "Custom PDF profile", "Any software that saves PDF bills"];
const providers = ["MSG91", "Custom API", "Interakt coming soon", "WATI coming soon", "AiSensy coming soon", "Gupshup coming soon", "Zoko coming soon"];
const pricing = [
  ["Starter", "For one business getting the first store live.", "Bill tracking", "One provider", "Basic agent monitoring"],
  ["Growth", "For multi-store retail teams.", "Store-wise reports", "Retry operations", "Multiple agents"],
  ["Scale", "For SaaS rollout and larger operations.", "Super admin controls", "Provider flexibility", "Advanced audit readiness"],
  ["Enterprise", "For custom provider and deployment needs.", "Custom contracts", "Priority setup", "Security review"]
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] text-black">
      <header className="sticky top-0 z-40 border-b border-neutral-300 bg-[#f7f7f4]/95 px-4 backdrop-blur sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 py-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded bg-black text-sm font-black text-white">GA</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">GPBM Auto Sender</span>
              <span className="hidden text-xs text-neutral-500 sm:block">Automatic WhatsApp bill sender</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-neutral-700 lg:flex">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#providers">Providers</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/login" className="private-button private-button-secondary">Login</Link>
            <a href="#how" className="private-button hidden xl:inline-flex">See flow</a>
          </div>
        </div>
      </header>

      <section className="px-4 pb-12 pt-10 sm:px-6 lg:px-10 lg:pb-20 lg:pt-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-neutral-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-neutral-600">Built for Indian retail counters</div>
            <h1 className="mt-6 max-w-4xl break-words text-4xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">Send every bill on WhatsApp automatically.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-700">
              GPBM Auto Sender sends bill PDFs to customers without changing your billing software. If your counter can save a PDF, the local agent can watch it, read it, and queue WhatsApp delivery.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="private-button h-12 px-6">Login</Link>
              <a href="#how" className="private-button private-button-secondary h-12 px-6">See how it works <ArrowRight size={16} /></a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Proof label="No billing API dependency" value="PDF-first" />
              <Proof label="Counter friendly" value="No manual entry" />
              <Proof label="SaaS ready" value="Business scoped" />
            </div>
          </div>
          <div className="min-w-0">
            <ProductMockup />
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-300 bg-black px-4 py-10 text-white sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {problems.map(([title, detail]) => (
            <article key={title} className="rounded border border-neutral-800 bg-neutral-950 p-5">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-400">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <Section id="features" eyebrow="Solution" title="A practical automation layer around your existing bill PDFs.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {solution.map(([Icon, title, detail]) => {
            const VisualIcon = Icon as typeof FolderSync;
            return <FeatureCard key={String(title)} icon={<VisualIcon size={20} />} title={String(title)} text={String(detail)} />;
          })}
        </div>
      </Section>

      <Section id="how" eyebrow="How it works" title="From saved bill PDF to customer WhatsApp in five clear steps.">
        <div className="grid gap-4 lg:grid-cols-5">
          {how.map(([title, detail], index) => (
            <article key={title} className="private-card p-5">
              <span className="grid h-10 w-10 place-items-center rounded bg-black text-sm font-semibold text-white">{index + 1}</span>
              <h3 className="mt-5 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{detail}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Compatibility" title="Works with billing software and providers as configuration, not hardcoding.">
        <div className="grid gap-5 lg:grid-cols-2" id="providers">
          <InfoPanel title="Supported billing source types" description="Generic PDF Folder Watcher is first. Logic, Marg, Tally, and custom profiles can be added without changing the SaaS model.">
            <PillGrid items={billingSources} />
          </InfoPanel>
          <InfoPanel title="WhatsApp provider selection" description="MSG91 is the first implementation target. Other providers are represented as selectable adapter slots.">
            <PillGrid items={providers} />
          </InfoPanel>
        </div>
      </Section>

      <section className="border-y border-neutral-300 bg-white px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500">Multi-store SaaS</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl">GPBM first, not GPBM only.</h2>
            <p className="mt-5 text-sm leading-6 text-neutral-600">Every business owns its stores, providers, templates, parser profiles, agents, bill logs, and subscriptions. Go Planet and Brand Mark are seed examples, not product limits.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [Store, "Multi-store reporting"],
              [ShieldCheck, "Business-wise credentials"],
              [Workflow, "Configurable billing sources"],
              [Radio, "Store-linked agents"],
              [FileCheck2, "Parser profiles"],
              [ReceiptText, "Bill event history"]
            ].map(([Icon, label]) => {
              const VisualIcon = Icon as typeof Store;
              return (
                <article key={String(label)} className="private-card p-5">
                  <VisualIcon size={20} />
                  <p className="mt-4 font-semibold">{String(label)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Section id="pricing" eyebrow="Pricing" title="SaaS plans are prepared. Payment integration is intentionally not enabled yet.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pricing.map(([plan, detail, a, b, c]) => (
            <article key={plan} className="private-card p-6">
              <p className="text-xl font-semibold">{plan}</p>
              <p className="mt-3 min-h-12 text-sm leading-6 text-neutral-600">{detail}</p>
              <div className="mt-6 grid gap-2 text-sm">
                {[a, b, c].map((item) => <span key={item} className="flex items-center gap-2"><CheckCircle2 size={15} />{item}</span>)}
              </div>
              <p className="mt-6 rounded border border-neutral-200 bg-neutral-50 p-3 text-sm font-semibold">Pricing placeholder</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="faq" eyebrow="FAQ" title="Clear answers before setup.">
        <div className="grid gap-3 lg:grid-cols-2">
          {[
            ["Does this need billing software API?", "No. The first flow works from bill PDFs saved into a local folder."],
            ["Will cashier manually enter customer mobile?", "No. Customer name and mobile are expected inside the bill PDF and extracted automatically."],
            ["Can it work with Logic, Marg, or Tally?", "Yes, if the software can save bill PDFs. Each can use a parser/source profile."],
            ["Can the business choose WhatsApp provider?", "Yes. MSG91 and Custom API are first, with other adapters planned."],
            ["What if internet fails?", "The agent and dashboard are structured for retry queues and offline-safe handling."],
            ["Are secrets exposed in the browser?", "No. Provider credentials must remain server-side and redacted in the UI."]
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
          <p><span className="font-semibold text-black">GPBM Auto Sender</span> - Automatic WhatsApp bill delivery for retail teams.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/login" className="font-semibold text-black">Login</Link>
            <span>No service role keys or provider secrets in frontend.</span>
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
        <h2 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">{title}</h2>
        <div className="mt-9">{children}</div>
      </div>
    </section>
  );
}

function FeatureCard({ title, text, icon }: { title: string; text: string; icon: React.ReactNode }) {
  return (
    <article className="private-card p-6">
      <span className="grid h-10 w-10 place-items-center rounded bg-neutral-100">{icon}</span>
      <h3 className="mt-5 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p>
    </article>
  );
}

function InfoPanel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <article className="private-card p-6">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
      {children}
    </article>
  );
}

function PillGrid({ items }: { items: string[] }) {
  return <div className="mt-5 flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold">{item}</span>)}</div>;
}

function Proof({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-neutral-300 bg-white p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function ProductMockup() {
  const flow = [
    [FileText, "Bill detected", "GP-1048.pdf saved in billing folder"],
    [FileCheck2, "Customer mobile found", "Number extracted from PDF bill"],
    [Clock3, "WhatsApp queued", "Template and PDF URL prepared"],
    [MessageSquare, "Sent", "Customer received bill PDF"]
  ];
  return (
    <div className="private-card overflow-hidden bg-white">
      <div className="border-b border-neutral-200 bg-black p-4 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Live bill command center</p>
            <p className="mt-1 text-xs text-neutral-400">Folder watcher to WhatsApp delivery</p>
          </div>
          <span className="rounded border border-neutral-700 px-3 py-1 text-xs font-semibold">Agent online</span>
        </div>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_0.82fr]">
        <div className="grid gap-3">
          {flow.map(([Icon, title, detail]) => {
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
          {[["Sent today", "128"], ["Failed", "4"], ["Retry queue", "11"], ["Duplicates blocked", "7"]].map(([label, value]) => (
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
