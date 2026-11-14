// Root layout: fonts, page metadata and the shell shared by every page
import { Host_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const hostGrotesk = Host_Grotesk({ variable: "--font-host-grotesk", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["500"] });

export const metadata = {
  title: "Pranav Lande · Full-stack and AI developer",
  description: "Pranav Lande builds web apps and AI tools people enjoy using. Full-stack developer in Mumbai.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${hostGrotesk.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
