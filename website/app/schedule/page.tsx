import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule & Events | Gaines Boxing Club",
  description: "Experience the raw grit and underground prestige of Gaines Boxing. From professional training windows to high-stakes match nights.",
};

export default function SchedulePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative w-full py-32 lg:py-40 flex items-center justify-center overflow-hidden bg-background-dark">
        <div className="absolute inset-0 z-0 bg-background-dark"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <span className="text-primary font-bold uppercase tracking-[0.3em] text-sm mb-4 block">Gaines Club Calendar</span>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6">
            Schedule <span className="text-primary">&amp;</span> Events
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Experience the raw grit and underground prestige of Gaines Boxing. From professional training windows to high-stakes match nights.
          </p>
        </div>
      </section>

      {/* Training Hours */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-20 pb-20">
        <div className="bg-card-dark border border-primary/20 glow-accent rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary">schedule</span>
              <h2 className="text-2xl font-bold uppercase tracking-tight text-white">Training Hours</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Mondays</p>
                <p className="text-3xl font-black text-white tracking-tighter italic">5PM &mdash; 8PM</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Thursdays</p>
                <p className="text-3xl font-black text-white tracking-tighter italic">6PM &mdash; 8PM</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <button className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest px-10 py-5 rounded-lg transition-all flex items-center justify-center gap-3">
              Book a Session
              <span className="material-symbols-outlined">trending_flat</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Event */}
      <section className="w-full bg-neutral-dark py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative overflow-hidden rounded-lg group min-h-[400px]">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "linear-gradient(to right, rgba(18, 11, 7, 1) 20%, rgba(18, 11, 7, 0.4) 100%), url('/images/event_main.png')" }}></div>
            <div className="relative z-10 p-10 md:p-16 lg:p-24 flex flex-col items-start max-w-2xl">
              <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded mb-6">Upcoming Main Event</span>
              <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-6">
                Golden Gloves <br /><span className="text-primary italic">Qualifier</span>
              </h3>
              <div className="flex flex-wrap items-center gap-8 mb-10">
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Date</span>
                  <span className="text-xl font-bold text-white uppercase">OCT 24, 2026</span>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Location</span>
                  <span className="text-xl font-bold text-white uppercase">Underground Arena</span>
                </div>
              </div>
              <button className="bg-white hover:bg-slate-200 text-black font-black uppercase tracking-widest px-8 py-4 rounded transition-all">Register to Attend</button>
            </div>
          </div>
        </div>
      </section>

      {/* Fight Card Grid */}
      <section className="w-full bg-background-dark py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Fight Card</h2>
              <p className="text-slate-500 font-medium">Upcoming local matches and sparring sessions</p>
            </div>
            <button className="text-primary text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
              View Archive <span className="material-symbols-outlined">east</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { img: "/images/event_fight.png", tag: "Local Spar", date: "Sept 12", title: "Heavyweight Rumble", desc: "Monthly heavyweight showcase featuring top tier local talent and upcoming club members.", cta: "Details" },
              { img: "/images/event_workshop.png", tag: "Workshop", date: "Sept 18", title: "Master Footwork", desc: "A technical workshop focused on defensive agility and ring control techniques.", cta: "Join Waitlist" },
              { img: "/images/event_exhibition.png", tag: "Exhibition", date: "Oct 05", title: "Young Bloods VII", desc: "Under-21 exhibition matches showcasing the future champions of Gaines Boxing Club.", cta: "Get Tickets" },
            ].map((event) => (
              <div key={event.title} className="bg-card-dark border border-white/5 hover:border-primary/40 rounded-lg overflow-hidden flex flex-col transition-all group">
                <div className="h-48 overflow-hidden relative">
                  <Image className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src={event.img} alt={event.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="p-6 bg-card-dark">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-primary text-xs font-black uppercase tracking-widest">{event.tag}</span>
                    <span className="text-slate-400 text-xs font-bold">{event.date}</span>
                  </div>
                  <h4 className="text-xl font-bold text-white uppercase mb-2">{event.title}</h4>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2">{event.desc}</p>
                  <button className="w-full border border-white/10 hover:border-primary hover:text-primary py-2 text-xs font-black uppercase tracking-widest transition-all">{event.cta}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
