import { demoParserProfiles } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";

export default function ParserProfilesPage() {
  return (
    <AppShell title="Parser Profiles" eyebrow="PDF extraction">
      <div className="grid gap-4 xl:grid-cols-2">
        {demoParserProfiles.map((profile) => (
          <Panel key={profile.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{profile.name}</h2>
                <p className="mt-1 text-sm text-neutral-500">{profile.source_type}</p>
              </div>
              <StatusPill>{profile.status}</StatusPill>
            </div>
            <p className="mt-4 text-sm text-neutral-600">Required: {profile.required_fields.join(", ")}</p>
            <p className="mt-2 text-sm text-neutral-600">Confidence threshold: {profile.confidence_threshold}</p>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
