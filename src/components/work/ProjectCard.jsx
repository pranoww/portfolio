// One project card: media on one side, description and links on the other, tilting gently toward the mouse
"use client";
import { useRef } from "react";
import Image from "next/image";
import SkinCareChatPreview from "@/components/work/SkinCareChatPreview";
import TagPill from "@/components/ui/TagPill";
import TextLink from "@/components/ui/TextLink";

export default function ProjectCard({ project, isMediaOnRight }) {
  const cardRef = useRef(null);

  function handlePointerMove(event) {
    if (event.pointerType !== "mouse") return;
    const bounds = cardRef.current.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    cardRef.current.style.transform = `perspective(1100px) rotateX(${(-vertical * 5).toFixed(2)}deg) rotateY(${(horizontal * 6).toFixed(2)}deg) translateY(-3px)`;
    cardRef.current.style.boxShadow = `${(-horizontal * 18).toFixed(1)}px ${(18 - vertical * 10).toFixed(1)}px 40px rgba(26,47,251,.14)`;
  }

  function handlePointerLeave() {
    cardRef.current.style.transform = "";
    cardRef.current.style.boxShadow = "";
  }

  return (
    <article
      ref={cardRef}
      aria-label={project.name}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`grid overflow-hidden rounded-[18px] border border-line bg-surface transition-[transform,box-shadow] duration-200 ease-out ${isMediaOnRight ? "md:grid-cols-[5fr_7fr]" : "md:grid-cols-[7fr_5fr]"}`}
    >
      <div className={`flex items-center p-4 sm:p-7 ${project.image ? "bg-ink-2" : "bg-blue"} ${isMediaOnRight ? "md:order-2" : ""}`}>
        {project.image ? (
          <Image src={project.image.src} width={project.image.width} height={project.image.height} alt={project.image.alt} sizes="(max-width: 768px) 100vw, 640px" className="h-auto w-full rounded-[10px]" />
        ) : (
          <SkinCareChatPreview chatPreview={project.chatPreview} />
        )}
      </div>
      <div className="flex flex-col gap-3.5 p-[22px] sm:p-[30px]">
        <h3 className="font-display text-2xl font-bold tracking-[-0.01em]">{project.name}</h3>
        <p className="text-ink-2">{project.summary}</p>
        <div className="flex flex-wrap gap-2">
          {project.stack.map(technology => <TagPill key={technology}>{technology}</TagPill>)}
        </div>
        <div className="mt-auto flex gap-[22px] pt-2.5">
          <TextLink href={project.githubUrl}>Read the case study</TextLink>
          <TextLink href={project.githubUrl}>GitHub</TextLink>
        </div>
      </div>
    </article>
  );
}
