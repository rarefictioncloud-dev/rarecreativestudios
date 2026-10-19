import { Link, useLocation } from "react-router-dom";
import { ArrowUp, ArrowUpRight } from "lucide-react";

const LOGO_SRC = "";
const SOCIALS = []; // e.g. [{ label: "LinkedIn", href: "https://..." }]
const EMAIL = "";

const EXPLORE = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Work", to: "/work" },
  { label: "Insights", to: "/insights" },
  { label: "Contact", to: "/contact" },
];

const CAPABILITIES = [
  "Brand Strategy",
  "PR & Media Relations",
  "Creative Campaigns",
  "Storytelling",
  "Video Production",
  "Digital Marketing",
];

/* Two skins: light paper on Home (matches the page + navbar), original dark navy everywhere else. */
const SKINS = {
  light: {
    root: "bg-[#e7e6e2] text-[#0b0b0b]",
    heading: "rcs-nav-mono text-[#0a3fdc]",
    link: "text-[#0b0b0b]/75 hover:text-[#0a3fdc]",
    muted: "text-[#0b0b0b]/60",
    faint: "text-[#0b0b0b]/45",
    rule: "border-[#0b0b0b]/15",
    stroke: "rgba(11,11,11,0.28)",
    focus: "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0a3fdc]",
    accent: "text-[#0a3fdc]",
    cta: "bg-[#0047ee] text-white hover:bg-[#0b0b0b]",
    ctaShape: "",
    logo: "text-[#0b0b0b]",
    divider: "bg-[#0b0b0b]/30",
    top: "border-[#0b0b0b]/25 hover:bg-[#0b0b0b] hover:text-white",
  },
  dark: {
    root: "bg-[#03060D] text-white",
    heading: "text-[#C6A66B]",
    link: "text-white/65 hover:text-white",
    muted: "text-white/55",
    faint: "text-white/40",
    rule: "border-white/10",
    stroke: "rgba(255,255,255,0.2)",
    focus: "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C6A66B]",
    accent: "text-[#C6A66B]",
    cta: "border border-[#C6A66B]/70 text-[#DDC89D] hover:bg-[#C6A66B] hover:text-[#050A14]",
    ctaShape: "rounded-full",
    logo: "text-white",
    divider: "bg-white/30",
    top: "border-white/25 hover:bg-white hover:text-[#03060D]",
  },
};

const padX = "pl-[max(env(safe-area-inset-left),clamp(1.25rem,4vw,4rem))] pr-[max(env(safe-area-inset-right),clamp(1.25rem,4vw,4rem))]";

export default function Footer() {
  const year = new Date().getFullYear();
  const { pathname } = useLocation();
  const light = pathname === "/";
  const s = SKINS[light ? "light" : "dark"];

  const heading = `mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] ${s.heading}`;
  const link = `relative inline-block py-1.5 text-[14px] transition-colors ${s.link} ${s.focus}`;

  return (
    <footer className={`rcs-body overflow-hidden ${s.root}`}>
      {/* ---------- Call to action ---------- */}
      <div className={`${padX} mx-auto max-w-[1500px] pt-16 md:pt-24`}>
        <div className={`grid gap-10 border-b pb-14 md:grid-cols-[1.5fr_1fr] md:items-end md:gap-16 md:pb-20 ${s.rule}`}>
          <h2 className="rcs-display text-[clamp(2.6rem,7vw,6rem)] leading-[0.95]">
            Have an idea?
            <span className={`block ${s.accent}`}>Let’s make it matter.</span>
          </h2>
          <div className="md:justify-self-end">
            <p className={`max-w-[34ch] text-[15px] leading-relaxed ${s.muted}`}>
              Strategy, storytelling, PR, and creative production for brands ready to make a lasting impression.
            </p>
            <Link
              to="/letsconnect"
              className={`group mt-7 inline-flex min-h-12 items-center gap-6 px-7 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 ${s.cta} ${s.ctaShape} ${s.focus}`}
            >
              Start a conversation
              <ArrowUpRight size={15} strokeWidth={1.6} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* ---------- Columns ---------- */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 pt-14 md:pt-16 lg:grid-cols-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-5">
            {LOGO_SRC ? (
              <img src={LOGO_SRC} alt="Rare Creative Studios" className="h-10 w-auto max-w-full md:h-12" loading="lazy" />
            ) : (
              <div className="flex items-center gap-3">
                <span className={`rcs-nav-logo relative text-[44px] leading-none ${s.logo}`} style={{ fontFamily: "'Anton','Impact',sans-serif", letterSpacing: "-0.02em" }}>
                  RCS
                  <sup className="absolute -right-3 top-0 text-[10px] font-normal leading-none">®</sup>
                </span>
                <span aria-hidden="true" className={`ml-3 h-10 w-px ${s.divider}`} />
                <span className={`rcs-nav-mono flex flex-col text-[8.5px] uppercase leading-[1.5] tracking-[0.22em] ${s.muted}`}>
                  <span>Rare</span>
                  <span>Creative</span>
                  <span>Studios</span>
                </span>
              </div>
            )}
            <p className={`mt-6 text-[14px] ${s.muted}`}>Turning brands into conversations.</p>
          </div>

          {/* Explore */}
          <nav aria-label="Explore" className="lg:col-span-2 lg:col-start-6">
            <h3 className={heading}>Explore</h3>
            <ul>
              {EXPLORE.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Capabilities */}
          <div className="lg:col-span-3">
            <h3 className={heading}>Capabilities</h3>
            <ul className={`text-[14px] leading-[2.05] ${s.muted}`}>
              {CAPABILITIES.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="col-span-2 lg:col-span-2">
            <h3 className={heading}>Connect</h3>
            <ul>
              {EMAIL && (
                <li>
                  <a href={`mailto:${EMAIL}`} className={link}>
                    {EMAIL}
                  </a>
                </li>
              )}
              {SOCIALS.map((so) => (
                <li key={so.href}>
                  <a href={so.href} target="_blank" rel="noopener noreferrer" className={link}>
                    {so.label}
                  </a>
                </li>
              ))}
              {!EMAIL && SOCIALS.length === 0 && (
                <li>
                  <Link to="/letsconnect" className={link}>
                    Tell us about your project
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* ---------- Outlined wordmark: SVG textLength guarantees the full name always fits ---------- */}
      <div className={`${padX} mx-auto mt-16 max-w-[1500px] md:mt-24`} aria-hidden="true">
        <svg viewBox="-3 0 1006 112" className="block h-auto w-full select-none overflow-visible" role="presentation">
          <text
            x="0"
            y="104"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
            fontFamily="'Anton','Impact','Arial Narrow',sans-serif"
            fontSize="112"
            fill="none"
            stroke={s.stroke}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          >
            RARE CREATIVE STUDIOS
          </text>
        </svg>
      </div>

      {/* ---------- Bottom bar ---------- */}
      <div className={`${padX} mt-10 border-t pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 ${s.rule}`}>
        <div className={`mx-auto flex max-w-[1500px] flex-col gap-4 text-[10px] uppercase tracking-[0.18em] md:flex-row md:items-center md:justify-between ${s.faint}`}>
          <p>© {year} Rare Creative Studios</p>
          <p>Independent thinking. Distinctive work.</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`group inline-flex w-fit items-center gap-3 border px-4 py-2.5 transition-colors ${s.top} ${light ? "" : "rounded-full"} ${s.focus}`}
          >
            Back to top
            <ArrowUp size={13} strokeWidth={1.6} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}