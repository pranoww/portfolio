// "Ask Simbha" chat: a button just left of the sitting cat opens a panel above him where visitors ask about Pranav.
// Questions go to the backend's /simbha route, which answers from Pranav's own notes and streams the reply back as text.
"use client";
import { useEffect, useRef, useState } from "react";
import { simbhaChat } from "@/content/siteContent";

const simbhaApiUrl = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/simbha`;
// The backend accepts the last 6 exchanges; older ones are left out
const maxHistoryMessages = 12;

const fieldClassName = "min-h-11 w-full rounded-[10px] border border-[#c9cbd8] bg-bg px-3.5 py-2.5 text-base text-ink outline-none transition focus:border-blue focus:shadow-[0_0_0_3px_rgba(26,47,251,.18)]";
const smallButtonClassName = "inline-flex min-h-11 items-center justify-center rounded-full px-4 font-mono text-[13px] transition duration-200 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-60";

// Errors Simbha may show as they are; anything else (network, timeout) becomes the napping line
class SimbhaError extends Error {}

async function askSimbha(question, history, onText) {
  const response = await fetch(simbhaApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    const responseBody = await response.json().catch(() => ({}));
    throw new SimbhaError(response.status === 429 && responseBody.detail ? responseBody.detail : simbhaChat.nappingLine);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onText(decoder.decode(value, { stream: true }));
  }
}

export default function SimbhaChat({ onOpenChange = () => {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const [draft, setDraft] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const inputRef = useRef(null);
  const openButtonRef = useRef(null);
  const messageListRef = useRef(null);

  function changeOpen(shouldOpen) {
    setIsOpen(shouldOpen);
    onOpenChange(shouldOpen);
    if (!shouldOpen) requestAnimationFrame(() => openButtonRef.current?.focus());
  }

  useEffect(() => {
    if (!isOpen) return undefined;
    inputRef.current?.focus();
    const handleKeyDown = event => { if (event.key === "Escape") changeOpen(false); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // changeOpen only uses setters and props, so it doesn't need to re-run this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const listElement = messageListRef.current;
    if (listElement) listElement.scrollTop = listElement.scrollHeight;
  }, [messageList]);

  async function sendQuestion(question) {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isWaiting) return;
    const history = messageList
      .filter(message => !message.isError && message.content)
      .slice(-maxHistoryMessages)
      .map(({ role, content }) => ({ role, content }));
    setDraft("");
    setIsWaiting(true);
    setMessageList(previous => [...previous, { role: "user", content: trimmedQuestion }, { role: "assistant", content: "" }]);

    const updateReply = changeReply => setMessageList(previous => {
      const updated = [...previous];
      updated[updated.length - 1] = changeReply(updated[updated.length - 1]);
      return updated;
    });
    try {
      await askSimbha(trimmedQuestion.slice(0, 500), history, text => updateReply(reply => ({ ...reply, content: reply.content + text })));
      // An empty stream would otherwise leave "thinking..." on screen forever
      updateReply(reply => (reply.content.trim() ? reply : { role: "assistant", content: simbhaChat.nappingLine, isError: true }));
    } catch (error) {
      updateReply(() => ({ role: "assistant", content: error instanceof SimbhaError ? error.message : simbhaChat.nappingLine, isError: true }));
    } finally {
      setIsWaiting(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendQuestion(draft);
  }

  return (
    <>
      <button
        ref={openButtonRef}
        type="button"
        onClick={() => changeOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="simbha-chat-panel"
        className={`${smallButtonClassName} fixed bottom-4 right-[104px] z-[17] gap-2 sm:right-[196px] bg-ink text-white hover:bg-blue`}
      >
        <span aria-hidden="true" className="size-2 rounded-full bg-lime" />
        {isOpen ? simbhaChat.closeLabel : simbhaChat.openButtonLabel}
      </button>

      {isOpen && (
        <section
          id="simbha-chat-panel"
          role="dialog"
          aria-label={simbhaChat.title}
          className="fixed inset-x-2 bottom-[68px] z-[18] flex max-h-[min(560px,calc(100dvh-140px))] flex-col overflow-hidden rounded-card border border-line bg-surface text-ink shadow-[0_18px_50px_-20px_rgba(0,0,0,.35)] motion-safe:animate-[fade-slide-in_.2s_ease-out] sm:inset-x-auto sm:right-4 sm:bottom-[190px] sm:w-[380px]"
        >
          <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <h2 className="font-display text-lg font-extrabold leading-tight">{simbhaChat.title}</h2>
              <p className="text-sm text-ink-2">{simbhaChat.subtitle}</p>
            </div>
            <button type="button" onClick={() => changeOpen(false)} className={`${smallButtonClassName} -mr-2 text-ink-2 hover:bg-bg hover:text-ink`}>
              {simbhaChat.closeLabel}
            </button>
          </header>

          <div ref={messageListRef} aria-live="polite" className="flex min-h-[180px] flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-4">
            <p className="max-w-[88%] self-start rounded-[14px_14px_14px_4px] bg-ink px-3.5 py-2.5 font-mono text-[13px] leading-snug text-white">{simbhaChat.greeting}</p>
            {messageList.map((message, index) => (
              message.role === "user" ? (
                <p key={index} className="max-w-[85%] self-end rounded-[14px_14px_4px_14px] bg-bg px-3.5 py-2.5 text-[15px] leading-snug">{message.content}</p>
              ) : (
                <p key={index} className={`max-w-[88%] self-start whitespace-pre-line rounded-[14px_14px_14px_4px] px-3.5 py-2.5 font-mono text-[13px] leading-snug ${message.isError ? "border border-line bg-surface text-ink-2" : "bg-ink text-white"}`}>
                  {message.content || <span className="opacity-70">{simbhaChat.thinkingLine}</span>}
                </p>
              )
            ))}
            {messageList.length === 0 && (
              <div className="mt-1 flex flex-wrap gap-2">
                {simbhaChat.suggestedQuestionList.map(question => (
                  <button key={question} type="button" onClick={() => sendQuestion(question)} className={`${smallButtonClassName} border border-line bg-surface text-ink hover:border-ink`}>
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-line p-3">
            <label htmlFor="simbha-question" className="sr-only">{simbhaChat.inputLabel}</label>
            <input
              ref={inputRef}
              id="simbha-question"
              value={draft}
              onChange={event => setDraft(event.target.value)}
              maxLength={500}
              autoComplete="off"
              placeholder={simbhaChat.inputPlaceholder}
              className={fieldClassName}
            />
            <button type="submit" disabled={isWaiting || !draft.trim()} className={`${smallButtonClassName} shrink-0 bg-ink text-white hover:bg-blue`}>
              {simbhaChat.sendLabel}
            </button>
          </form>
        </section>
      )}
    </>
  );
}
