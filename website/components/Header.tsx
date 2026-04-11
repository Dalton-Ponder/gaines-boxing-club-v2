"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { navLinks } from "@/lib/navigation";
import { JoinClubButton, type FormDataProp } from "@/components/JoinClubButton";
import Image from "next/image";

export default function Header({ 
  formData, 
  logo, 
  siteName,
  trainingSchedule = []
}: { 
  formData?: FormDataProp; 
  logo?: { url: string; alt?: string };
  siteName?: string;
  trainingSchedule?: any[];
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="w-full border-b border-primary bg-background-dark/95 backdrop-blur-md px-6 md:px-20 pt-4 pb-7">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex gap-2 items-center hover:opacity-80 transition-opacity"
          >
            {logo?.url ? (
              <div className="relative h-[65px] w-[174px] md:h-[76px] md:w-[218px]">
                <Image
                  src={logo.url}
                  alt={logo.alt || siteName || "Gaines Boxing Club"}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <h2 className="font-display text-xl font-extrabold tracking-tighter uppercase italic text-white underline decoration-primary decoration-4 underline-offset-4">
                {siteName ? (
                  <>
                    {siteName.split(' ')[0]} <span className="text-primary">{siteName.split(' ').slice(1).join(' ')}</span>
                  </>
                ) : (
                  <>
                    Gaines <span className="text-primary">Boxing</span>
                  </>
                )}
              </h2>
            )}
          </Link>
        </div>
        <div className="hidden md:flex flex-col items-center gap-6">
          {/* Desktop-only Training Schedule - integrated to save height */}
          {trainingSchedule.length > 0 && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em]">
                <span className="flex items-center gap-1 text-primary font-black">
                  <Icon
                    icon="material-symbols:schedule"
                    className="text-xs"
                    aria-hidden="true"
                  />
                  Schedule
                </span>
                <div className="flex items-center gap-3 text-slate-500">
                  {trainingSchedule.map((slot, i) => (
                    <span key={slot.id} className="flex items-center gap-2 transition-colors hover:text-slate-300">
                      {i > 0 && (
                        <span className="text-white/10 select-none font-normal" aria-hidden="true">
                          |
                        </span>
                      )}
                      <span className="font-bold text-slate-300">{slot.day}</span>
                      <span className="tabular-nums">
                        {slot.startTime}&ndash;{slot.endTime}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              {/* Faded Divider */}
              <div className="w-full max-w-[300px] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          )}
          
          <nav className="flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isActive
                      ? "text-xs font-bold text-primary border-b-2 border-primary pb-0.5 uppercase tracking-widest transition-all"
                      : "text-xs font-bold text-slate-400 border-b-2 border-transparent hover:text-primary pb-0.5 transition-all uppercase tracking-widest"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <JoinClubButton
            formData={formData}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-bold text-sm tracking-wide uppercase transition-all glow-accent cursor-pointer whitespace-nowrap"
          >
            Join Club
          </JoinClubButton>
          {/* Mobile hamburger button */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg border border-white/10 bg-white/5 cursor-pointer"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-nav"
            aria-label="Toggle navigation menu"
          >
            <Icon icon={isMobileOpen ? "material-symbols:close" : "material-symbols:menu"} className="text-white text-xl" />
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {isMobileOpen && (
        <nav
          id="mobile-nav"
          className="md:hidden absolute top-full left-0 right-0 bg-background-dark/98 backdrop-blur-md border-b border-primary/30 px-6 py-6"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={
                    isActive
                      ? "text-base font-semibold text-primary border-l-2 border-primary pl-4 py-2"
                      : "text-base font-medium text-slate-400 hover:text-primary transition-colors pl-4 py-2"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
