import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Contact", path: "/contact" },
];

/* Shared brand typography. The Navbar is mounted on every page, so Home, Footer and About all use these. */
const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap');
  .rcs-display { font-family: "Anton", "Bebas Neue", "Arial Narrow", Impact, sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: .005em; line-height: .95; }
  .rcs-body { font-family: "DM Sans", "Helvetica Neue", Arial, sans-serif; }
  .rcs-serif { font-family: "Playfair Display", Georgia, serif; }
  .font-editorial { font-family: "Helvetica Now Display", "Helvetica Neue", "Playfair Display", Georgia, serif; }
  .rcs-editorial-italic { font-family: "Playfair Display", Georgia, serif; font-style: italic; font-weight: 400; }
`;

const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C6A66B]";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`rcs-body fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open ? "border-b border-white/10 bg-[#050A14]/85 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <style>{FONT_CSS}</style>

      <nav
        aria-label="Primary"
        className="mx-auto flex h-[72px] max-w-[1380px] items-center justify-between px-5 sm:px-8 md:h-20 md:px-[4vw]"
      >
        {/* Wordmark */}
        <Link to="/" aria-label="Rare Creative Studios home" className={`flex items-center gap-3 ${focus}`}>
          <span className="rcs-display text-[34px] leading-none text-white">R</span>
          <span className="flex flex-col leading-none">
            <span className="text-[13px] font-bold uppercase tracking-[0.16em] text-white">Rare</span>
            <span className="mt-1 text-[7px] font-semibold uppercase tracking-[0.3em] text-white/50">Creative Studios</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((item) => {
            const active = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  aria-current={active ? "page" : undefined}
                  className={`relative py-2 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-300 ${
                    active ? "text-white" : "text-white/55 hover:text-white"
                  } ${focus}`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-[#C6A66B] transition-transform duration-300 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Single connect action */}
        <Link
          to="/letsconnect"
          className={`group hidden items-center gap-2 rounded-full border border-[#C6A66B]/70 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#DDC89D] transition-all duration-300 hover:bg-[#C6A66B] hover:text-[#050A14] md:inline-flex ${focus}`}
        >
          Let’s connect
          <ArrowUpRight size={14} strokeWidth={1.8} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="rcs-mobile-nav"
          className={`grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white md:hidden ${focus}`}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* Mobile panel */}
      <div
        id="rcs-mobile-nav"
        className={`overflow-hidden transition-[max-height,opacity] duration-500 md:hidden ${open ? "max-h-[460px] opacity-100" : "invisible max-h-0 opacity-0"}`}
      >
        <ul className="px-5 pb-6 pt-2 sm:px-8">
          {NAV_LINKS.map((item) => (
            <li key={item.path} className="border-b border-white/10">
              <Link
                to={item.path}
                aria-current={pathname === item.path ? "page" : undefined}
                className={`rcs-display flex min-h-14 items-center justify-between text-[28px] ${
                  pathname === item.path ? "text-[#C6A66B]" : "text-white"
                } ${focus}`}
              >
                {item.label}
                <ArrowUpRight size={18} strokeWidth={1.6} className="text-white/40" />
              </Link>
            </li>
          ))}
          <li className="pt-5">
            <Link
              to="/letsconnect"
              className={`inline-flex min-h-12 items-center gap-2 rounded-full border border-[#C6A66B]/70 px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#DDC89D] ${focus}`}
            >
              Let’s connect <ArrowUpRight size={14} />
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}