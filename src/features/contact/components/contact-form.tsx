"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n/dictionaries";

type Fields = "name" | "email" | "subject" | "message";
type Errors = Partial<Record<Fields, string>>;

export function ContactForm({ copy }: Readonly<{ copy: Dictionary["contact"] }>) {
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState("");
  const schema = z.object({ name: z.string().trim().min(1, copy.required), email: z.email(copy.invalidEmail), subject: z.string().trim().min(1, copy.required), message: z.string().trim().min(1, copy.required) });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!result.success) {
      const next: Errors = {};
      for (const issue of result.error.issues) { const key = issue.path[0]; if (typeof key === "string" && ["name", "email", "subject", "message"].includes(key)) next[key as Fields] ??= issue.message; }
      setErrors(next); setNotice(""); return;
    }
    setErrors({}); setNotice(copy.disabled);
  }

  return <form className="contact-form" noValidate onSubmit={submit}>
    <Input error={errors.name} label={copy.name} name="name" required />
    <Input error={errors.email} label={copy.email} name="email" required type="email" />
    <Input error={errors.subject} label={copy.subject} name="subject" required />
    <div><label className="type-eyebrow mb-2 block text-ink-muted" htmlFor="message">{copy.message}</label><textarea aria-describedby={errors.message ? "message-error" : undefined} aria-invalid={Boolean(errors.message)} id="message" name="message" required rows={7} />{errors.message ? <p className="mt-2 text-xs text-danger" id="message-error">{errors.message}</p> : null}</div>
    <Button type="submit">{copy.submit}</Button><p aria-live="polite" className="text-sm text-warning">{notice}</p>
  </form>;
}
