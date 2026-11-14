// "Selected work": the two personal projects, one card each
import ProjectCard from "@/components/work/ProjectCard";
import SectionHeading from "@/components/ui/SectionHeading";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { projectList, selectedWork } from "@/content/siteContent";

export default function SelectedWorkSection() {
  return (
    <section id="work" className="border-t border-line py-16 md:py-[76px]">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-7">
        <SectionHeading title={selectedWork.title} lead={selectedWork.lead} />
        <div className="grid gap-8">
          {projectList.map((project, index) => (
            <RevealOnScroll key={project.slug}>
              <ProjectCard project={project} isMediaOnRight={index % 2 === 1} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
