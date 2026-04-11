"use client";

import { useModal } from "@/components/ModalProvider";
import React from "react";
import { Icon } from "@iconify/react";

// Types
type PricingRow = { id?: string; tier: string; location: string; price: string };
type AmenityRow = { id?: string; amenity: string };
type SponsorRow = { id?: string; name: string };

export function EventDetailsModalButton({
  event,
  children,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event: Record<string, any>;
  children?: React.ReactNode;
  className?: string;
}) {
  const { open } = useModal();

  const openEventModal = () => {
    const eventDate = new Date(event.date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const ctaHref = event.ctaLink ?? null;
    const pricing = event.pricing as PricingRow[] | undefined;
    const amenities = event.amenities as AmenityRow[] | undefined;
    const sponsors = event.sponsors as SponsorRow[] | undefined;
    const doorsOpen = event.doorsOpen as string | undefined;
    const fightsStart = event.fightsStart as string | undefined;
    const fightCard = event.fightCard as string | undefined;
    
    const fightCardBouts = fightCard
      ? fightCard.split("\n").map((l) => l.trim()).filter(Boolean)
      : [];

    open({
      subtitle: event.tag || "Event Details",
      title: <span className="uppercase tracking-tighter font-black">{event.title}</span>,
      size: "lg",
      body: (
        <div className="space-y-10 text-slate-300">
          {/* Hero Image */}
          {(() => {
            const rawUrl = event.image && typeof event.image === 'object' && 'url' in event.image ? (event.image as { url?: string }).url : null;
            if (rawUrl) {
              return (
                <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden mb-8 border border-white/5">
                  <img 
                    src={rawUrl} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card-dark to-transparent opacity-60" />
                </div>
              );
            }
            return null;
          })()}

          {event.description && (
            <div>
              <p className="text-lg leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-card-dark border border-primary/20 rounded-xl p-6 glow-accent">
            <div className="flex items-start gap-3">
              <Icon icon="material-symbols:calendar-today" className="text-primary text-xl mt-0.5 shrink-0" />
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-0.5">Date</p>
                <p className="text-white font-bold">{eventDate}</p>
              </div>
            </div>
            {event.location && (
              <div className="flex items-start gap-3">
                <Icon icon="material-symbols:location-on" className="text-primary text-xl mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-0.5">Venue</p>
                  <p className="text-white font-bold">{event.location}</p>
                </div>
              </div>
            )}
            {doorsOpen && (
              <div className="flex items-start gap-3">
                <Icon icon="material-symbols:door-open" className="text-primary text-xl mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-0.5">Doors Open</p>
                  <p className="text-white font-bold">{doorsOpen}</p>
                </div>
              </div>
            )}
            {fightsStart && (
              <div className="flex items-start gap-3">
                <Icon icon="material-symbols:sports-mma" className="text-primary text-xl mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-0.5">Fights Start</p>
                  <p className="text-white font-bold">{fightsStart}</p>
                </div>
              </div>
            )}
          </div>

          {/* Fight Card */}
          {fightCardBouts.length > 0 && (
            <div>
              <h3 className="text-white text-lg font-black uppercase tracking-widest mb-4 border-b border-white/10 pb-2">
                Fight Card
              </h3>
              <div className="space-y-2">
                {fightCardBouts.map((bout, i) => (
                  <div key={i} className="flex items-center gap-4 bg-card-dark border border-white/5 rounded-lg px-4 py-3 hover:border-primary/40 transition-colors">
                    <span className="text-primary font-black font-display w-6 shrink-0 text-sm">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-white font-bold uppercase tracking-wide text-sm">
                      {bout}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing & Amenities Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pricing && pricing.length > 0 && (
              <div>
                <h3 className="text-white text-lg font-black uppercase tracking-widest mb-4 border-b border-white/10 pb-2">
                  Tickets
                </h3>
                <div className="space-y-2 mb-6">
                  {pricing.map((row, i) => (
                    <div key={row.id ?? i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="text-white font-bold text-sm">{row.tier}</p>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{row.location}</p>
                      </div>
                      <span className="text-primary font-black">{row.price}</span>
                    </div>
                  ))}
                </div>
                {ctaHref && (
                  <a
                    href={ctaHref}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center h-12 rounded-lg bg-primary px-6 font-display text-xs font-black uppercase tracking-widest text-white hover:scale-105 transition-transform glow-accent"
                  >
                    Event Registration
                  </a>
                )}
              </div>
            )}

            <div className="space-y-8">
              {amenities && amenities.length > 0 && (
                <div>
                  <h3 className="text-white text-lg font-black uppercase tracking-widest mb-4 border-b border-white/10 pb-2">
                    Amenities
                  </h3>
                  <div className="space-y-2">
                    {amenities.map((a, i) => (
                      <div key={a.id ?? i} className="flex items-center gap-3 text-sm">
                        <Icon icon="material-symbols:check-circle" className="text-primary text-lg shrink-0" />
                        <span className="font-medium">{a.amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sponsors && sponsors.length > 0 && (
                <div>
                  <h3 className="text-white text-lg font-black uppercase tracking-widest mb-4 border-b border-white/10 pb-2">
                    Sponsors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {sponsors.map((s, i) => (
                      <div key={s.id ?? i} className="bg-card-dark border border-white/5 rounded pl-2 pr-3 py-1 text-xs font-bold text-slate-300 flex items-center gap-2">
                        <Icon icon="material-symbols:star" className="text-primary text-xs" />
                        {s.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    });
  };

  return (
    <button type="button" onClick={openEventModal} className={className}>
      {children || 'Full Details'}
    </button>
  );
}
