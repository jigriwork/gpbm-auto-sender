import { demoAgents, demoBillingSources, demoParserProfiles, demoStores } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";

export default function StoresPage() {
  return (
    <AppShell title="Stores" eyebrow="Store layer">
      <div className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
        <Panel title="Stores">
          <div className="grid gap-3">
            {demoStores.map((store) => {
              const source = demoBillingSources.find((item) => item.store_id === store.id);
              const parser = demoParserProfiles.find((item) => item.store_id === store.id) ?? demoParserProfiles[0];
              const agent = demoAgents.find((item) => item.store_id === store.id);
              return (
                <div key={store.id} className="rounded border border-neutral-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">{store.name}</h2>
                      <p className="mt-1 text-sm text-neutral-500">Code: {store.name === "Go Planet" ? "GP" : "BM"}</p>
                    </div>
                    <StatusPill>{store.status}</StatusPill>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-neutral-600 sm:grid-cols-3">
                    <span>Billing source: {source?.name ?? "Not set"}</span>
                    <span>Parser: {parser?.name ?? "Not set"}</span>
                    <span>Agent: {agent?.status ?? "not installed"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Add or edit store">
          <div className="grid gap-3">
            <input className="h-10 rounded border border-neutral-300 bg-white px-3 text-sm" placeholder="Store name" />
            <input className="h-10 rounded border border-neutral-300 bg-white px-3 text-sm" placeholder="Store code" />
            <select className="h-10 rounded border border-neutral-300 bg-white px-3 text-sm" defaultValue="active">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <p className="text-sm leading-6 text-neutral-600">Store creation and editing will connect once store management APIs are exposed. Billing source, parser profile, and agent assignment stay tenant-scoped.</p>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
