import { getAlertBanners, getTrainingSchedule } from "@/lib/payload";
import { Icon } from "@iconify/react";
import ClientAlertBanners from "./ClientAlertBanners";

export default async function UtilityBar() {
  const [alertBanners, schedule] = await Promise.all([
    getAlertBanners(),
    getTrainingSchedule(),
  ]);

  const hasContent = alertBanners.length > 0 || schedule.length > 0;
  if (!hasContent) return null;

  return (
    <div
      className="w-full"
      role="complementary"
      aria-label="Site announcements and training schedule"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Alert Banners (Client-side interactive)                              */}
      {/* ------------------------------------------------------------------ */}
      <ClientAlertBanners banners={alertBanners as any} />

      {/* ------------------------------------------------------------------ */}
      {/* Training Schedule Utility Bar                                        */}
      {/* ------------------------------------------------------------------ */}
      {schedule.length > 0 && (
        <div className="w-full bg-background-dark border-b border-white/10 px-4 py-1.5 md:hidden">
          <div className="mx-auto max-w-7xl flex items-center justify-center gap-1 flex-wrap">
            <span className="flex items-center gap-1 text-[#C04E01] text-xs font-bold uppercase tracking-widest mr-2 shrink-0">
              <Icon
                icon="material-symbols:schedule"
                className="text-sm"
                aria-hidden="true"
              />
              Training
            </span>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {schedule.map((slot, i) => (
                <span key={slot.id} className="flex items-center gap-2 text-xs text-slate-300">
                  {i > 0 && (
                    <span className="text-white/20 select-none" aria-hidden="true">
                      |
                    </span>
                  )}
                  <span className="font-semibold text-slate-100">{slot.day as string}</span>
                  <span className="text-slate-400">
                    {slot.startTime as string}&ndash;{slot.endTime as string}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
