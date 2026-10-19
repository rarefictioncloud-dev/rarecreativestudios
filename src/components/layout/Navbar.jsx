import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Work", path: "/work" },
  { label: "Insights", path: "/insights" },
];

/* Shared brand typography. The Navbar is mounted on every page, so Home, Footer and About all use these. */
const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
  .rcs-display { font-family: "Anton", "Bebas Neue", "Arial Narrow", Impact, sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: .005em; line-height: .95; }
  .rcs-body { font-family: "DM Sans", "Helvetica Neue", Arial, sans-serif; }
  .rcs-serif { font-family: "Playfair Display", Georgia, serif; }
  .font-editorial { font-family: "Helvetica Now Display", "Helvetica Neue", "Playfair Display", Georgia, serif; }
  .rcs-editorial-italic { font-family: "Playfair Display", Georgia, serif; font-style: italic; font-weight: 400; }
  .rcs-nav-logo { font-family: "Anton", "Impact", "Arial Narrow", sans-serif; letter-spacing: -0.02em; }
  .rcs-nav-mono { font-family: "IBM Plex Mono", "Courier New", monospace; }
  .rcs-nav-sans { font-family: "Inter", "Helvetica Neue", Arial, sans-serif; }
`;

const BLUE = "#0a3fdc";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  /* Home uses the light paper design; every other page keeps the original dark navbar. */
  const light = pathname === "/";

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const focus = light
    ? "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0a3fdc]"
    : "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C6A66B]";

  const solid = scrolled || open;
  const headerSkin = light
    ? solid
      ? "border-b border-black/10 bg-[#e7e6e2]/90 backdrop-blur-xl"
      : "border-b border-transparent"
    : solid
    ? "border-b border-white/10 bg-[#050A14]/85 backdrop-blur-xl"
    : "border-b border-transparent";

  const ink = light ? "text-[#0b0b0b]" : "text-white";
  const rule = light ? "bg-[#0b0b0b]/30" : "bg-white/30";

  return (
    <header className={`rcs-body fixed inset-x-0 top-0 z-50 transition-all duration-500 ${headerSkin}`}>
      <style>{FONT_CSS}</style>

      <nav aria-label="Primary" className="mx-auto flex h-[72px] max-w-[1380px] items-center justify-between px-5 sm:px-8 md:h-20 md:px-[4.6vw]">
        {/* Wordmark: heavy RCS + stacked studio name */}
        <Link to="/" aria-label="Rare Creative Studios home" className={`flex items-center gap-3 ${focus}`}>
          <span className={`rcs-nav-logo relative text-[34px] font-normal leading-none md:text-[38px] ${ink}`}>
            RCS
            <sup className="absolute -right-2.5 top-0 text-[9px] font-normal leading-none">®</sup>
          </span>
          <span aria-hidden="true" className={`ml-2 h-8 w-px ${rule}`} />
          <span className={`rcs-nav-mono flex flex-col text-[7.5px] font-normal uppercase leading-[1.5] tracking-[0.2em] ${light ? "text-[#0b0b0b]/80" : "text-white/60"}`}>
            <span>Rare</span>
            <span>Creative</span>
            <span>Studios</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-[3.4vw] md:flex lg:gap-14">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.path;
            const activeColor = light ? "text-[#0a3fdc]" : "text-white";
            const idleColor = light ? "text-[#0b0b0b] hover:text-[#0a3fdc]" : "text-white/55 hover:text-white";
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  aria-current={active ? "page" : undefined}
                  className={`rcs-nav-sans relative py-2 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-300 ${active ? activeColor : idleColor} ${focus}`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-[1.5px] w-full origin-left transition-transform duration-300 ${active ? "scale-x-100" : "scale-x-0"} ${light ? "bg-[#0a3fdc]" : "bg-[#C6A66B]"}`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Connect action */}
        {light ? (
          <Link
            to="/letsconnect"
            className={`group rcs-nav-mono hidden items-center gap-6 bg-[#0047ee] px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition-colors duration-300 hover:bg-[#0b0b0b] md:inline-flex ${focus}`}
          >
            Let’s talk
            <ArrowUpRight size={14} strokeWidth={1.6} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        ) : (
          <Link
            to="/letsconnect"
            className={`group hidden items-center gap-2 rounded-full border border-[#C6A66B]/70 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#DDC89D] transition-all duration-300 hover:bg-[#C6A66B] hover:text-[#050A14] md:inline-flex ${focus}`}
          >
            Let’s connect
            <ArrowUpRight size={14} strokeWidth={1.8} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="rcs-mobile-nav"
          className={`grid h-11 w-11 place-items-center border md:hidden ${light ? "border-black/25 text-[#0b0b0b]" : "rounded-full border-white/20 text-white"} ${focus}`}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* Mobile panel */}
      <div
        id="rcs-mobile-nav"
        className={`overflow-hidden transition-[max-height,opacity] duration-500 md:hidden ${open ? "max-h-[560px] opacity-100" : "invisible max-h-0 opacity-0"}`}
      >
        <ul className="px-5 pb-6 pt-2 sm:px-8">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.path;
            return (
              <li key={item.path} className={`border-b ${light ? "border-black/15" : "border-white/10"}`}>
                <Link
                  to={item.path}
                  aria-current={active ? "page" : undefined}
                  className={`rcs-display flex min-h-14 items-center justify-between text-[28px] ${
                    active ? (light ? "text-[#0a3fdc]" : "text-[#C6A66B]") : ink
                  } ${focus}`}
                >
                  {item.label}
                  <ArrowUpRight size={18} strokeWidth={1.6} className={light ? "text-black/40" : "text-white/40"} />
                </Link>
              </li>
            );
          })}
          <li className="pt-5">
            {light ? (
              <Link to="/letsconnect" className={`rcs-nav-mono inline-flex min-h-12 items-center gap-3 bg-[#0047ee] px-6 text-[11px] font-medium uppercase tracking-[0.16em] text-white ${focus}`}>
                Let’s talk <ArrowUpRight size={14} />
              </Link>
            ) : (
              <Link to="/letsconnect" className={`inline-flex min-h-12 items-center gap-2 rounded-full border border-[#C6A66B]/70 px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#DDC89D] ${focus}`}>
                Let’s connect <ArrowUpRight size={14} />
              </Link>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
}