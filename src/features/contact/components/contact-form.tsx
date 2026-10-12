"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetTurnstile, TurnstileWidget } from "@/features/contact/components/turnstile-widget";
import { submitInquiry } from "@/features/inquiries/actions";
import { inquirySchema, toFieldErrors, type InquiryField, type InquiryFieldError, type InquiryFieldErrors } from "@/features/inquiries/schema";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type ContactFormProps = Readonly<{
  copy: Dictionary["contact"];
  locale: Locale;
  /** Display only: the server resolves the real product from the slug. */
  productName?: string;
  productSlug?: string;
  turnstileSiteKey?: string;
}>;

export function ContactForm({ copy, locale, productName, productSlug, turnstileSiteKey }: ContactFormProps) {
  const [errors, setErrors] = useState<InquiryFieldErrors>({});
  const [notice, setNotice] = useState<{ message: string; success: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const messages: Record<InquiryFieldError, (field: InquiryField) => string> = {
    invalid: (field) => (field === "phone" ? copy.invalidPhone : copy.invalidEmail),
    long: () => copy.tooLong,
    required: () => copy.required,
    short: () => copy.tooShort,
  };
  const message = (field: InquiryField) => (errors[field] ? messages[errors[field]](field) : undefined);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    // Instant feedback only; the server action validates again and is the authority.
    const local = inquirySchema.safeParse({ ...Object.fromEntries(formData), locale, product: productSlug });
    if (!local.success) { setErrors(toFieldErrors(local.error)); setNotice(null); return; }
    formData.set("locale", locale);
    if (productSlug) formData.set("product", productSlug);
    setErrors({});
    setNotice(null);
    startTransition(async () => {
      let result: Awaited<ReturnType<typeof submitInquiry>>;
      try {
        result = await submitInquiry(formData);
      } catch {
        result = { status: "error", code: "unavailable" };
      }
      if (result.status === "ok") { form.reset(); setNotice({ message: copy.success, success: true }); }
      else if (result.status === "invalid") setErrors(result.fieldErrors);
      else if (result.status === "rate_limited") setNotice({ message: copy.rateLimited, success: false });
      else setNotice({ message: result.code === "captcha" ? copy.captchaFailed : copy.unavailable, success: false });
      if (result.status !== "ok" || turnstileSiteKey) resetTurnstile();
    });
  }

  return <form className="contact-form" noValidate onSubmit={submit}>
    {productName ? <p className="text-sm text-ink-muted"><span className="type-eyebrow">{copy.productLabel}</span><br />{productName}</p> : null}
    <Input autoComplete="name" error={message("name")} label={copy.name} name="name" required />
    <Input autoComplete="email" error={message("email")} label={copy.email} name="email" required type="email" />
    <Input autoComplete="tel" error={message("phone")} inputMode="tel" label={`${copy.phone} (${copy.phoneOptional})`} name="phone" type="tel" />
    <div><label className="type-eyebrow mb-2 block text-ink-muted" htmlFor="message">{copy.message}</label><textarea aria-describedby={errors.message ? "message-error" : undefined} aria-invalid={Boolean(errors.message)} id="message" name="message" required rows={7} />{errors.message ? <p className="mt-2 text-xs text-danger" id="message-error">{message("message")}</p> : null}</div>
    <div aria-hidden="true" className="sr-only"><label>Website<input autoComplete="off" name="website" tabIndex={-1} type="text" /></label></div>
    {turnstileSiteKey ? <TurnstileWidget siteKey={turnstileSiteKey} /> : null}
    <Button disabled={pending} type="submit">{pending ? copy.sending : copy.submit}</Button>
    <p aria-live="polite" className={notice?.success ? "text-sm text-accent" : "text-sm text-warning"} role="status">{notice?.message}</p>
    <p className="text-xs text-ink-subtle">{copy.privacyNote}</p>
  </form>;
}
