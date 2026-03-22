import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/legacy", label: "Legacy" },
  { href: "/coaches", label: "Coaches" },
  { href: "/philosophy", label: "Philosophy" },
  { href: "/schedule", label: "Schedule" },
];

export default function Footer() {
  return (
    <footer className="bg-footer-dark border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <span
                className="material-symbols-outlined text-3xl text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                sports_martial_arts
              </span>
              <h2 className="font-display text-2xl font-black uppercase tracking-tighter text-white">
                Gaines <span className="text-primary">Boxing</span>
              </h2>
            </div>
            <p className="text-slate-500 max-w-sm mb-8 italic font-sans text-sm">
              &quot;Building legacy through discipline, grit, and the relentless
              pursuit of excellence in the underground boxing circuit.&quot;
            </p>
            <div className="flex items-center gap-4">
              <a
                className="size-10 bg-white/5 hover:bg-primary rounded flex items-center justify-center transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">share</span>
              </a>
              <a
                className="size-10 bg-white/5 hover:bg-primary rounded flex items-center justify-center transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">group</span>
              </a>
              <a
                className="size-10 bg-white/5 hover:bg-primary rounded flex items-center justify-center transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-xl">
                  photo_camera
                </span>
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h5 className="text-white font-display font-bold uppercase tracking-widest text-sm mb-6">
              Navigation
            </h5>
            <ul className="space-y-4 font-sans">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    className="text-slate-500 hover:text-primary text-sm font-medium transition-colors"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h5 className="text-white font-display font-bold uppercase tracking-widest text-sm mb-6">
              Contact
            </h5>
            <ul className="space-y-4 font-sans">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">
                  location_on
                </span>
                <span className="text-slate-500 text-sm">
                  124 Industrial Way, North District
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">
                  call
                </span>
                <span className="text-slate-500 text-sm">
                  (555) 012-GBC-LIONS
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">
                  mail
                </span>
                <span className="text-slate-500 text-sm">
                  frontdesk@gainesboxing.club
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} GAINES BOXING CLUB. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 font-sans">
            <a
              className="text-slate-600 hover:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]"
              href="#"
            >
              Privacy
            </a>
            <a
              className="text-slate-600 hover:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]"
              href="#"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
