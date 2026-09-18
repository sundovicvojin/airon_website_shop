import Image from "next/image";

import qualityImage from "../../../../public/images/art-direction/airon-quality-art-direction.png";

import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";

export type QualityCopy = Readonly<{
  body: string;
  eyebrow: string;
  imageAlt: string;
  methodBody: string;
  methodLabel: string;
  standardBody: string;
  standardLabel: string;
  title: string;
  verificationBody: string;
  verificationLabel: string;
}>;

type QualitySectionProps = Readonly<{
  copy: QualityCopy;
}>;

export function QualitySection({ copy }: QualitySectionProps) {
  const principles = [
    { body: copy.methodBody, index: "01", label: copy.methodLabel },
    { body: copy.standardBody, index: "02", label: copy.standardLabel },
    { body: copy.verificationBody, index: "03", label: copy.verificationLabel },
  ];

  return (
    <section className="quality-section" id="quality">
      <Container>
        <div className="quality-section__heading">
          <p className="section-index">03 / QUALITY SYSTEM</p>
          <Reveal>
            <p className="type-eyebrow text-accent">{copy.eyebrow}</p>
            <h2>{copy.title}</h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="quality-section__body">{copy.body}</p>
          </Reveal>
        </div>

        <div className="quality-section__composition">
          <Reveal className="quality-section__image-wrap">
            <Image
              alt={copy.imageAlt}
              className="quality-section__image"
              fill
              placeholder="blur"
              sizes="(max-width: 767px) 100vw, 50vw"
              src={qualityImage}
            />
            <div className="quality-section__image-meta" aria-hidden="true">
              <span>CONTROL / 001</span>
              <span>AIRON LAB SYSTEM</span>
            </div>
          </Reveal>

          <div className="quality-section__principles" id="verification">
            {principles.map((principle, index) => (
              <Reveal delay={index * 80} key={principle.index}>
                <article className="quality-principle">
                  <span>{principle.index}</span>
                  <div>
                    <h3>{principle.label}</h3>
                    <p>{principle.body}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
