import Link from "next/link";
import type { Metadata } from "next";
import { getPhilosophyPillars, getPage, getSiteSettings } from "@/lib/payload";
import { generateWebPageSchema, jsonLdScript } from "@/lib/structured-data";
import { Icon } from "@iconify/react";

/** Resolves a CMS icon name to an Iconify icon ID. Handles both full IDs and legacy bare names. */
function resolveIconName(name: string): string {
  if (!name) return "material-symbols:local-fire-department";
  return name.includes(":") ? name : `material-symbols:${name.replace(/_/g, "-")}`;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('/philosophy');
  if (!page) return { title: 'Philosophy | Gaines Boxing Club' };
  return {
    title: page.seoTitle || 'Philosophy | Gaines Boxing Club',
    description: page.seoDescription || 'Beyond the ring, we forge character. Discover the uncompromising training standards that define Gaines Boxing Club.',
  };
}

export default async function PhilosophyPage() {
  const [pillars, siteSettings, pageData] = await Promise.all([
    getPhilosophyPillars(),
    getSiteSettings(),
    getPage('/philosophy'),
  ]);

  const pageSchema = generateWebPageSchema(pageData, siteSettings, '/philosophy', 'Philosophy');
  const pageJsonLd = jsonLdScript([pageSchema]);

  return (
    <>
      {pageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: pageJsonLd }}
        />
      )}
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-background-dark"></div>
        <div className="relative z-20 text-center max-w-4xl px-6">
          <span className="inline-block text-primary font-bold tracking-[0.4em] uppercase mb-4 text-sm">
            {pageData?.heroTagline || "Established MCMLXXIV"}
          </span>
          <h1 className="text-white text-6xl md:text-8xl font-black leading-tight tracking-tighter uppercase mb-6">
            {pageData?.heroHeading ? (
              <span>{pageData.heroHeading}</span>
            ) : (
              <>The Sweet <br /><span className="text-primary italic">Science</span></>
            )}
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-10">
            {pageData?.heroSubheading || "Beyond the ring, we forge character. Discover the uncompromising training standards that define Gaines Boxing Club."}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/schedule"
              className="inline-flex items-center justify-center w-full sm:w-auto min-w-[200px] h-14 rounded-lg bg-primary px-8 font-display text-sm font-black uppercase tracking-widest text-white hover:scale-105 transition-transform glow-accent"
            >
              Start Your Journey
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Statement */}
      <section className="w-full bg-neutral-dark py-24 px-6 lg:px-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-white text-4xl md:text-6xl font-black leading-[1.1] tracking-tighter mb-8">
                Not just fitness.<br /><span className="text-primary">A thrilling journey</span> <br />of self-discovery.
              </h2>
            </div>
            <div className="space-y-6">
              <p className="text-slate-400 text-xl font-light leading-relaxed">
                Gaines Philosophy is rooted in technical mastery, unwavering discipline, and the relentless pursuit of self-improvement. We don&apos;t just teach you how to hit; we teach you how to think, move, and endure.
              </p>
              <p className="text-slate-400 text-xl font-light leading-relaxed border-l-2 border-primary/40 pl-6 italic">
                &quot;In the ring, there is no place to hide. The science of boxing reveals the true strength of a human being&apos;s spirit.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Training Pillars */}
      <section className="w-full bg-background-dark py-24 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h3 className="text-primary font-bold tracking-[0.3em] uppercase text-sm mb-2">The Pillars</h3>
            <h2 className="text-white text-4xl font-black tracking-tighter uppercase">Training Experience</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar) => (
              <div key={pillar.id} className="group flex flex-col gap-6 rounded-lg border border-white/5 bg-neutral-dark p-8 transition-all hover:border-primary/50">
                <div className="text-primary">
                  <Icon
                    icon={resolveIconName(pillar.icon || "local-fire-department")}
                    className="text-4xl group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <h4 className="text-white text-xl font-bold uppercase tracking-tight">{pillar.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-light">{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-neutral-dark py-32 px-6 lg:px-20 border-y border-white/5 text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-primary/5"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase mb-6">Ready to start your legacy?</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto font-light">Join the elite ranks of Gaines Boxing Club today and experience the difference of professional-grade training.</p>
          <Link
            href="/schedule"
            className="inline-flex items-center justify-center w-full sm:w-auto min-w-[200px] h-14 rounded-lg bg-primary px-8 font-display text-sm font-black uppercase tracking-widest text-white hover:scale-105 transition-transform glow-accent"
          >
            View Schedule
          </Link>
        </div>
      </section>
    </>
  );
}
