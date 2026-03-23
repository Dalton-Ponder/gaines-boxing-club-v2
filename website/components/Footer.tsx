import Link from "next/link";
import { navLinks } from "@/lib/navigation";
import { getSiteSettings } from "@/lib/payload";

function sanitizeUrl(url: string, fallback = "#") {
  if (!url) return fallback;
  try {
    const parsed = new URL(url, 'http://localhost');
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol) || url.startsWith('/')) {
      return url;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Strips any leading 'mailto:' prefix and validates the result as a
 * basic email address. Returns the normalized address or null if invalid.
 */
function normalizeEmail(raw: string): string | null {
  const stripped = raw.replace(/^mailto:/i, '').trim();
  // Basic RFC-5322-inspired check: something@something.something
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stripped) ? stripped : null;
}

export default async function Footer() {
  let siteSettings;
  try {
    siteSettings = await getSiteSettings();
  } catch (err) {
    console.error("getSiteSettings failed:", err);
    siteSettings = {};
  }

  const tagline = siteSettings.tagline || 'Building legacy through discipline, grit, and the relentless pursuit of excellence in the underground boxing circuit.';
  
  // Format phone for href="tel:..."
  // NOTE: The fallback vanity number "(555) 012-GBC-LIONS" maps to the
  // numeric equivalent +15550124225466 when letters are stripped by /\D/g.
  // If the CMS provides a value the same stripping applies, which works
  // correctly for purely numeric phone numbers.
  const phoneHref = siteSettings.phone 
    ? (siteSettings.phone.startsWith('+') 
        ? `tel:+${siteSettings.phone.replace(/\D/g, '')}`
        : `tel:+1${siteSettings.phone.replace(/\D/g, '')}`)
    : "tel:+15550124225466";
  
  // Display keeps the vanity letters for branding
  const phoneDisplay = siteSettings.phone || "(555) 012-GBC-LIONS";
  const emailDisplay = siteSettings.email || "frontdesk@gainesboxing.club";
  const normalizedEmail = normalizeEmail(emailDisplay);
  const addressDisplay = siteSettings.address || "124 Industrial Way, North District";

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
              &quot;{tagline}&quot;
            </p>
            <div className="flex items-center gap-4">
              {siteSettings.socialLinks && siteSettings.socialLinks.map((link: { platform: string; url: string; iconName: string }, idx: number) => {
                const safeUrl = sanitizeUrl(link.url);
                const isExternal = safeUrl.startsWith('http');
                return (
                  <a
                    key={idx}
                    className="size-10 bg-white/5 hover:bg-primary rounded flex items-center justify-center transition-colors"
                    href={safeUrl}
                    aria-label={link.platform}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                  >
                    <span className="material-symbols-outlined text-xl" aria-hidden="true">{link.iconName}</span>
                  </a>
                );
              })}
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
                  {addressDisplay}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">
                  call
                </span>
                <a href={phoneHref} className="text-slate-500 hover:text-primary text-sm transition-colors">
                  {phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg">
                  mail
                </span>
                {normalizedEmail ? (
                  <a href={`mailto:${normalizedEmail}`} className="text-slate-500 hover:text-primary text-sm transition-colors">
                    {normalizedEmail}
                  </a>
                ) : (
                  <span className="text-slate-500 text-sm">{emailDisplay}</span>
                )}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex items-center">
          <p className="text-slate-600 font-sans text-[10px] font-bold uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} {siteSettings.siteName?.toUpperCase() || "GAINES BOXING CLUB"}. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
