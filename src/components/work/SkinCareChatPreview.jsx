// Mock chat window that stands in for a Skin Care AI screenshot
export default function SkinCareChatPreview({ chatPreview }) {
  return (
    <div aria-label="Example conversation in Skin Care AI" className="flex w-full flex-col gap-2.5 rounded-[10px] bg-surface p-4 text-[15px]">
      <p className="max-w-[85%] self-end rounded-[14px] bg-ink px-3.5 py-2.5 leading-snug text-white">{chatPreview.question}</p>
      <p className="max-w-[85%] self-start rounded-[14px] bg-bg px-3.5 py-2.5 leading-snug">{chatPreview.answer}</p>
      <p className="flex items-center gap-2 self-start text-[13px] font-semibold text-ink-2">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-blue" />
        {chatPreview.status}
      </p>
    </div>
  );
}
