import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Work", section: "work" },
  { label: "What We Do", path: "/services" },
  { label: "About", path: "/about" },
  { label: "Journal", section: "journal" },
];

const CTA = {
  label: "Start a conversation",
  path: "/letsconnect",
};

const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=IBM+Plex+Mono:wght@400;500&display=swap');

  .rcs-body {
    font-family: "DM Sans", "Helvetica Neue", Arial, sans-serif;
  }

  .rcs-display {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-weight: 500;
    text-transform: none;
    letter-spacing: -0.035em;
    line-height: 1.05;
  }

  .rcs-nav-logo {
    font-family: "DM Sans", "Helvetica Neue", Arial, sans-serif;
    font-weight: 700;
    letter-spacing: -0.075em;
  }

  .rcs-nav-mono {
    font-family: "IBM Plex Mono", "Courier New", monospace;
  }

  .rcs-nav-sans {
    font-family: "DM Sans", "Inter", "Helvetica Neue", Arial, sans-serif;
  }

  /* Desktop: navbar is part of the normal document flow. */
  .rcs-navbar-header {
    position: relative;
    top: auto;
    right: auto;
    left: auto;
    width: 100%;
    z-index: 50;
  }

  /* Mobile: navbar stays at the top while scrolling. */
  @media (max-width: 767px) {
    .rcs-navbar-header {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      width: 100%;
      z-index: 9990;
    }
  }

  /* Compact branding for smaller phones. */
  @media (max-width: 380px) {
    .rcs-nav-subtitle {
      display: none;
    }
  }
