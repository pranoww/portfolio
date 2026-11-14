// Root layout: fonts, page metadata and the shell shared by every page (intro, header, footer, smooth scroll)
import { Host_Grotesk, IBM_Plex_Mono } from "next/font/google";
import HelloLoader from "@/components/layout/HelloLoader";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
import "./globals.css";

const hostGrotesk = Host_Grotesk({ variable: "--font-host-grotesk", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["500"] });

// Runs before the first paint so the intro never flashes for returning visitors
const showIntroOnFirstVisit = `try { if (!sessionStorage.getItem("pl-hello")) document.documentElement.classList.add("is-loading"); } catch (error) {}`;

export const metadata = {
  title: "Pranav Lande · Full-stack and AI developer",
  description: "Pranav Lande builds web apps and AI tools people enjoy using. Full-stack developer in Mumbai.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${hostGrotesk.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: showIntroOnFirstVisit }} />
      </head>
      <body>
        <SmoothScrollProvider>
          <HelloLoader />
          <SiteHeader />
          {children}
          <SiteFooter />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
