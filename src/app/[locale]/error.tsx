"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { dictionary as en } from "@/i18n/locales/en";
import { dictionary as sr } from "@/i18n/locales/sr";

export default function LocaleError({ error, reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) { const params = useParams<{ locale: string }>(); const copy = params.locale === "sr" ? sr.error : en.error; return <main className="state-page"><Container size="copy"><p className="type-eyebrow text-danger">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.description}</p>{error.digest ? <code>{error.digest}</code> : null}<Button onClick={reset} type="button">{copy.retry}</Button></Container></main>; }
