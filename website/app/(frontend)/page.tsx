import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getCoaches, getQuotes, getPhilosophyPillars, getSiteSettings, getPage, getForm, getMedia, getImageUrl } from "@/lib/payload";
import { JoinClubButton } from "@/components/JoinClubButton";
import { generateWebPageSchema, generatePersonSchema, jsonLdScript } from "@/lib/structured-data";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('/');
  if (!page) return {};
  return {
    title: page.seoTitle || 'Gaines Boxing Club',
    description: page.seoDescription || 'Experience the elite training of a 3-time Golden Gloves champion. Where your boxing journey truly begins.',
    openGraph: page.ogImage && typeof page.ogImage === 'object' && 'url' in page.ogImage
      ? { images: [{ url: (page.ogImage as { url: string }).url }] }
      : undefined,
  };
}

export default async function HomePage() {
  const [siteSettings, quotes, coaches, pillars, joinForm, pageData, samGainesImage] = await Promise.all([
    getSiteSettings(),
    getQuotes(1),
    getCoaches(2),
    getPhilosophyPillars(3),
    getForm('Join the Club'),
    getPage('/'),
    getMedia('sam_gaines.png'),
  ]);

  const tagline = siteSettings.tagline || 'Building legacy through discipline, grit, and the relentless pursuit of excellence in the underground boxing circuit.';
  const quote = quotes[0];

  const pageSchema = generateWebPageSchema(pageData, siteSettings, '/', 'Home');
  const coachSchemas = coaches.map((c) => generatePersonSchema(c));
  const pageJsonLd = jsonLdScript([pageSchema, ...coachSchemas]);

  return (
    <>
      {pageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: pageJsonLd }}
        />
      )}
      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] w-full flex-col items-center justify-center px-6 text-center">
        <div className="absolute inset-0 z-0 overflow-hidden bg-background-dark"></div>
        <div className="relative z-20 max-w-4xl space-y-8">
          <span className="inline-block rounded-full bg-primary/20 border border-primary/30 px-4 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            {pageData?.heroTagline || "Est. 1974 \u2022 Elite Underground Training"}
          </span>
          <h1 className="font-display text-5xl font-black uppercase leading-[1.1] tracking-tighter text-white sm:text-7xl lg:text-8xl">
            {pageData?.heroHeading ? (
              <span>{pageData.heroHeading}</span>
            ) : (
              <>Where Your Boxing <br /><span className="text-primary italic">Journey Truly Begins</span></>
            )}
          </h1>
          <p className="mx-auto max-w-2xl font-sans text-lg text-slate-400 leading-relaxed">
            {pageData?.heroSubheading || tagline}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <JoinClubButton formData={joinForm} />
            <Link
              href="/schedule"
              className="w-full sm:w-auto min-w-[200px] h-14 rounded-lg border border-white/10 bg-white/5 px-8 font-display text-sm font-black uppercase tracking-widest text-white hover:bg-white/10 transition-colors backdrop-blur-sm flex items-center justify-center"
            >
              View Schedule
            </Link>
          </div>
        </div>
      </section>

      {/* Legacy Section */}
      <section className="w-full bg-neutral-dark py-24 px-6 lg:px-20 border-y border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-primary"></div>
              <div className="overflow-hidden rounded-xl border border-white/10">
                <Image
                  alt={samGainesImage?.alt || "Sam Gaines Legacy"}
                  className="w-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  src={getImageUrl(samGainesImage, "/images/sam_gaines.png").url}
                  width={600}
                  height={600}
                  priority
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-primary p-6 rounded-lg hidden md:block">
                <p className="font-display text-4xl font-black text-white italic">
                  3X
                </p>
                <p className="font-display text-[10px] font-bold uppercase tracking-widest text-white/80">
                  Golden Gloves Champ
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="font-display text-xs font-bold uppercase tracking-[0.3em] text-primary">
                  The Heritage
                </h2>
                <h3 className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
                  The Legacy of Sam Gaines
                </h3>
              </div>
              <p className="font-sans text-lg text-slate-400 leading-relaxed">
                Rooted in the raw grit of the mid-70s boxing scene, Sam Gaines
                founded this club with a singular vision: to translate the
                discipline of the ring into the architecture of a better life.
              </p>
              <p className="font-sans text-lg text-slate-400 leading-relaxed">
                We don&apos;t just teach you how to throw a punch; we teach you
                how to stand your ground. Our training is a dialogue between the
                body and the mind, refined over decades of professional combat.
              </p>
              
              {quote && (
                <div className="pt-6 border-t border-white/10">
                  <blockquote className="font-display text-xl font-medium italic text-slate-200">
                    &quot;{quote.text}&quot;
                  </blockquote>
                  <p className="mt-2 font-display text-sm font-bold uppercase tracking-widest text-primary">
                    &mdash; {quote.attribution}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Coaches Preview */}
      <section className="w-full py-24 px-6 lg:px-20 bg-background-dark">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center space-y-4">
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.3em] text-primary">
              The Corner
            </h2>
            <h3 className="font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
              Meet Our Elite Coaches
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coaches.map((coach) => {
              const coachImage = getImageUrl(coach.image, '/images/coach_steve.png');
              return (
                <div key={coach.id} className="group relative overflow-hidden rounded-xl border border-white/5 bg-neutral-dark p-6 transition-all hover:border-primary/50">
                  <div className="aspect-4/5 overflow-hidden rounded-lg mb-6">
                    <Image
                      alt={coachImage.alt || coach.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      src={coachImage.url}
                      width={500}
                      height={625}
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display text-2xl font-black uppercase text-white">
                      {coach.name}
                    </h4>
                    <p className="font-display text-xs font-bold uppercase tracking-widest text-primary">
                      {coach.subtitle || coach.role}
                    </p>
                    <p className="font-sans text-sm text-slate-500 leading-relaxed line-clamp-2">
                      {coach.shortBio}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/coaches"
              className="inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest text-white hover:text-primary transition-colors"
            >
              Learn more about our team
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Teaser */}
      <section className="w-full py-24 px-6 lg:px-20 bg-neutral-dark/50">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-display text-6xl font-black uppercase leading-none tracking-tighter text-white">
                The <span className="text-primary">Sweet</span> Science
              </h2>
              <p className="font-sans text-xl text-slate-300 italic border-l-4 border-primary pl-6">
                We believe boxing is the ultimate tool for self-discovery.
              </p>
            </div>
            <div className="space-y-6">
              {pillars.map((pillar) => (
                <div key={pillar.id} className="space-y-2">
                  <h4 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    {pillar.title}
                  </h4>
                  <p className="text-slate-400">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 text-center lg:text-left">
            <Link
              href="/philosophy"
              className="inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest text-primary hover:text-white transition-colors"
            >
              Read our full philosophy
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
