// robots.txt: lets every search engine crawl the site and points them to the sitemap
import { siteUrl } from "@/content/siteMetadata";

export default function robots() {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteUrl}/sitemap.xml`, host: siteUrl };
}
