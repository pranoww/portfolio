// "A bit about me": the full-screen 3D room followed by the skills grid
import AboutRoomCanvas from "@/components/about/AboutRoomCanvas";
import SkillsGrid from "@/components/about/SkillsGrid";

export default function AboutSection() {
  return (
    <section id="about">
      <AboutRoomCanvas />
      <SkillsGrid />
    </section>
  );
}
