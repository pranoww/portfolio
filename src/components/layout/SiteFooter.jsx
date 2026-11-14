// Page footer with copyright and a small note
import { footerNote, profile } from "@/content/siteContent";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line py-6 text-sm text-ink-2">
      <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-4 px-4 sm:px-7">
        <span>© 2026 {profile.name}</span>
        <span>{footerNote}</span>
      </div>
    </footer>
  );
}
