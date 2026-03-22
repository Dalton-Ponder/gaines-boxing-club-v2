"use client";

import Image from "next/image";
import Link from "next/link";
import { useModal } from "@/components/ModalProvider";
import JoinModalBody from "@/components/JoinModalBody";

export default function LegacyPage() {
  const { open, close } = useModal();

  const openJoinModal = () => {
    open({
      subtitle: "Become a Member",
      title: <>Join the <span style={{color:'#c14e01'}}>Club</span></>,
      body: <JoinModalBody onClose={close} />,
    });
  };

  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-background-dark">
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <span className="text-primary font-bold tracking-[0.3em] uppercase mb-4 block">
            Established 1974
          </span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase italic leading-none">
            A 50-Year <br />
            <span className="text-primary">Legacy</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Forged in the underground. Hardened by the streets. Built on grit,
            sweat, and the absolute pursuit of greatness.
          </p>
        </div>
      </section>

      {/* Founder Section */}
      <section id="founder" className="w-full bg-neutral-dark py-24 px-6 lg:px-20 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute -inset-2 border-2 border-primary rounded-lg opacity-50"></div>
              <div className="aspect-[4/5] bg-card-dark rounded-lg overflow-hidden border border-white/10 relative">
                <Image
                  alt="Sam Gaines Legacy"
                  className="w-full h-full object-cover grayscale contrast-125"
                  src="/images/sam_gaines.png"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
                  <h3 className="text-3xl font-bold italic">Sam Gaines</h3>
                  <p className="text-primary font-semibold tracking-widest uppercase text-sm">
                    The Founder
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-4 italic">
                  The Man Who{" "}
                  <span className="text-primary">Started It All</span>
                </h2>
                <p className="text-slate-400 leading-relaxed text-lg">
                  Before the lights and the professional rings, there was a
                  Southside basement with a single heavy bag and a vision. Sam
                  Gaines didn&apos;t just teach boxing; he taught survival.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card-dark p-6 rounded-lg border border-primary/30">
                  <p className="text-primary text-xs font-bold uppercase mb-1">
                    Golden Gloves
                  </p>
                  <p className="text-2xl font-black">1967-69</p>
                  <p className="text-slate-500 text-xs">Champion</p>
                </div>
                <div className="bg-card-dark p-6 rounded-lg border border-primary/30">
                  <p className="text-primary text-xs font-bold uppercase mb-1">
                    Pro Record
                  </p>
                  <p className="text-2xl font-black">24-0-2</p>
                  <p className="text-slate-500 text-xs">Undefeated</p>
                </div>
                <div className="bg-card-dark p-6 rounded-lg border border-primary/30">
                  <p className="text-primary text-xs font-bold uppercase mb-1">
                    Years Active
                  </p>
                  <p className="text-2xl font-black">45+</p>
                  <p className="text-slate-500 text-xs">Coaching</p>
                </div>
              </div>
              <Link
                href="/legacy#founder"
                className="flex items-center gap-2 text-white font-bold bg-white/5 hover:bg-primary border border-white/10 hover:border-primary px-8 py-4 rounded-lg transition-all w-fit"
              >
                <span>Read Full Biography</span>
                <span className="material-symbols-outlined">
                  arrow_right_alt
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="w-full bg-background-dark py-24 px-6 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">
              The <span className="text-primary">Journey</span>
            </h2>
            <div className="h-1 w-24 bg-primary mx-auto mt-4"></div>
          </div>
          <div className="relative">
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-px bg-white/10"></div>
            <div className="relative z-10 space-y-24">
              {/* 1974 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 md:text-right">
                  <span className="text-primary text-4xl font-black italic">
                    1974
                  </span>
                  <h4 className="text-xl font-bold mt-2">The Basement Era</h4>
                  <p className="text-slate-400 mt-2">
                    Opened in a 400sq ft basement in the Southside. No heaters,
                    just heart.
                  </p>
                </div>
                <div className="size-10 bg-primary rounded-full flex items-center justify-center glow-accent border-4 border-background-dark">
                  <span className="material-symbols-outlined text-white text-sm">
                    home
                  </span>
                </div>
                <div className="flex-1 hidden md:block"></div>
              </div>
              {/* 1988 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="flex-1 text-left">
                  <span className="text-primary text-4xl font-black italic">
                    1988
                  </span>
                  <h4 className="text-xl font-bold mt-2">
                    Regional Domination
                  </h4>
                  <p className="text-slate-400 mt-2">
                    Produced first National Golden Gloves champion. The gym
                    moves to a warehouse facility.
                  </p>
                </div>
                <div className="size-10 bg-primary rounded-full flex items-center justify-center glow-accent border-4 border-background-dark">
                  <span className="material-symbols-outlined text-white text-sm">
                    workspace_premium
                  </span>
                </div>
                <div className="flex-1 hidden md:block"></div>
              </div>
              {/* 2005 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 md:text-right">
                  <span className="text-primary text-4xl font-black italic">
                    2005
                  </span>
                  <h4 className="text-xl font-bold mt-2">
                    The Pro Transition
                  </h4>
                  <p className="text-slate-400 mt-2">
                    Gaines Boxing becomes the official training ground for three
                    world-title contenders.
                  </p>
                </div>
                <div className="size-10 bg-primary rounded-full flex items-center justify-center glow-accent border-4 border-background-dark">
                  <span className="material-symbols-outlined text-white text-sm">
                    sports_kabaddi
                  </span>
                </div>
                <div className="flex-1 hidden md:block"></div>
              </div>
              {/* Today */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="flex-1 text-left">
                  <span className="text-primary text-4xl font-black italic">
                    Today
                  </span>
                  <h4 className="text-xl font-bold mt-2">
                    The Modern Institution
                  </h4>
                  <p className="text-slate-400 mt-2">
                    A state-of-the-art facility maintaining the same gritty
                    philosophy of 1974.
                  </p>
                </div>
                <div className="size-10 bg-primary rounded-full flex items-center justify-center glow-accent border-4 border-background-dark">
                  <span className="material-symbols-outlined text-white text-sm">
                    location_city
                  </span>
                </div>
                <div className="flex-1 hidden md:block"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-neutral-dark py-24 px-6 lg:px-20 border-y border-white/5 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase leading-tight">
            Ready to add your name to{" "}
            <span className="text-primary">our history?</span>
          </h2>
          <p className="text-slate-400 text-lg">
            We don&apos;t just train boxers; we build legends. Join the ranks of
            the elite today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={openJoinModal}
              className="bg-primary text-white px-10 py-4 rounded-lg font-black uppercase tracking-widest hover:scale-105 transition-transform glow-accent cursor-pointer"
            >
              Start Training
            </button>
            <Link
              href="/schedule"
              className="bg-white/5 border border-white/10 text-white px-10 py-4 rounded-lg font-black uppercase tracking-widest hover:bg-white/10 transition-colors inline-block"
            >
              View Schedule
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
