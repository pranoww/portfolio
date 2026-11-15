// Simbha's chat panel: clicking the cat opens it above him, and visitors ask about Pranav.
// Questions go to the backend's /simbha route, which answers from Pranav's own notes and streams the reply back as text.
"use client";
import { useEffect, useRef, useState } from "react";
import { simbhaChat } from "@/content/siteContent";
import { recordQuestion } from "@/components/cat/simbhaChatLimit";

// Long enough to read "I'm going to sleep" before the chat closes itself
const sleepCloseDelayMs = 2800;
const pickRandom = list => list[Math.floor(Math.random() * list.length)];
const simbhaApiUrl = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/simbha`;
// The backend accepts the last 6 exchanges; older ones are left out
const maxHistoryMessages = 12;

// Fur-grey panel (the cat's colour): Simbha talks in white, the visitor in the site's lime, header buttons in the site blue
const fieldClassName = "min-h-11 w-full rounded-[10px] border-2 border-transparent bg-white px-3.5 py-2.5 text-base text-ink outline-none transition placeholder:text-ink-2/70 focus:border-blue";
const smallButtonClassName = "inline-flex min-h-11 items-center justify-center rounded-full px-4 font-mono text-[13px] transition duration-200 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-50";
const headerButtonClassName = `${smallButtonClassName} min-h-10 px-3.5 bg-blue text-white hover:bg-blue-d`;

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

export default function SimbhaChat({ isOpen, onClose }) {
  const [messageList, setMessageList] = useState([]);
  const [draft, setDraft] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  // The first line in the chat: his greeting, or an annoyed "fresh start" line after Start over
  const [openingLine, setOpeningLine] = useState(simbhaChat.greeting);
  const inputRef = useRef(null);
  const messageListRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    inputRef.current?.focus();
    const handleKeyDown = event => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const listElement = messageListRef.current;
    if (listElement) listElement.scrollTop = listElement.scrollHeight;
  }, [messageList, isOpen]);

  // Clears the chat but not the question count, so starting over can't dodge his sleep limit
  function startOver() {
    setMessageList([]);
    setDraft("");
    setOpeningLine(previousLine => pickRandom(simbhaChat.startOverLineList.filter(line => line !== previousLine)));
    inputRef.current?.focus();
  }

  // The warning and sleep questions (14 and 15) get fixed attitude lines from Simbha himself, with no request to the backend
  function replyWithAttitude(question, line, shouldGoToSleep) {
    setDraft("");
    setMessageList(previous => [...previous, { role: "user", content: question }, { role: "assistant", content: line, isCanned: true }]);
    if (shouldGoToSleep) {
      setIsWaiting(true);
      setTimeout(() => {
        setIsWaiting(false);
        onClose();
      }, sleepCloseDelayMs);
    }
  }

  async function sendQuestion(question) {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isWaiting) return;
    const limitDecision = recordQuestion();
    if (limitDecision === "warn") return replyWithAttitude(trimmedQuestion, pickRandom(simbhaChat.tooManyQuestionsLineList), false);
    if (limitDecision === "sleep") return replyWithAttitude(trimmedQuestion, simbhaChat.goingToSleepLine, true);

    const history = messageList
      .filter(message => !message.isError && !message.isCanned && message.content)
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

  if (!isOpen) return null;

  return (
    <section
      id="simbha-chat-panel"
      role="dialog"
      aria-label={`Chat with ${simbhaChat.title}`}
      className="fixed inset-x-2 bottom-[150px] z-[18] flex max-h-[min(560px,calc(100dvh-150px-var(--header-height)-12px))] sm:max-h-[min(560px,calc(100dvh-230px-var(--header-height)-12px))] flex-col overflow-hidden rounded-card bg-fur text-ink shadow-[0_22px_50px_-22px_rgba(0,0,0,.35)] motion-safe:animate-[fade-slide-in_.2s_ease-out] sm:inset-x-auto sm:right-4 sm:bottom-[230px] sm:w-[390px]"
    >
      <header className="flex shrink-0 items-start justify-between gap-3 px-4 pb-3 pt-4">
        <div>
          <h2 className="font-display text-xl font-extrabold leading-tight">{simbhaChat.title}</h2>
          <p className="text-sm text-ink-2">{simbhaChat.subtitle}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {messageList.length > 0 && (
            <button type="button" onClick={startOver} disabled={isWaiting} className={headerButtonClassName}>
              {simbhaChat.startOverLabel}
            </button>
          )}
          <button type="button" onClick={onClose} className={headerButtonClassName}>
            {simbhaChat.closeLabel}
          </button>
        </div>
      </header>

      <div ref={messageListRef} aria-live="polite" data-lenis-prevent className="flex min-h-[120px] flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain px-4 pb-4">
        <p className="max-w-[88%] self-start rounded-[14px_14px_14px_4px] bg-white px-3.5 py-2.5 font-mono text-[13px] leading-snug text-ink">{openingLine}</p>
        {messageList.map((message, index) => (
          message.role === "user" ? (
            <p key={index} className="max-w-[85%] self-end rounded-[14px_14px_4px_14px] bg-lime px-3.5 py-2.5 text-[15px] leading-snug text-ink">{message.content}</p>
          ) : (
            <p key={index} className={`max-w-[88%] self-start whitespace-pre-line rounded-[14px_14px_14px_4px] px-3.5 py-2.5 font-mono text-[13px] leading-snug ${message.isError ? "border border-ink/25 text-ink-2" : "bg-white text-ink"}`}>
              {message.content || <span className="opacity-70">{simbhaChat.thinkingLine}</span>}
            </p>
          )
        ))}
        {messageList.length === 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {simbhaChat.suggestedQuestionList.map(question => (
              <button key={question} type="button" onClick={() => sendQuestion(question)} className={`${smallButtonClassName} border border-[#9a9ca8] text-ink hover:border-ink hover:bg-white/60`}>
                {question}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex shrink-0 gap-2 bg-fur-d p-3">
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
        <button type="submit" disabled={isWaiting || !draft.trim()} className={`${smallButtonClassName} shrink-0 bg-lime font-semibold text-ink hover:bg-ink hover:text-lime`}>
          {simbhaChat.sendLabel}
        </button>
      </form>
    </section>
  );
}
