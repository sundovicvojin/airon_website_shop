import { headers } from "next/headers";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default async function LocaleNotFound() { const requestHeaders = await headers(); const candidate = requestHeaders.get("x-airon-locale") ?? defaultLocale; const locale = isLocale(candidate) ? candidate : defaultLocale; const copy = await getDictionary(locale); return <main className="state-page"><Container size="copy"><p className="type-eyebrow text-accent">{copy.notFound.eyebrow}</p><h1>{copy.notFound.title}</h1><p>{copy.notFound.description}</p><ButtonLink href={`/${locale}`}>{copy.common.backHome}</ButtonLink></Container></main>; }
