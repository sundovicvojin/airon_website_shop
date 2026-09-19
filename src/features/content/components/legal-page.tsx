import { EditorialPage } from "@/features/content/components/editorial-page";
import type { Dictionary } from "@/i18n/dictionaries";

// DRAFT — LEGAL REVIEW REQUIRED BEFORE PRODUCTION

type LegalPageProps = Readonly<{ copy: Dictionary["legal"][keyof Dictionary["legal"]]; draftNotice: string }>;

export function LegalPage({ copy, draftNotice }: LegalPageProps) {
  return <EditorialPage aside={<p className="type-eyebrow text-warning">{draftNotice}</p>} blocks={copy.blocks} eyebrow={copy.eyebrow} intro={copy.intro} title={copy.title} />;
}