`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Close the mobile menu whenever the page changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Update the navbar's visual appearance on scroll.
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Prevent background scrolling when the mobile menu is open.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // Navigate to sections on the Home page.
  const goTo = (id) => {
    setOpen(false);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scrollToSection = () => {
      window.setTimeout(() => {
        const element = document.getElementById(id);

        if (element) {
          element.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
          });
        }
      }, 50);
    };

    if (pathname === "/") {
      scrollToSection();
    } else {
      navigate("/");

      window.setTimeout(() => {
        const element = document.getElementById(id);

        if (element) {
          element.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
          });
        }
      }, 500);
    }
  };

  const headerSkin = scrolled
    ? "border-b border-white/[0.10] bg-[#000000] shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
    : "border-b border-white/[0.08] bg-[#000000]";

  const focus =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C69A62]";

  const linkCls = (active = false) => `
    rcs-nav-sans
    relative
    py-2
    text-[12px]
    font-medium
    transition-colors
    duration-300
    ${
      active
        ? "text-[#D7B17B]"
        : "text-white/75 hover:text-[#F2D6A8]"
    }
    ${focus}
  `;

  const underline = (active = false) => `
    absolute
    -bottom-0.5
    left-0
    h-[1.5px]
    w-full
    origin-left
    transition-transform
    duration-300
    ${
      active
        ? "scale-x-100"
        : "scale-x-0 group-hover:scale-x-100"
    }
    bg-[#C69A62]
  `;

  const mobileLinkClass = (active = false) => `
    rcs-display
    flex
    min-h-[64px]
    w-full
    items-center
    justify-between
    text-left
    text-[29px]
    transition-colors
    duration-300
    ${
      active
        ? "text-[#D7B17B]"
        : "text-[#F4F0E8] hover:text-[#D7B17B]"
    }
    ${focus}
  `;

  return (
    <>
      <style>{FONT_CSS}</style>

      <header
        className={`
          rcs-body
          rcs-navbar-header
          transition-colors
          duration-300
          ${headerSkin}
        `}
      >
        <nav
          aria-label="Primary navigation"
          className="
            mx-auto
            flex
            h-[72px]
            max-w-[1500px]
            items-center
            justify-between
            gap-3
            px-4
            sm:px-8
            md:h-[84px]
            md:px-[6vw]
          "
        >
          {/* RARE logo */}

          <Link
            to="/"
            aria-label="Rare Creative Studios home"
            onClick={() => setOpen(false)}
            className={`
              flex
              min-w-0
              shrink-0
              items-center
              gap-2
              sm:gap-2.5
              md:gap-3
              ${focus}
            `}
          >
            <span
              className="
                rcs-nav-logo
                text-[27px]
                font-normal
                uppercase
                leading-none
                text-[#F4F0E8]
                sm:text-[30px]
                md:text-[36px]
              "
            >
              RARE
            </span>

            <span
              className="
                rcs-nav-mono
                rcs-nav-subtitle
                flex
                flex-col
                text-[7px]
                font-normal
                uppercase
                leading-[1.6]
                tracking-[0.14em]
                text-white/55
                sm:text-[8px]
                md:text-[9px]
                md:tracking-[0.22em]
              "
            >
              <span>Creative</span>
              <span>Studios</span>
            </span>
          </Link>

          {/* Desktop navigation */}

          <ul className="hidden items-center gap-7 md:flex lg:gap-10">
            {NAV_LINKS.map((item) => {
              const active = item.path
                ? pathname === item.path
                : false;

              return (
                <li key={item.label}>
                  {item.path ? (
                    <Link
                      to={item.path}
                      aria-current={
                        active ? "page" : undefined
                      }
                      className={`group ${linkCls(active)}`}
                    >
                      {item.label}
                      <span className={underline(active)} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => goTo(item.section)}
                      className={`group ${linkCls(false)}`}
                    >
                      {item.label}
                      <span className={underline(false)} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Desktop CTA: visible only on desktop */}

          <Link
            to={CTA.path}
            className={`
              group
              hidden
              shrink-0
              items-center
              justify-center
              gap-3
              rounded-full
              bg-[#C69A62]
              px-5
              py-3
              text-[11px]
              font-semibold
              tracking-[0.02em]
              text-[#111318]
              transition-colors
              duration-300
              hover:bg-[#E8D7BD]
              md:inline-flex
              md:px-6
              md:text-[12px]
              ${focus}
            `}
          >
            {CTA.label}

            <ArrowUpRight
              size={15}
              strokeWidth={1.8}
              className="
                transition-transform
                duration-300
                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
              "
            />
          </Link>

          {/* Mobile: one CTA and one hamburger menu */}

          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <Link
              to={CTA.path}
              onClick={() => setOpen(false)}
              className={`
                rcs-nav-sans
                inline-flex
                h-10
                shrink-0
                items-center
                justify-center
                gap-1
                rounded-full
                bg-[#C69A62]
                px-3
                text-[10px]
                font-semibold
                leading-none
                text-[#111318]
                transition-colors
                duration-300
                hover:bg-[#E8D7BD]
                min-[390px]:gap-1.5
                min-[390px]:px-3.5
                min-[390px]:text-[11px]
                sm:px-4
                sm:text-[12px]
                ${focus}
              `}
            >
              <span className="whitespace-nowrap">
                {CTA.label}
              </span>

              <ArrowUpRight
                size={13}
                strokeWidth={1.8}
                className="shrink-0"
              />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={
                open ? "Close navigation" : "Open navigation"
              }
              aria-expanded={open}
              aria-controls="rcs-mobile-nav"
              className={`
                relative
                grid
                h-10
                w-10
                shrink-0
                place-items-center
                rounded-full
                border
                border-white/20
                bg-[#000000]
                text-[#F4F0E8]
                transition-colors
                duration-300
                hover:border-[#124CCF]
                hover:text-[#D7B17B]
                ${focus}
              `}
            >
              <span
                className={`
                  absolute
                  transition-all
                  duration-300
                  ${
                    open
                      ? "rotate-90 scale-0 opacity-0"
                      : "rotate-0 scale-100 opacity-100"
                  }
                `}
              >
                <Menu size={20} strokeWidth={1.7} />
              </span>

              <span
                className={`
                  absolute
                  transition-all
                  duration-300
                  ${
                    open
                      ? "rotate-0 scale-100 opacity-100"
                      : "-rotate-90 scale-0 opacity-0"
                  }
                `}
              >
                <X size={20} strokeWidth={1.7} />
              </span>
            </button>
          </div>
        </nav>

        {/* Mobile navigation dropdown */}

        <div
          id="rcs-mobile-nav"
          aria-hidden={!open}
          className={`
            overflow-y-auto
            border-t
            border-white/[0.10]
            bg-[#000000]
            transition-[max-height,opacity,visibility]
            duration-300
            ease-in-out
            md:hidden
            ${
              open
                ? "visible max-h-[calc(100dvh-72px)] opacity-100"
                : "invisible max-h-0 opacity-0"
            }
          `}
        >
          <div className="px-5 pb-7 pt-5 sm:px-8">
            <div className="mb-5 flex items-center justify-between">
              <span className="rcs-nav-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                Navigation
              </span>

              <span className="rcs-nav-mono text-[9px] text-[#D7B17B]">
                RCS / 01
              </span>
            </div>

            <ul>
              {NAV_LINKS.map((item, index) => {
                const active = item.path
                  ? pathname === item.path
                  : false;

                return (
                  <li
                    key={item.label}
                    className="border-b border-white/10"
                  >
                    {item.path ? (
                      <Link
                        to={item.path}
                        aria-current={
                          active ? "page" : undefined
                        }
                        tabIndex={open ? 0 : -1}
                        className={mobileLinkClass(active)}
                      >
                        <span className="flex items-center gap-4">
                          <span className="rcs-nav-mono text-[10px] text-white/30">
                            0{index + 1}
                          </span>

                          {item.label}
                        </span>

                        <ArrowUpRight
                          size={19}
                          strokeWidth={1.5}
                          className="text-white/45"
                        />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => goTo(item.section)}
                        tabIndex={open ? 0 : -1}
                        className={mobileLinkClass(false)}
                      >
                        <span className="flex items-center gap-4">
                          <span className="rcs-nav-mono text-[10px] text-white/30">
                            0{index + 1}
                          </span>

                          {item.label}
                        </span>

                        <ArrowUpRight
                          size={19}
                          strokeWidth={1.5}
                          className="text-white/45"
                        />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="rcs-nav-mono text-[9px] uppercase tracking-[0.12em] text-white/40">
                Strategy / Story / Culture
              </span>

              <span className="rcs-nav-mono text-[9px] text-white/40">
                © RCS
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Reserve space only for the fixed mobile navbar. */}

      <div
        aria-hidden="true"
        className="h-[72px] md:hidden"
      />
    </>
  );
}