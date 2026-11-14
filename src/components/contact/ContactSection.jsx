// "Got something to build?": blue contact section with direct links and the contact form
import ContactForm from "@/components/contact/ContactForm";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { contact, profile } from "@/content/siteContent";

const contactLinkList = [
  { label: profile.email, href: `mailto:${profile.email}` },
  { label: "LinkedIn", href: profile.linkedinUrl },
  { label: "GitHub", href: profile.githubUrl },
];

export default function ContactSection() {
  return (
    <section id="contact" className="bg-blue py-16 text-white md:py-[76px]">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-5 sm:px-7 md:grid-cols-[5fr_7fr] md:gap-14 [&>*]:min-w-0">
        <RevealOnScroll>
          <h2 className="font-display text-[clamp(32px,4.2vw,56px)] font-semibold leading-[1.05] tracking-[-0.02em]">{contact.title}</h2>
          <p className="mt-[18px] text-lg text-line md:text-[19px]">{contact.lead}</p>
          <div className="mt-7 flex flex-col items-start gap-3 text-lg">
            {contactLinkList.map(link => (
              <a
                key={link.label}
                href={link.href}
                {...(link.href.startsWith("http") && { target: "_blank", rel: "noreferrer" })}
                className="break-all font-semibold underline decoration-lime decoration-2 underline-offset-[5px] transition-colors hover:text-lime"
              >
                {link.label}
              </a>
            ))}
          </div>
        </RevealOnScroll>
        <RevealOnScroll>
          <ContactForm />
        </RevealOnScroll>
      </div>
    </section>
  );
}
