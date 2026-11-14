// "Websites and web apps" demo: a small working-looking app in a browser that narrows to phone width and reflows, then grows back
import { responsiveAppExample } from "@/content/siteContent";

const statusClassNameByStatus = {
  Interview: "bg-lime text-ink",
  Applied: "bg-bg text-ink-2",
  Offer: "bg-blue text-white",
};

export default function ResponsiveBrowserDemo({ isActive }) {
  const { address, appName, navigationItemList, heading, statList, rowList } = responsiveAppExample;

  return (
    <div className={`@container mx-auto h-[250px] w-full min-w-[170px] overflow-hidden rounded-t-xl border border-b-0 border-line bg-white text-ink sm:h-[330px] ${isActive ? "animate-[browser-shrink_6s_cubic-bezier(.65,0,.35,1)_infinite]" : ""}`}>
      <div className="flex h-7 items-center gap-1.5 border-b border-line bg-bg px-2.5">
        {[1, 2, 3].map(dotNumber => <i key={dotNumber} className="size-2 shrink-0 rounded-full bg-[#d4d6e3]" />)}
        <span className="ml-2 min-w-0 flex-1 truncate rounded-md bg-white px-2 py-0.5 font-mono text-[9px] text-ink-2 @max-[300px]:hidden">{address}</span>
      </div>

      <div className="flex h-[calc(100%-28px)] @max-[300px]:flex-col">
        <aside className="w-[118px] shrink-0 border-r border-line p-2.5 @max-[300px]:flex @max-[300px]:w-full @max-[300px]:items-center @max-[300px]:justify-between @max-[300px]:border-b @max-[300px]:border-r-0 @max-[300px]:py-2">
          <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold @max-[300px]:mb-0">
            <span className="size-3 rounded-[3px] bg-blue" />{appName}
          </p>
          <ul className="grid gap-0.5 text-[10px] @max-[300px]:hidden">
            {navigationItemList.map((navigationItem, index) => (
              <li key={navigationItem} className={`rounded-md px-2 py-1 ${index === 1 ? "bg-blue/10 font-semibold text-blue" : "text-ink-2"}`}>{navigationItem}</li>
            ))}
          </ul>
          <span aria-hidden="true" className="hidden w-3.5 gap-[3px] @max-[300px]:grid">
            {[1, 2, 3].map(lineNumber => <i key={lineNumber} className="h-px bg-ink" />)}
          </span>
        </aside>

        <div className="min-w-0 flex-1 p-3">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[13px] font-bold">{heading}</p>
            <span className="rounded-full bg-ink px-2.5 py-1 text-[9px] font-semibold text-white">+ Add</span>
          </div>

          <div className="mb-2.5 grid grid-cols-3 gap-1.5">
            {statList.map(stat => (
              <div key={stat.label} className="rounded-lg border border-line px-2 py-1.5 @max-[300px]:px-1.5">
                <p className="text-[15px] font-bold tabular-nums leading-tight">{stat.value}</p>
                <p className="truncate text-[9px] text-ink-2 @max-[300px]:text-[8px]">{stat.label}</p>
              </div>
            ))}
          </div>

          <ul className="divide-y divide-line rounded-lg border border-line">
            {rowList.map(row => (
              <li key={row.company} data-testid="app-row" className="flex items-center gap-2 px-2 py-1.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-md bg-bg text-[9px] font-bold">{row.company[0]}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10px] font-semibold">{row.role}</span>
                  <span className="block truncate text-[9px] text-ink-2">{row.company}</span>
                </span>
                <span className="shrink-0 font-mono text-[9px] text-ink-2 @max-[300px]:hidden">{row.date}</span>
                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${statusClassNameByStatus[row.status]}`}>{row.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
