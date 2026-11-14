// Root layout: fonts, page metadata and the shell shared by every page (intro, header, footer, smooth scroll, gray cat)
import { Host_Grotesk, IBM_Plex_Mono } from "next/font/google";
import HelloLoader from "@/components/layout/HelloLoader";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
import GrayCatOverlay from "@/components/cat/GrayCatOverlay";
import { googleSiteVerification, personStructuredData, seo, siteUrl } from "@/content/siteMetadata";
import "./globals.css";

const hostGrotesk = Host_Grotesk({ variable: "--font-host-grotesk", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["500"] });

// Runs before the first paint so the intro never flashes for returning visitors
const showIntroOnFirstVisit = `try { if (!sessionStorage.getItem("pl-hello")) document.documentElement.classList.add("is-loading"); } catch (error) {}`;

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: seo.title, template: `%s · ${seo.shortTitle}` },
  description: seo.description,
  keywords: seo.keywordList,
  authors: [{ name: seo.shortTitle, url: siteUrl }],
  creator: seo.shortTitle,
  alternates: { canonical: "/" },
  openGraph: { type: "profile", url: "/", siteName: seo.shortTitle, title: seo.title, description: seo.description, firstName: "Pranav", lastName: "Lande", locale: "en_IN" },
  twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
  robots: { index: true, follow: true },
  verification: { google: googleSiteVerification },
};

export const viewport = { themeColor: "#f0f1fa" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${hostGrotesk.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: showIntroOnFirstVisit }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData) }} />
      </head>
      <body>
        <SmoothScrollProvider>
          <HelloLoader />
          <SiteHeader />
          {children}
          <SiteFooter />
          <GrayCatOverlay />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
