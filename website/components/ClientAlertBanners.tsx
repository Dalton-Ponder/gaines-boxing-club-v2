"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

interface Banner {
  id: string;
  icon?: string | null;
  copy: string;
}

const BANNER_STYLES = [
  {
    bg: "bg-[#C04E01]",
    text: "text-white",
    iconColor: "text-white/90",
  },
  {
    bg: "bg-[#1A1209]",
    text: "text-slate-100",
    iconColor: "text-[#C04E01]",
  },
];

export default function ClientAlertBanners({ banners }: { banners: Banner[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full transition-all duration-500 ease-in-out">
      {isExpanded ? (
        <div className="flex flex-col animate-in slide-in-from-top duration-500">
          {banners.map((banner, index) => {
            const style = BANNER_STYLES[index % BANNER_STYLES.length];
            return (
              <div
                key={banner.id}
                role="alert"
                className={`${style.bg} ${style.text} w-full px-4 py-2 ${
                  index === banners.length - 1 ? "border-b border-white/10" : ""
                } relative group`}
              >
                <div className={`mx-auto max-w-7xl flex items-center justify-center gap-2 text-xs font-medium tracking-wide ${index === 0 ? "pr-10" : ""}`}>
                  {banner.icon && (
                    <Icon
                      icon={banner.icon}
                      className={`${style.iconColor} shrink-0 text-base`}
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-center">{banner.copy}</span>
                </div>
                {/* Manual collapse button - only on the first banner */}
                {index === 0 && (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer z-10"
                    aria-label="Minimize announcements"
                  >
                    <Icon icon="ph:caret-up-bold" className="text-white/60 text-lg" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Minimized State: A slim, subtle trigger bar */
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full bg-[#111111] hover:bg-[#1a1a1a] border-b border-white/10 py-1 transition-all group cursor-pointer flex items-center justify-center gap-2"
          aria-label="View announcements"
        >
          <div className="flex items-center gap-1.5">
            <Icon
              icon="material-symbols:campaign-outline"
              className="text-[#C04E01] text-sm animate-pulse"
            />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C04E01]/80 group-hover:text-[#C04E01]">
              {banners.length} Announcement{banners.length > 1 ? "s" : ""}
            </span>
          </div>
          <Icon
            icon="ph:caret-down-bold"
            className="text-[#C04E01] text-base transition-transform group-hover:translate-y-0.5"
          />
        </button>
      )}
    </div>
  );
}
