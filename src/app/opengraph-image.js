// Preview image shown when the site is shared on LinkedIn, WhatsApp, X and others: name, role and city on the site's colours
import { ImageResponse } from "next/og";
import { profile } from "@/content/siteContent";

export const alt = `${profile.name}, ${profile.role} in ${profile.location}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#f0f1fa", color: "#000000" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30, fontWeight: 600 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: "#c1ff00", border: "3px solid #000000" }} />
          {profile.handle}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>{profile.name}</div>
          <div style={{ fontSize: 44, color: "#1a2ffb", fontWeight: 600 }}>{profile.role}</div>
        </div>
        <div style={{ fontSize: 30, color: "#2b2e3a" }}>{`${profile.location} · Next.js · FastAPI · PostgreSQL · LLMs`}</div>
      </div>
    ),
    size,
  );
}
