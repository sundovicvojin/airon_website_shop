import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const sharedProps: IconProps = {
  "aria-hidden": true,
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 1.4,
  viewBox: "0 0 24 24",
};

export function ArrowIcon(props: IconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path d="M5 12h13M13 7l5 5-5 5" />
    </svg>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path d="M5.5 8.5h13l-1 11h-11l-1-11Z" />
      <path d="M9 9V7a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <path d="M4 8h16M4 16h16" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...sharedProps} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}
