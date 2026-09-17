"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";

type RevealProps = Readonly<{
  children: ReactNode;
  className?: string;
  delay?: number;
}>;

type RevealStyle = CSSProperties & {
  "--reveal-delay": string;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const style: RevealStyle = { "--reveal-delay": `${delay}ms` };

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.dataset.reveal = "visible";
      return;
    }

    element.dataset.reveal = "pending";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          element.dataset.reveal = "visible";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8%", threshold: 0.14 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={className} ref={elementRef} style={style}>
      {children}
    </div>
  );
}
