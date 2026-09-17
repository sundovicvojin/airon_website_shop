import Link from "next/link";

type WordmarkProps = Readonly<{
  className?: string;
  href: string;
  inverted?: boolean;
}>;

export function Wordmark({ className, href, inverted = false }: WordmarkProps) {
  return (
    <Link
      aria-label="AIRON"
      className={[
        "inline-flex items-center text-[0.8125rem] font-semibold leading-none tracking-[0.42em]",
        inverted ? "text-canvas" : "text-ink",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      href={href}
    >
      AIRON
    </Link>
  );
}
