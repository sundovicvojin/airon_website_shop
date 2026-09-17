import type { HTMLAttributes } from "react";

type ContainerSize = "page" | "content" | "copy";

const sizeClasses: Record<ContainerSize, string> = {
  page: "max-w-[var(--container-page)]",
  content: "max-w-[var(--container-content)]",
  copy: "max-w-[var(--container-copy)]",
};

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: ContainerSize;
};

export function Container({ className, size = "page", ...props }: ContainerProps) {
  const classes = ["mx-auto w-full px-[var(--page-gutter)]", sizeClasses[size], className]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}
