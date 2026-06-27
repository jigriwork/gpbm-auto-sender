import { demoParserProfiles } from "../../lib/demo";
import { AppShell } from "../../components/nav";
import { Panel, StatusPill } from "../../components/ui";

const profileStatus: Record<string, string> = {
  generic_pdf_v1: "Needs sample PDFs",
  logic_pdf_v1: "Needs sample PDFs",
  gpbm_go_planet_demo: "Demo",
  gpbm_brand_mark_demo: "Demo"
};

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
              <StatusPill>{profileStatus[profile.name] ?? profile.status}</StatusPill>
            </div>
            <p className="mt-4 text-sm text-neutral-600">Required: {profile.required_fields.join(", ")}</p>
            <p className="mt-2 text-sm text-neutral-600">Confidence threshold: {profile.confidence_threshold}</p>
          </Panel>
        ))}
      </div>
      <p className="mt-5 rounded border border-neutral-300 bg-white p-4 text-sm leading-6 text-neutral-600">
        Real parser accuracy requires sample PDFs from each billing source and store. Parser implementation is intentionally not part of this UI task.
      </p>
    </AppShell>
  );
}
