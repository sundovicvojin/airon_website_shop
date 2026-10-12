"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = { render: (container: HTMLElement, options: { sitekey: string; theme?: "auto" | "dark" | "light" }) => string; remove: (widgetId: string) => void };
declare global {
  interface Window {
    turnstile?: TurnstileApi & { reset: (widgetId?: string) => void };
  }
}

const scriptSrc = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function resetTurnstile() {
  window.turnstile?.reset();
}

/** Renders the Cloudflare Turnstile widget; it adds the `cf-turnstile-response` field to the surrounding form itself. */
export function TurnstileWidget({ siteKey }: Readonly<{ siteKey: string }>) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let widgetId: string | undefined;
    let cancelled = false;
    const mount = () => {
      if (cancelled || !window.turnstile || widgetId) return;
      widgetId = window.turnstile.render(element, { sitekey: siteKey, theme: "dark" });
    };
    if (window.turnstile) mount();
    else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${scriptSrc}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = scriptSrc;
        script.async = true;
        document.head.append(script);
      }
      script.addEventListener("load", mount);
    }
    return () => {
      cancelled = true;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [siteKey]);

  return <div ref={container} />;
}
