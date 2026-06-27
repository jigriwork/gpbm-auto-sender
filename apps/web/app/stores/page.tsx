import { demoStores } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";

export default function StoresPage() {
  return (
    <AppShell title="Stores" eyebrow="Store layer">
      <div className="grid gap-4 sm:grid-cols-2">
        {demoStores.map((store) => (
          <Panel key={store.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">{store.name}</h2>
                <p className="mt-1 text-sm text-neutral-500">{store.id}</p>
              </div>
              <StatusPill>{store.status}</StatusPill>
            </div>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
