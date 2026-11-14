// Search and sharing details: the site address, page title and description, and who the site is about for search engines
import { profile } from "@/content/siteContent";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const googleSiteVerification = "9IsWTBhIEmKFiUOM7JXb1C_lnofZ5MZCTj0HqCi2WD8";

export const seo = {
  title: "Pranav Lande · Full-stack and AI developer in Mumbai",
  shortTitle: "Pranav Lande",
  description: "Pranav Lande is a full-stack and AI developer in Mumbai. He builds web apps with Next.js, FastAPI and PostgreSQL, and AI tools with LLMs. See his projects, experience and resume.",
  keywordList: ["Pranav Lande", "Pranav Kishor Lande", "full-stack developer Mumbai", "AI developer Mumbai", "Next.js developer", "FastAPI developer", "Python developer", "React developer"],
};

export const personStructuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  alternateName: "Pranav Kishor Lande",
  url: siteUrl,
  jobTitle: profile.role,
  worksFor: { "@type": "Organization", name: "One Health Assist" },
  address: { "@type": "PostalAddress", addressLocality: profile.location, addressCountry: "IN" },
  knowsAbout: ["Full-stack development", "Next.js", "React", "FastAPI", "Python", "PostgreSQL", "Large language models"],
  sameAs: [profile.githubUrl, profile.linkedinUrl],
};
