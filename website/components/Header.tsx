"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { navLinks } from "@/lib/navigation";
import { JoinClubButton, type FormDataProp } from "@/components/JoinClubButton";

export default function Header({ formData }: { formData?: FormDataProp }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="w-full border-b border-primary bg-background-dark/95 backdrop-blur-md px-6 md:px-20 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex gap-1 items-center hover:opacity-80 transition-opacity"
          >
            <Icon icon="material-symbols:sports-martial-arts" className="text-primary text-3xl" />
            <h2 className="font-display text-xl font-extrabold tracking-tighter uppercase italic text-white">
              Gaines <span className="text-primary">Boxing</span>
            </h2>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "text-sm font-semibold text-primary border-b-2 border-primary pb-1"
                    : "text-sm font-medium text-slate-400 hover:text-primary transition-colors"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <JoinClubButton
            formData={formData}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-bold text-sm tracking-wide uppercase transition-all glow-accent cursor-pointer"
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
