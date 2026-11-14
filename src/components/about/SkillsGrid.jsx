// Six small skill groups shown under the About room
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { skillGroupList } from "@/content/siteContent";

export default function SkillsGrid() {
  return (
    <RevealOnScroll className="mx-auto grid max-w-[1180px] grid-cols-2 gap-x-7 gap-y-[22px] px-4 py-16 sm:px-7 md:grid-cols-6 md:pb-[76px]">
      {skillGroupList.map(skillGroup => (
        <div key={skillGroup.title}>
          <h4 className="mb-2 border-b border-ink pb-2 font-mono text-xs">{skillGroup.title}</h4>
          <ul className="text-[15px] text-ink-2">
            {skillGroup.itemList.map(skill => <li key={skill}>{skill}</li>)}
          </ul>
        </div>
      ))}
    </RevealOnScroll>
  );
}
