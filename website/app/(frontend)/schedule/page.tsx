import Image from "next/image";
import type { Metadata } from "next";
import { getEvents, getTrainingSchedule, getPage, getSiteSettings, getSafeImageUrl } from "@/lib/payload";
import { generateWebPageSchema, generateEventSchema, jsonLdScript } from "@/lib/structured-data";
import { Icon } from "@iconify/react";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('/schedule');
  if (!page) return { title: 'Schedule & Events | Gaines Boxing Club' };
  return {
    title: page.seoTitle || 'Schedule & Events | Gaines Boxing Club',
    description: page.seoDescription || 'Experience the raw grit and underground prestige of Gaines Boxing. From professional training windows to high-stakes match nights.',
  };
}

export default async function SchedulePage() {
  const [trainingHours, { featured: featuredEvent, regular: regularEvents, all: allEvents }, siteSettings, pageData] = await Promise.all([
    getTrainingSchedule(),
    getEvents(),
    getSiteSettings(),
    getPage('/schedule'),
  ]);

  const pageSchema = generateWebPageSchema(pageData, siteSettings, '/schedule', 'Schedule & Events');
  const eventSchemas = allEvents.map((e) => generateEventSchema(e));
  const pageJsonLd = jsonLdScript([pageSchema, ...eventSchemas]);

  return (
    <>
      {pageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: pageJsonLd }}
        />
      )}
      {/* Hero */}
      <section className="relative w-full py-32 lg:py-40 flex items-center justify-center overflow-hidden bg-background-dark">
        <div className="absolute inset-0 z-0 bg-background-dark"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <span className="text-primary font-bold uppercase tracking-[0.3em] text-sm mb-4 block">
            {pageData?.heroTagline || "Gaines Club Calendar"}
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6">
            {pageData?.heroHeading ? (
              <span>{pageData.heroHeading}</span>
            ) : (
              <>Schedule <span className="text-primary">&amp;</span> Events</>
            )}
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            {pageData?.heroSubheading || "Experience the raw grit and underground prestige of Gaines Boxing. From professional training windows to high-stakes match nights."}
          </p>
        </div>
      </section>

      {/* Training Hours */}
      {trainingHours.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 pb-20">
          <div className="bg-card-dark border border-primary/20 glow-accent rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Icon icon="material-symbols:schedule" className="text-primary" />
                <h2 className="text-2xl font-bold uppercase tracking-tight text-white">Training Hours</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {trainingHours.map((session) => (
                  <div key={session.id} className="border-l-4 border-primary pl-4">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{session.day}</p>
                    <p className="text-3xl font-black text-white tracking-tighter italic">
                      {session.startTime} &mdash; {session.endTime}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-auto">
              <button type="button" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-10 py-5 rounded-lg transition-all flex items-center justify-center gap-3">
                Book a Session
                <Icon icon="material-symbols:trending-flat" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Event */}
      {featuredEvent && (
        <section className="w-full bg-neutral-dark py-24 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative overflow-hidden rounded-lg group min-h-[400px]">
              {(() => {
                const rawUrl = featuredEvent.image && typeof featuredEvent.image === 'object' && 'url' in featuredEvent.image ? (featuredEvent.image as { url?: string }).url : null;
                let eventImage = '/images/event_main.png';
                if (rawUrl) {
                  try {
                    const parsed = new URL(rawUrl, 'http://localhost');
                    if (['http:', 'https:'].includes(parsed.protocol) || rawUrl.startsWith('/')) {
                      eventImage = rawUrl;
                    }
                  } catch {
                    // Invalid URL -- use fallback
                  }
                }
                return (
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-105" 
                    style={{ 
                      backgroundImage: `linear-gradient(to right, rgba(18, 11, 7, 1) 20%, rgba(18, 11, 7, 0.4) 100%), url('${eventImage}')` 
                    }}
                  ></div>
                );
              })()}
              <div className="relative z-10 p-10 md:p-16 lg:p-24 flex flex-col items-start max-w-2xl">
                <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded mb-6">Upcoming Main Event</span>
                <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
                  {featuredEvent.title}
                </h3>
                <div className="flex flex-wrap items-center gap-8 mb-10">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Date</span>
                    <span className="text-xl font-bold text-white uppercase">
                      {new Date(featuredEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="w-px h-10 bg-white/10"></div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Location</span>
                    <span className="text-xl font-bold text-white uppercase">{featuredEvent.location}</span>
                  </div>
                </div>
                {featuredEvent.ctaLink ? (
                  <a href={featuredEvent.ctaLink} className="bg-white hover:bg-slate-200 text-black font-black uppercase tracking-widest px-8 py-4 rounded transition-all inline-block">
                    {featuredEvent.ctaText || 'Register to Attend'}
                  </a>
                ) : (
                  <button type="button" className="bg-white hover:bg-slate-200 text-black font-black uppercase tracking-widest px-8 py-4 rounded transition-all">
                    {featuredEvent.ctaText || 'Register to Attend'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Fight Card Grid */}
      {regularEvents.length > 0 && (
        <section className="w-full bg-background-dark py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Fight Card</h2>
                <p className="text-slate-500 font-medium">Upcoming local matches and sparring sessions</p>
              </div>
              <button type="button" className="text-primary text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all cursor-pointer">
                View Archive <Icon icon="material-symbols:east" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularEvents.map((event) => {
                const safeUrl = getSafeImageUrl(event.image, "/images/placeholder.png");
                return (
                  <div key={event.id} className="bg-card-dark border border-white/5 hover:border-primary/40 rounded-lg overflow-hidden flex flex-col transition-all group">
                    <div className="h-48 overflow-hidden relative">
                      <Image 
                        className="w-full h-full object-cover transition-all duration-500" 
                        src={safeUrl} 
                        alt={event.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 33vw" 
                      />
                    </div>
                    <div className="p-6 bg-card-dark grow flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-primary text-xs font-black uppercase tracking-widest">{event.tag}</span>
                        <span className="text-slate-400 text-xs font-bold">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-white uppercase mb-2">{event.title}</h4>
                      <p className="text-slate-500 text-sm mb-6 line-clamp-2">{event.description}</p>
                      <div className="mt-auto">
                        {event.ctaLink ? (
                          <a href={event.ctaLink} className="w-full border border-white/10 hover:border-primary hover:text-primary py-2 text-xs font-black uppercase tracking-widest transition-all block text-center">
                            {event.ctaText || 'Details'}
                          </a>
                        ) : (
                          <button type="button" className="w-full border border-white/10 hover:border-primary hover:text-primary py-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer">
                            {event.ctaText || 'Details'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
