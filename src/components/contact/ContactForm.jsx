// Contact form: checks name, email and message, sends them to the backend while the form flies off as a paper plane, then shows a thank-you note
"use client";
import { useState } from "react";
import PillButton from "@/components/ui/PillButton";
import { contact, profile } from "@/content/siteContent";

// The paper plane needs three.js, the heaviest code on the site, so it loads only once someone starts filling in the form
// (and is usually ready by the time they press Send), never with the page itself
const canPlayPaperPlane = () => typeof window.WebGL2RenderingContext !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let paperPlanePromise = null;
const loadPaperPlane = () => (paperPlanePromise ??= import("@/three/paperPlaneSend"));

const contactApiUrl = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/contact`;
const sendFailedMessage = "Sorry, that didn’t go through. Please try again or email me directly.";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const formFieldList = [
  { name: "name", label: "Your name", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "message", label: "Message", isMultiline: true },
];

function findFormErrors({ name, email, message }) {
  const formErrors = {};
  if (!name.trim()) formErrors.name = "Please add your name.";
  if (!email.trim()) formErrors.email = "Please add your email.";
  else if (!emailPattern.test(email.trim())) formErrors.email = "That email doesn’t look right.";
  if (message.trim().length < 10) formErrors.message = "Please write a short message (at least 10 characters).";
  else if (message.length > 5000) formErrors.message = "Please keep the message under 5000 characters.";
  return formErrors;
}

async function sendContactMessage(formValues) {
  try {
    const response = await fetch(contactApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues),
      signal: AbortSignal.timeout(15000),
    });
    if (response.ok) return { isSent: true };
    const responseBody = await response.json().catch(() => ({}));
    return { isSent: false, errorMessage: response.status === 429 ? responseBody.detail : sendFailedMessage };
  } catch {
    return { isSent: false, errorMessage: sendFailedMessage };
  }
}

const fieldClassName = "w-full rounded-[10px] border border-[#c9cbd8] bg-bg px-4 py-3 text-base text-ink outline-none transition focus:border-blue focus:shadow-[0_0_0_3px_rgba(26,47,251,.18)] aria-[invalid=true]:border-[#e90000]";

export default function ContactForm() {
  const [formValues, setFormValues] = useState({ name: "", email: "", message: "", website: "" });
  const [formErrors, setFormErrors] = useState({});
  const [sendStatus, setSendStatus] = useState("idle");
  const [sendErrorMessage, setSendErrorMessage] = useState("");
  const [sentFormHeight, setSentFormHeight] = useState(0);

  function handleFieldChange(event) {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  }

  async function handleContactFormSubmit(event) {
    event.preventDefault();
    const foundErrors = findFormErrors(formValues);
    setFormErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) return;

    const formElement = event.currentTarget;
    setSendStatus("sending");
    const sendResultPromise = sendContactMessage(formValues);
    if (canPlayPaperPlane()) {
      try {
        const { playPaperPlaneSend } = await loadPaperPlane();
        await playPaperPlaneSend(formElement, sendResultPromise.then(sendResult => sendResult.isSent));
      } catch {
        // The animation couldn't load (offline, say): the message still sends and the thank-you note still shows
      }
    }
    const sendResult = await sendResultPromise;
    if (sendResult.isSent) {
      setSentFormHeight(formElement.offsetHeight);
      return setSendStatus("sent");
    }
    setSendErrorMessage(sendResult.errorMessage);
    setSendStatus("failed");
  }

  if (sendStatus === "sent") {
    // Keeps the space the form took so the page below doesn't jump up when the shorter note replaces it
    return (
      <div style={{ minHeight: sentFormHeight }}>
        <div role="status" className="rounded-[18px] bg-surface p-[22px] text-ink motion-safe:animate-[success-rise_.7s_cubic-bezier(.22,1,.36,1)] sm:p-[30px]">
          <h3 className="font-display text-2xl font-bold">{contact.successMessage}</h3>
          <p className="mt-2 text-ink-2">
            In a hurry? Email me directly at <a className="font-semibold underline decoration-blue decoration-2 underline-offset-4" href={`mailto:${profile.email}`}>{profile.email}</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleContactFormSubmit} onFocus={() => { if (canPlayPaperPlane()) loadPaperPlane(); }} className="grid gap-4 rounded-[18px] bg-surface p-[22px] text-ink sm:p-[30px]">
      {formFieldList.map(field => {
        const FieldElement = field.isMultiline ? "textarea" : "input";
        const errorId = `${field.name}-error`;
        return (
          <div key={field.name} className="grid gap-1.5">
            <label htmlFor={`contact-${field.name}`} className="text-[15px] font-semibold">{field.label}</label>
            <FieldElement
              id={`contact-${field.name}`}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              value={formValues[field.name]}
              onChange={handleFieldChange}
              aria-invalid={Boolean(formErrors[field.name])}
              aria-describedby={formErrors[field.name] ? errorId : undefined}
              className={`${fieldClassName} ${field.isMultiline ? "min-h-[130px] resize-y" : ""}`}
            />
            {formErrors[field.name] && <p id={errorId} className="text-sm text-[#c00000]">{formErrors[field.name]}</p>}
          </div>
        );
      })}
      <input type="text" name="website" value={formValues.website} onChange={handleFieldChange} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden" />
      {sendStatus === "failed" && <p role="alert" className="text-sm text-[#c00000]">{sendErrorMessage}</p>}
      <PillButton type="submit" disabled={sendStatus === "sending"} className="justify-self-start">
        {sendStatus === "sending" ? "Sending…" : "Send message"}
      </PillButton>
    </form>
  );
}
