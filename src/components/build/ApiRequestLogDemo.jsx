// "Backends and APIs" demo: requests travel UI → FastAPI → Postgres while a request log fills in, one refused with 403
"use client";
import useLoopingSequence from "@/hooks/useLoopingSequence";
import { apiRequestList } from "@/content/siteContent";

const statusColorClassName = { 200: "text-[#8ef0a6]", 201: "text-[#8ef0a6]", 403: "text-[#ff8a80]" };

export default function ApiRequestLogDemo({ isActive }) {
  const shownRequestCount = useLoopingSequence(isActive, apiRequestList.length, { startDelay: 300, stepDelay: 600, pauseAfterLastStep: 2200 });

  return (
    <div className="w-full min-w-0 font-mono text-xs sm:text-sm">
      <div className="mb-5 flex items-center text-[#c9cbd8] sm:mb-7">
        {["UI", "FastAPI", "Postgres"].map((layerName, index) => (
          <div key={layerName} className={`flex items-center ${index > 0 ? "flex-1" : ""}`}>
            {index > 0 && (
              <i className="relative mx-0 h-px min-w-3 flex-1 bg-white/25">
                <span className={`absolute -top-[3px] size-[7px] rounded-full bg-lime opacity-0 ${isActive ? "animate-[dot-travel_1.2s_ease-in-out_infinite]" : ""} ${index === 2 ? "[animation-delay:.6s]" : ""}`} />
              </i>
            )}
            <span className="flex-none rounded-full border border-white/25 px-2.5 py-1">{layerName}</span>
          </div>
        ))}
      </div>
      <ul className="grid gap-3">
        {apiRequestList.map((request, index) => (
          <li
            key={request.path}
            data-shown={index < shownRequestCount}
            className="grid grid-cols-[48px_minmax(0,1fr)_auto_auto] gap-2.5 opacity-15 transition-opacity duration-300 data-[shown=true]:opacity-100"
          >
            <span className="text-lime">{request.method}</span>
            <span className="truncate text-white">{request.path}</span>
            <span className={statusColorClassName[request.status]}>{request.status}</span>
            <span className="text-[#9ea2b3]">{request.duration}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
