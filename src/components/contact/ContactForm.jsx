// Contact form: checks name, email and message in the browser and shows a thank-you note (sending is added later)
"use client";
import { useState } from "react";
import PillButton from "@/components/ui/PillButton";
import { contact, profile } from "@/content/siteContent";

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

const fieldClassName = "w-full rounded-[10px] border border-[#c9cbd8] bg-bg px-4 py-3 text-base text-ink outline-none transition focus:border-blue focus:shadow-[0_0_0_3px_rgba(26,47,251,.18)] aria-[invalid=true]:border-[#e90000]";

export default function ContactForm() {
  const [formValues, setFormValues] = useState({ name: "", email: "", message: "" });
  const [formErrors, setFormErrors] = useState({});
  const [isSent, setIsSent] = useState(false);

  function handleFieldChange(event) {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  }

  function handleContactFormSubmit(event) {
    event.preventDefault();
    const foundErrors = findFormErrors(formValues);
    setFormErrors(foundErrors);
    if (Object.keys(foundErrors).length === 0) setIsSent(true);
  }

  if (isSent) {
    return (
      <div role="status" className="rounded-[18px] bg-surface p-[22px] text-ink sm:p-[30px]">
        <h3 className="font-display text-2xl font-bold">{contact.successMessage}</h3>
        <p className="mt-2 text-ink-2">
          In a hurry? Email me directly at <a className="font-semibold underline decoration-blue decoration-2 underline-offset-4" href={`mailto:${profile.email}`}>{profile.email}</a>.
        </p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleContactFormSubmit} className="grid gap-4 rounded-[18px] bg-surface p-[22px] text-ink sm:p-[30px]">
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
      <PillButton type="submit" className="justify-self-start">Send message</PillButton>
    </form>
  );
}
