"use client";

import Image from "next/image";
import { useModal } from "@/components/ModalProvider";

export default function CoachesPage() {
  const { open } = useModal();

  const openBioModal = (coach: "steve" | "jesse") => {
    const bios = {
      steve: {
        subtitle: "Head Coach",
        title: <>Steve <span style={{color:'#c14e01'}}>Thompson</span></>,
        body: (
          <div>
            <p style={{ marginBottom: "1rem" }}>
              With over 20 years in the heavy-weight circuit, Steve Thompson
              brings a scientific approach to raw power. His training regimens
              are legendary for building both the body and the unbreakable
              spirit required for the championship rounds.
            </p>
            <p style={{ marginBottom: "1rem" }}>
              Steve began his boxing career at age 14 in the Southside amateur
              leagues, quickly rising through the ranks to become a two-time
              regional Golden Gloves finalist. After a brief professional career
              (12-2), he transitioned to coaching under the mentorship of Sam
              Gaines himself.
            </p>
            <p style={{ marginBottom: "1rem" }}>
              Today, Steve leads all advanced striking sessions and personal
              development programs at Gaines Boxing Club. His philosophy centers
              on the belief that physical prowess is inseparable from mental
              discipline.
            </p>
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                paddingTop: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <p
                style={{
                  color: "#c14e01",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom: "0.5rem",
                }}
              >
                Certifications &amp; Honors
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                <li
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px", color: "#c14e01" }}
                  >
                    verified
                  </span>{" "}
                  USA Boxing Level 3 Coach
                </li>
                <li
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px", color: "#c14e01" }}
                  >
                    verified
                  </span>{" "}
                  2x Regional Golden Gloves Finalist
                </li>
                <li
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px", color: "#c14e01" }}
                  >
                    verified
                  </span>{" "}
                  NSCA Certified Strength Coach
                </li>
              </ul>
            </div>
          </div>
        ),
        size: "lg" as const,
      },
      jesse: {
        subtitle: "Legacy Coach",
        title: <>Jesse <span style={{color:'#c14e01'}}>Bryan</span></>,
        body: (
          <div>
            <p style={{ marginBottom: "1rem" }}>
              A direct prot&eacute;g&eacute; of Sam Gaines, Jesse Bryan is the
              guardian of the &quot;Gaines Style.&quot; His focus is on the
              intricate dance of footwork and the precision of the
              counter-punch, keeping the club&apos;s technical DNA alive for the
              next generation.
            </p>
            <p style={{ marginBottom: "1rem" }}>
              Jesse grew up in the gym, first walking through the doors at age
              10. Sam Gaines saw something special in his timing and footwork,
              and personally mentored him for over 15 years. Jesse competed in
              47 amateur bouts (41-6) before dedicating himself fully to
              coaching.
            </p>
            <p style={{ marginBottom: "1rem" }}>
              As the Technical Lead, Jesse oversees all fundamentals classes,
              youth programs, and the club&apos;s signature &quot;Sweet
              Science&quot; curriculum &mdash; a training methodology that
              emphasizes reading opponents, ring generalship, and the art of
              the counter-punch.
            </p>
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                paddingTop: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <p
                style={{
                  color: "#c14e01",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginBottom: "0.5rem",
                }}
              >
                Certifications &amp; Honors
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                <li
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px", color: "#c14e01" }}
                  >
                    verified
                  </span>{" "}
                  USA Boxing Level 2 Coach
                </li>
                <li
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px", color: "#c14e01" }}
                  >
                    verified
                  </span>{" "}
                  41-6 Amateur Record
                </li>
                <li
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px", color: "#c14e01" }}
                  >
                    verified
                  </span>{" "}
                  Sam Gaines Personal Prot&eacute;g&eacute;
                </li>
              </ul>
            </div>
          </div>
        ),
        size: "lg" as const,
      },
    };
    const data = bios[coach];
    if (!data) return;
    open(data);
  };

  return (
    <>
      {/* Hero */}
      <section className="w-full relative h-[70vh] flex items-center justify-center overflow-hidden bg-background-dark border-b border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <span className="text-primary font-bold tracking-[0.3em] uppercase mb-4 block">
            The Vanguard
          </span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase italic leading-none">
            Meet the <br />
            <span className="text-primary">Coaches</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Elite leadership continuing the legacy of Sam Gaines with
            high-contrast expertise, raw power, and the wisdom of the ring.
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
            <div className="flex-1 h-[1px] bg-slate-800"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Steve Thompson */}
            <div className="group relative flex flex-col gap-6 rounded-xl bg-card-dark p-1 border border-primary/20 hover:border-primary/50 transition-all duration-500 shadow-2xl">
              <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
                <div className="absolute inset-0 bg-gradient-to-t from-card-dark via-transparent to-transparent z-10"></div>
                <Image
                  alt="Head coach Steve Thompson"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  src="/images/coach_steve.png"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="px-6 pb-8 flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-primary text-sm font-bold tracking-widest uppercase">
                      Master Elite
                    </p>
                    <span className="material-symbols-outlined text-primary/40">
                      military_tech
                    </span>
                  </div>
                  <h3 className="text-white text-3xl font-black uppercase italic group-hover:text-primary transition-colors">
                    Steve Thompson
                  </h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">
                    Head Coach | Physical Prowess &amp; Skill Development
                  </p>
                </div>
                <p className="text-slate-300 text-base leading-relaxed font-light">
                  With over 20 years in the heavy-weight circuit, Steve brings a
                  scientific approach to raw power. His training regimens are
                  legendary for building both the body and the unbreakable
                  spirit required for the championship rounds.
                </p>
                <button
                  onClick={() => openBioModal("steve")}
                  className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider group/btn w-fit mt-2 cursor-pointer"
                >
                  View Full Bio
                  <span className="material-symbols-outlined text-primary group-hover/btn:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
              <div className="absolute -bottom-1 -right-1 w-24 h-24 bg-primary/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* Jesse Bryan */}
            <div className="group relative flex flex-col gap-6 rounded-xl bg-card-dark p-1 border border-primary/20 hover:border-primary/50 transition-all duration-500 shadow-2xl">
              <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
                <div className="absolute inset-0 bg-gradient-to-t from-card-dark via-transparent to-transparent z-10"></div>
                <Image
                  alt="Legacy coach Jesse Bryan"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  src="/images/coach_jesse.png"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="px-6 pb-8 flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-primary text-sm font-bold tracking-widest uppercase">
                      Legacy Coach
                    </p>
                    <span className="material-symbols-outlined text-primary/40">
                      history_edu
                    </span>
                  </div>
                  <h3 className="text-white text-3xl font-black uppercase italic group-hover:text-primary transition-colors">
                    Jesse Bryan
                  </h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">
                    Technical Lead | The Sweet Science
                  </p>
                </div>
                <p className="text-slate-300 text-base leading-relaxed font-light">
                  A direct prot&eacute;g&eacute; of Sam Gaines, Jesse is the
                  guardian of the &quot;Gaines Style.&quot; His focus is on the
                  intricate dance of footwork and the precision of the
                  counter-punch, keeping the club&apos;s technical DNA alive for
                  the next generation.
                </p>
                <button
                  onClick={() => openBioModal("jesse")}
                  className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider group/btn w-fit mt-2 cursor-pointer"
                >
                  View Full Bio
                  <span className="material-symbols-outlined text-primary group-hover/btn:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>
              <div className="absolute -bottom-1 -right-1 w-24 h-24 bg-primary/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote CTA */}
      <section className="w-full bg-background-dark py-24 px-6 lg:px-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="p-10 rounded-2xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/20 blur-[80px]"></div>
            <h4 className="text-white text-2xl font-bold mb-4 italic">
              &quot;True champions are built in the shadows.&quot;
            </h4>
            <p className="text-slate-400 mb-8">&mdash; Sam Gaines</p>
            <button className="bg-white text-background-dark px-10 py-4 rounded-lg font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl">
              Train with the best
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
