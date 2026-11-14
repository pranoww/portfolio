// "Websites and web apps" demo: a mini browser shrinks to phone width and its dashboard really reflows, then grows back
export default function ResponsiveBrowserDemo({ isActive }) {
  const chartBarHeightList = [40, 65, 50, 85, 60, 95, 72];

  return (
    <div className={`@container mx-auto h-[220px] w-full overflow-hidden rounded-t-xl border border-b-0 border-line bg-bg sm:h-[330px] ${isActive ? "animate-[browser-shrink_5s_cubic-bezier(.65,0,.35,1)_infinite]" : ""}`}>
      <div className="flex h-[26px] items-center gap-1.5 border-b border-line bg-white px-2.5">
        {[1, 2, 3].map(dotNumber => <i key={dotNumber} className="size-2 rounded-full bg-[#d4d6e3]" />)}
        <span className="ml-2 h-2.5 max-w-40 flex-1 rounded-[5px] bg-bg" />
      </div>
      <div className="grid h-[calc(100%-26px)] grid-cols-[90px_1fr] gap-2.5 p-3 @max-[260px]:grid-cols-1 @max-[260px]:grid-rows-[22px_1fr]">
        <div className="rounded-lg bg-ink" />
        <div className="grid min-w-0 grid-rows-[auto_1fr] gap-2.5">
          <div className="grid grid-cols-3 gap-2 @max-[260px]:grid-cols-1">
            {[1, 2, 3].map(cardNumber => (
              <div key={cardNumber} className="relative h-11 rounded-lg border border-line bg-white after:absolute after:bottom-2.5 after:left-2.5 after:h-2 after:w-2/5 after:rounded after:bg-blue @max-[260px]:[&:nth-child(n+2)]:hidden" />
            ))}
          </div>
          <div className="flex items-end gap-1.5 rounded-lg border border-line bg-white p-2.5">
            {chartBarHeightList.map((barHeight, index) => (
              <b key={index} style={{ height: `${barHeight}%` }} className={`flex-1 rounded-t-[3px] ${index % 2 ? "bg-lime" : "bg-blue/85"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
