# The only file that talks to a language model. Groq's free tier while developing; Claude Haiku on the live site.
# Claude only ever runs on the Vercel production deployment (see settings.is_paid_model_blocked); everywhere else Simbha naps.
from collections.abc import Iterator

from app.settings import settings

refusal_line = "Not answering that. Ask me about Pranav instead."
cut_off_line = " ...anyway."
# Simbha answers in 1-2 short sentences (about 50 tokens); this cap stops a runaway reply from costing more
max_reply_tokens = 150


def stream_reply(system_prompt: str, message_list: list[dict]) -> Iterator[str]:
    if settings.simbha_llm_provider == "anthropic":
        # Second lock on the paid model, in case anything ever calls this without going through the route
        if settings.is_paid_model_blocked:
            raise RuntimeError("Claude is only allowed on the Vercel production deployment")
        yield from stream_claude_reply(system_prompt, message_list)
    else:
        yield from stream_groq_reply(system_prompt, message_list)


def stream_claude_reply(system_prompt: str, message_list: list[dict]) -> Iterator[str]:
    import anthropic

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key.get_secret_value())
    # Thinking off at low effort: short persona replies don't need it, and it would be billed as output
    with client.messages.stream(
        model=settings.anthropic_model,
        max_tokens=max_reply_tokens,
        thinking={"type": "disabled"},
        output_config={"effort": "low"},
        system=system_prompt,
        messages=message_list,
    ) as stream:
        for text in stream.text_stream:
            yield text
        final_message = stream.get_final_message()
    if final_message.stop_reason == "refusal":
        yield refusal_line
    elif final_message.stop_reason == "max_tokens":
        yield cut_off_line


def stream_groq_reply(system_prompt: str, message_list: list[dict]) -> Iterator[str]:
    import groq

    client = groq.Groq(api_key=settings.groq_api_key.get_secret_value())
    # gpt-oss reasons before answering: keep that short and hidden, and leave room for it (Groq's free tier costs nothing)
    stream = client.chat.completions.create(
        model=settings.groq_model,
        max_tokens=max_reply_tokens * 3,
        reasoning_effort="low",
        include_reasoning=False,
        messages=[{"role": "system", "content": system_prompt}, *message_list],
        stream=True,
    )
    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
