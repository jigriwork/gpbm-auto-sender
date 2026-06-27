import { demoProviders } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";

const providers = ["MSG91", "Custom API", "Interakt", "WATI", "AiSensy", "Gupshup", "Zoko"];

export default function WhatsAppProvidersPage() {
  return (
    <AppShell title="WhatsApp Providers" eyebrow="Provider layer">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {providers.map((provider) => {
          const active = demoProviders.some((item) => item.display_name === provider);
          return (
            <Panel key={provider}>
              <h2 className="font-semibold">{provider}</h2>
              <p className="mt-2 text-sm text-neutral-500">{active ? "Demo selected provider. Credentials stay server-side." : "Coming soon adapter slot."}</p>
              <p className="mt-4"><StatusPill>{active ? "test mode" : "placeholder"}</StatusPill></p>
            </Panel>
          );
        })}
      </div>
    </AppShell>
  );
}
