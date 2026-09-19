import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import type { ContentBlock } from "@/i18n/dictionaries";

type EditorialPageProps = Readonly<{ eyebrow: string; title: string; intro: string; blocks?: readonly ContentBlock[]; aside?: ReactNode; children?: ReactNode }>;

export function EditorialPage({ aside, blocks = [], children, eyebrow, intro, title }: EditorialPageProps) {
  return <main className="editorial-page">
    <Container>
      <header className="editorial-hero"><p className="type-eyebrow text-accent">{eyebrow}</p><h1>{title}</h1><p>{intro}</p></header>
      {aside ? <div className="editorial-notice">{aside}</div> : null}
      {blocks.length ? <div className="editorial-blocks">{blocks.map((block, index) => <Reveal delay={index * 70} key={block.title}><article><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{block.title}</h2><p>{block.body}</p></div></article></Reveal>)}</div> : null}
      {children}
    </Container>
  </main>;
}
