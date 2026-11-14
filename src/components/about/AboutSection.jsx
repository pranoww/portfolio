// "A bit about me": the full-screen 3D room, shown on tablets and desktops only; on phones the section and its 3D scene never load
"use client";
import AboutRoomCanvas from "@/components/about/AboutRoomCanvas";
import useMediaQuery from "@/hooks/useMediaQuery";

export default function AboutSection() {
  const isRoomShown = useMediaQuery("(min-width: 768px)");

  return (
    <section id="about" className="hidden md:block">
      {isRoomShown && <AboutRoomCanvas />}
    </section>
  );
}
