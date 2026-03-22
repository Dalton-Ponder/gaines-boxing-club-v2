import Image from "next/image";
import type { Metadata } from "next";
import { getCoaches, getQuotes, getPage, getForm, getSiteSettings } from "@/lib/payload";
import { JoinClubButton } from "@/components/JoinClubButton";
import { CoachBioModalButton } from "@/components/CoachBioModalButton";
import { generateWebPageSchema, generatePersonSchema, jsonLdScript } from "@/lib/structured-data";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('/coaches');
  if (!page) return { title: 'Coaches | Gaines Boxing Club' };
  return {
    title: page.seoTitle || 'Coaches | Gaines Boxing Club',
    description: page.seoDescription || 'Elite leadership continuing the legacy of Sam Gaines with high-contrast expertise, raw power, and the wisdom of the ring.',
  };
}

export default async function CoachesPage() {
  const [coaches, quotes, joinForm, siteSettings, pageData] = await Promise.all([
    getCoaches(),
    getQuotes(2),
    getForm('Join the Club'),
    getSiteSettings(),
    getPage('/coaches'),
  ]);

  const quote = quotes[1] ?? quotes[0];
  const pageSchema = generateWebPageSchema(pageData, siteSettings, '/coaches', 'Coaches');
  const personSchemas = coaches.map((c) => generatePersonSchema(c));
  const pageJsonLd = jsonLdScript([pageSchema, ...personSchemas]);

  return (
    <>
      {pageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: pageJsonLd }}
        />
      )}
      {/* Hero */}
      <section className="w-full relative h-[70vh] flex items-center justify-center overflow-hidden bg-background-dark border-b border-primary/20">
        <div className="absolute inset-0 bg-linear-to-t from-background-dark via-transparent to-transparent"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <span className="text-primary font-bold tracking-[0.3em] uppercase mb-4 block">
            {pageData?.heroTagline || "The Vanguard"}
          </span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase italic leading-none">
            {pageData?.heroHeading ? (
              <span>{pageData.heroHeading}</span>
            ) : (
              <>Meet the <br /><span className="text-primary">Coaches</span></>
            )}
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            {pageData?.heroSubheading || "Elite leadership continuing the legacy of Sam Gaines with high-contrast expertise, raw power, and the wisdom of the ring."}
          </p>
        </div>
      </section>

      {/* Coach Cards */}
      <section className="w-full bg-neutral-dark py-24 px-6 lg:px-20 border-y border-white/5">
        <div className="mx-auto max-w-6xl flex flex-col gap-12">
          <div className="flex items-center gap-4">
            <h2 className="text-white text-3xl font-extrabold tracking-tight">
              The Leadership
            </h2>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coaches.map((coach) => {
              const coachImage = coach.image && typeof coach.image === 'object' && 'url' in coach.image ? coach.image as { url?: string; alt?: string } : null;
              
              return (
                <div key={coach.id} className="group relative flex flex-col gap-6 rounded-xl bg-card-dark p-1 border border-primary/20 hover:border-primary/50 transition-all duration-500 shadow-2xl">
                  <div className="relative overflow-hidden rounded-lg aspect-4/3">
                    <div className="absolute inset-0 bg-linear-to-t from-card-dark via-transparent to-transparent z-10"></div>
                    <Image
                      alt={coachImage?.alt || coach.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                      src={coachImage?.url || "/images/coach_steve.png"}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="px-6 pb-8 flex flex-col gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-primary text-sm font-bold tracking-widest uppercase">
                          {coach.title || coach.role}
                        </p>
                        <span className="material-symbols-outlined text-primary/40">
                          {coach.sortOrder === 1 ? 'military_tech' : 'history_edu'}
                        </span>
                      </div>
                      <h3 className="text-white text-3xl font-black uppercase italic group-hover:text-primary transition-colors">
                        {coach.name}
                      </h3>
                      <p className="text-slate-400 text-sm font-medium mt-1">
                        {coach.subtitle || coach.role}
                      </p>
                    </div>
                    <p className="text-slate-300 text-base leading-relaxed font-light line-clamp-4">
                      {coach.shortBio}
                    </p>
                    <CoachBioModalButton
                      coach={coach}
                      className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider group/btn w-fit mt-2 cursor-pointer"
                    >
                      View Full Bio
                      <span className="material-symbols-outlined text-primary group-hover/btn:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </CoachBioModalButton>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-24 h-24 bg-primary/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quote CTA */}
      <section className="w-full bg-background-dark py-24 px-6 lg:px-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="p-10 rounded-2xl bg-linear-to-b from-primary/10 to-transparent border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/20 blur-[80px]"></div>
            <h4 className="text-white text-2xl font-bold mb-4 italic">
              &quot;{quote?.text || "True champions are built in the shadows."}&quot;
            </h4>
            <p className="text-slate-400 mb-8">&mdash; {quote?.attribution || "Sam Gaines"}</p>
            <JoinClubButton
              formData={joinForm}
              className="bg-white text-background-dark px-10 py-4 rounded-lg font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl cursor-pointer"
            >
              Train with the best
            </JoinClubButton>
          </div>
        </div>
      </section>
    </>
  );
}
