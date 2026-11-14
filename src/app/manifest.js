// Web app manifest: the site's name and colours when saved to a phone's home screen
import { seo } from "@/content/siteMetadata";

export default function manifest() {
  return {
    name: seo.title,
    short_name: seo.shortTitle,
    description: seo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f0f1fa",
    theme_color: "#f0f1fa",
    icons: [{ src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" }, { src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
