import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getEvent, getSiteSettings, getSafeImageUrl } from "@/lib/payload";
import { Icon } from "@iconify/react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) return { title: "Event Not Found | Gaines Boxing Club" };
  return {
    title: `${event.title} | Gaines Boxing Club`,
    description: event.description ?? "Event details for Gaines Boxing Club.",
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, siteSettings] = await Promise.all([
    getEvent(id),
    getSiteSettings(),
  ]);

  if (!event) notFound();

  const eventImageUrl = getSafeImageUrl(event.image, "/images/event_main.png");
  const eventDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Build tel: link from ctaLink if it looks like a phone number
  const ctaHref = event.ctaLink ?? null;

  // Type helpers for extended fields
  type PricingRow = { id?: string; tier: string; location: string; price: string };
  type AmenityRow = { id?: string; amenity: string };
  type SponsorRow = { id?: string; name: string };

  const pricing = (event as Record<string, unknown>).pricing as PricingRow[] | undefined;
  const amenities = (event as Record<string, unknown>).amenities as AmenityRow[] | undefined;
  const sponsors = (event as Record<string, unknown>).sponsors as SponsorRow[] | undefined;
  const doorsOpen = (event as Record<string, unknown>).doorsOpen as string | undefined;
  const fightsStart = (event as Record<string, unknown>).fightsStart as string | undefined;
  const fightCard = (event as Record<string, unknown>).fightCard as string | undefined;

  const fightCardBouts = fightCard
    ? fightCard.split("\n").map((l) => l.trim()).filter(Boolean)
    : [];

  return (
    <>
      {/* Hero */}
      <section className="relative w-full min-h-[60vh] flex items-end overflow-hidden bg-background-dark">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(17,17,17,0.3) 0%, rgba(17,17,17,1) 100%), url('${eventImageUrl}')`,
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 w-full">
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-primary text-sm font-bold uppercase tracking-widest mb-8 transition-colors"
          >
            <Icon icon="material-symbols:arrow-back" />
            Back to Schedule
          </Link>
          {event.tag && (
            <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded mb-4 inline-block">
              {event.tag}
            </span>
          )}
          <h1 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none mb-4">
            {event.title}
          </h1>
          <p className="text-slate-300 text-xl font-light">{eventDate}</p>
        </div>
      </section>

      {/* Event Details */}
      <section className="w-full bg-neutral-dark py-20 px-6 lg:px-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            {event.description && (
              <div>
                <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-4">
                  About This Event
                </h2>
                <p className="text-slate-300 text-lg leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Fight Card */}
            {fightCardBouts.length > 0 && (
              <div>
                <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-6">
                  Fight Card
                </h2>
                <div className="space-y-3">
                  {fightCardBouts.map((bout, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 bg-card-dark border border-white/5 rounded-lg px-6 py-4"
                    >
                      <span className="text-primary font-black text-lg font-display w-8 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-white font-bold uppercase tracking-wide">
                        {bout}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {amenities && amenities.length > 0 && (
              <div>
                <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-6">
                  Amenities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {amenities.map((a, i) => (
                    <div
                      key={a.id ?? i}
                      className="flex items-center gap-3 text-slate-300"
                    >
                      <Icon icon="material-symbols:check-circle" className="text-primary text-xl shrink-0" />
                      <span className="font-medium">{a.amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sponsors */}
            {sponsors && sponsors.length > 0 && (
              <div>
                <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-6">
                  Our Sponsors
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {sponsors.map((s, i) => (
                    <div
                      key={s.id ?? i}
                      className="bg-card-dark border border-white/5 rounded-lg px-4 py-3 text-slate-300 text-sm font-medium text-center"
                    >
                      {s.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Time & Location Card */}
            <div className="bg-card-dark border border-primary/20 rounded-xl p-6 space-y-5">
              <h3 className="text-white font-black uppercase tracking-widest text-sm border-b border-white/10 pb-4">
                Event Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icon icon="material-symbols:calendar-today" className="text-primary text-lg mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-0.5">Date</p>
                    <p className="text-white font-bold">{eventDate}</p>
                  </div>
                </div>
                {doorsOpen && (
                  <div className="flex items-start gap-3">
                    <Icon icon="material-symbols:door-open" className="text-primary text-lg mt-0.5 shrink-0" />
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-0.5">Doors Open</p>
                      <p className="text-white font-bold">{doorsOpen}</p>
                    </div>
                  </div>
                )}
                {fightsStart && (
                  <div className="flex items-start gap-3">
                    <Icon icon="material-symbols:sports-mma" className="text-primary text-lg mt-0.5 shrink-0" />
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-0.5">Fights Start</p>
                      <p className="text-white font-bold">{fightsStart}</p>
                    </div>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-start gap-3">
                    <Icon icon="material-symbols:location-on" className="text-primary text-lg mt-0.5 shrink-0" />
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-0.5">Venue</p>
                      <p className="text-white font-bold">{event.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Card */}
            {pricing && pricing.length > 0 && (
              <div className="bg-card-dark border border-primary/20 rounded-xl p-6 space-y-5">
                <h3 className="text-white font-black uppercase tracking-widest text-sm border-b border-white/10 pb-4">
                  Tickets
                </h3>
                <div className="space-y-3">
                  {pricing.map((row, i) => (
                    <div
                      key={row.id ?? i}
                      className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-white font-bold text-sm">{row.tier}</p>
                        <p className="text-slate-500 text-xs">{row.location}</p>
                      </div>
                      <span className="text-primary font-black text-lg">{row.price}</span>
                    </div>
                  ))}
                </div>
                {ctaHref && (
                  <a
                    href={ctaHref}
                    className="w-full sm:w-auto min-w-[200px] h-14 rounded-lg bg-primary px-8 font-display text-sm font-black uppercase tracking-widest text-white hover:scale-105 transition-transform glow-accent cursor-pointer flex items-center justify-center mt-2"
                  >
                    {event.ctaText || "Get Tickets"}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
