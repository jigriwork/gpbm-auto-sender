import { AppShell } from "../../components/nav";
import { SettingsResourcePage } from "../../components/settings-resource-page";

export default function StoresPage() {
  return (
    <AppShell title="Stores" eyebrow="Store layer">
      <SettingsResourcePage apiPath="/api/stores" title="Stores" description="Tenant stores such as Go Planet and Brand Mark. Store records are business-scoped." fields={[
        { name: "name", label: "Store name", required: true },
        { name: "code", label: "Store code", placeholder: "GP" },
        { name: "status", label: "Status", placeholder: "active" }
      ]} defaults={{ status: "active" }} />
    </AppShell>
  );
}