// sitemap.xml: lists the site's pages for search engines
import { siteUrl } from "@/content/siteMetadata";

export default function sitemap() {
  return [{ url: siteUrl, changeFrequency: "monthly", priority: 1 }];
}
