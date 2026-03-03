"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModal } from "./ModalProvider";
import JoinModalBody from "./JoinModalBody";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/legacy", label: "Legacy" },
  { href: "/coaches", label: "Coaches" },
  { href: "/philosophy", label: "Philosophy" },
  { href: "/schedule", label: "Schedule" },
];

export default function Header() {
  const pathname = usePathname();
  const { open, close } = useModal();

  const openJoinModal = () => {
    open({
      subtitle: "Become a Member",
      title: 'Join the <span style="color:#c14e01">Club</span>',
      body: <JoinModalBody onClose={close} />,
    });
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-primary bg-background-dark/95 backdrop-blur-md px-6 md:px-20 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex gap-1 items-center hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined text-primary text-3xl">
              sports_martial_arts
            </span>
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
          <button
            onClick={openJoinModal}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-bold text-sm tracking-wide uppercase transition-all glow-accent cursor-pointer"
          >
            Join Club
          </button>
        </div>
      </div>
    </header>
  );
}
