import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Work", section: "work" },
  { label: "What We Do", path: "/services" },
  { label: "About", path: "/about" },
];

const CTA = {
  label: "Start a conversation",
  path: "/letsconnect",
};

/* Same type and palette as the Home film:
   Inter Tight (light display, tight tracking), obsidian #0B0B0C, ivory #F1EFE9,
   amber #D9A441 and the studio blue #234A78. Class names are prefixed so they
   never clash with the styles Home injects. */
const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&display=swap');

  .rcs-nav-root {
    font-family: 'Inter Tight', 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  .rcs-nav-display {
    font-family: 'Inter Tight', 'Helvetica Neue', Arial, sans-serif;
    font-weight: 300;
    letter-spacing: -0.045em;
    line-height: 1.05;
  }

  .rcs-nav-logo {
    font-family: 'Inter Tight', 'Helvetica Neue', Arial, sans-serif;
    font-weight: 300;
    letter-spacing: -0.05em;
  }

  .rcs-nav-sans {
    font-family: 'Inter Tight', 'Helvetica Neue', Arial, sans-serif;
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

  /* obsidian bar with the studio blue and amber light bleeding in from the top edge */
  .rcs-nav-surface {
    background:
      radial-gradient(46% 170% at 10% -90%, rgba(35,74,120,0.42) 0%, rgba(35,74,120,0) 72%),
      radial-gradient(38% 150% at 92% -80%, rgba(217,164,65,0.16) 0%, rgba(217,164,65,0) 70%),
      linear-gradient(180deg, #101113 0%, #0B0B0C 100%);
  }

  /* gentle breathing dot on the active link */
  @keyframes rcs-nav-pulse {
    0%, 100% { opacity: .55; transform: scale(1); }
    50%      { opacity: 1;   transform: scale(1.5); }
  }
  .rcs-nav-dot { animation: rcs-nav-pulse 2.6s ease-in-out infinite; }

  /* light sweep across the call-to-action on hover */
  .rcs-cta-shine { transform: translateX(-160%) skewX(-18deg); }
  @keyframes rcs-nav-shine {
    from { transform: translateX(-160%) skewX(-18deg); }
    to   { transform: translateX(520%)  skewX(-18deg); }
  }
  .rcs-cta:hover .rcs-cta-shine { animation: rcs-nav-shine 0.95s ease; }

  @media (prefers-reduced-motion: reduce) {
    .rcs-nav-dot,
    .rcs-cta:hover .rcs-cta-shine { animation: none; }
  }
`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef(null);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Close the mobile menu whenever the page changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Update the navbar's visual appearance and the scroll progress hairline.
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);

      const max =
        document.documentElement.scrollHeight - window.innerHeight;

      if (progressRef.current) {
        const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        progressRef.current.style.transform = `scaleX(${p})`;
      }
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
    ? "rcs-nav-surface border-b border-white/[0.10] shadow-[0_14px_44px_rgba(0,0,0,0.5)] md:backdrop-blur-xl"
    : "rcs-nav-surface border-b border-white/[0.07]";

  const focus =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9A441]";

  // Desktop pill link
  const linkCls = (active = false) => `
    rcs-nav-sans
    group
    relative
    inline-flex
    items-center
    gap-2
    rounded-full
    px-4
    py-2
    text-[13px]
    font-medium
    tracking-[0.005em]
    transition-all
    duration-300
    ${
      active
        ? "bg-white/[0.07] text-[#EBC36F] shadow-[inset_0_0_0_1px_rgba(217,164,65,0.32)]"
        : "text-[#F1EFE9]/70 hover:bg-white/[0.06] hover:text-[#F1EFE9]"
    }
    ${focus}
  `;

  const mobileLinkClass = (active = false) => `
    rcs-nav-display
    flex
    min-h-[64px]
    w-full
    items-center
    justify-between
    text-left
    text-[32px]
    transition-colors
    duration-300
    ${
      active
        ? "text-[#EBC36F]"
        : "text-[#F1EFE9] hover:text-[#EBC36F]"
    }
    ${focus}
  `;

  // Staggered reveal for the mobile menu rows
  const rowStyle = (index) => ({
    transitionDelay: open ? `${90 + index * 70}ms` : "0ms",
  });

  const rowCls = `
    border-b
    border-white/10
    transition-all
    duration-500
    ease-out
  `;

  return (
    <>
      <style>{FONT_CSS}</style>

      <header
        className={`
          rcs-nav-root
          rcs-navbar-header
          transition-all
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
            md:grid
            md:h-[84px]
            md:grid-cols-[1fr_auto_1fr]
            md:px-[5vw]
          "
        >
          {/* Rare wordmark, set the way it appears on the studio wall */}

          <Link
            to="/"
            aria-label="Rare Creative Studios home"
            onClick={() => setOpen(false)}
            className={`
              group
              flex
              min-w-0
              shrink-0
              items-center
              gap-2.5
              md:gap-3
              md:justify-self-start
              ${focus}
            `}
          >
            <span
              className="
                rcs-nav-logo
                text-[30px]
                leading-none
                text-[#F1EFE9]
                transition-colors
                duration-300
                group-hover:text-white
                sm:text-[32px]
                md:text-[38px]
              "
            >
              Rare
            </span>

            <span
              aria-hidden="true"
              className="
                h-6
                w-px
                bg-gradient-to-b
                from-transparent
                via-[#D9A441]/80
                to-transparent
                md:h-8
              "
            />

            <span
              className="
                rcs-nav-sans
                rcs-nav-subtitle
                flex
                flex-col
                text-[8px]
                font-semibold
                uppercase
                leading-[1.55]
                tracking-[0.18em]
                text-[#D9A441]
                transition-colors
                duration-300
                group-hover:text-[#EBC36F]
                sm:text-[8.5px]
                md:text-[9.5px]
                md:tracking-[0.2em]
              "
            >
              <span>Creative</span>
              <span>Studios</span>
            </span>
          </Link>

          {/* Desktop navigation: centred glass pill */}

          <ul
            className="
              hidden
              items-center
              gap-1
              rounded-full
              border
              border-white/[0.09]
              bg-white/[0.03]
              p-1
              shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-12px_rgba(0,0,0,0.8)]
              md:flex
            "
          >
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
                      className={linkCls(active)}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="rcs-nav-dot h-1 w-1 rounded-full bg-[#D9A441]"
                        />
                      )}
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => goTo(item.section)}
                      className={linkCls(false)}
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Desktop CTA: same amber pill as the Home page button */}

          <Link
            to={CTA.path}
            className={`
              rcs-cta
              rcs-nav-sans
              group
              relative
              hidden
              shrink-0
              items-center
              justify-center
              gap-3
              overflow-hidden
              rounded-full
              border
              border-[#D9A441]/70
              bg-[#D9A441]
              py-1.5
              pl-6
              pr-1.5
              text-[13px]
              font-semibold
              tracking-[0.005em]
              text-[#0B0B0C]
              shadow-[0_10px_40px_-10px_rgba(217,164,65,0.7)]
              transition
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#F1EFE9]
              md:inline-flex
              md:justify-self-end
              ${focus}
            `}
          >
            <span
              aria-hidden="true"
              className="rcs-cta-shine pointer-events-none absolute inset-y-0 left-0 w-8 bg-white/50 blur-md"
            />

            <span className="relative">{CTA.label}</span>

            <span
              className="
                relative
                grid
                h-8
                w-8
                place-items-center
                rounded-full
                bg-[#0B0B0C]
                text-[#D9A441]
                transition-transform
                duration-300
                group-hover:rotate-45
              "
            >
              <ArrowUpRight size={15} strokeWidth={2} />
            </span>
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
                border
                border-[#D9A441]/70
                bg-[#D9A441]
                px-3
                text-[10px]
                font-semibold
                leading-none
                text-[#0B0B0C]
                shadow-[0_8px_26px_-10px_rgba(217,164,65,0.7)]
                transition-all
                duration-300
                active:scale-[0.97]
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
                strokeWidth={2}
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
                bg-white/[0.04]
                text-[#F1EFE9]
                transition-all
                duration-300
                active:scale-95
                ${
                  open
                    ? "border-[#D9A441]/70 text-[#EBC36F]"
                    : "border-white/20 hover:border-[#D9A441]/70 hover:text-[#EBC36F]"
                }
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
            bg-[#0B0B0C]
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
          <div className="bg-[radial-gradient(ellipse_at_50%_100%,rgba(35,74,120,0.35)_0%,rgba(11,11,12,0)_70%)] px-5 pb-7 pt-5 sm:px-8">
            <div className="mb-5 flex items-center justify-between">
              <span className="rcs-nav-sans text-[11px] font-medium tracking-[0.08em] text-[#D9A441]">
                Rare Creative Studios
              </span>

              <span className="rcs-nav-sans text-[11px] font-medium tracking-wide text-[#F1EFE9]/45">
                Menu
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
                    style={rowStyle(index)}
                    className={`${rowCls} ${
                      open
                        ? "translate-y-0 opacity-100"
                        : "translate-y-3 opacity-0"
                    }`}
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
                          <span className="rcs-nav-sans text-[12px] font-medium text-[#D9A441]/70">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          {item.label}

                          {active && (
                            <span
                              aria-hidden="true"
                              className="rcs-nav-dot h-1.5 w-1.5 rounded-full bg-[#D9A441]"
                            />
                          )}
                        </span>

                        <ArrowUpRight
                          size={19}
                          strokeWidth={1.5}
                          className="text-[#F1EFE9]/45"
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
                          <span className="rcs-nav-sans text-[12px] font-medium text-[#D9A441]/70">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          {item.label}
                        </span>

                        <ArrowUpRight
                          size={19}
                          strokeWidth={1.5}
                          className="text-[#F1EFE9]/45"
                        />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <div
              style={rowStyle(NAV_LINKS.length)}
              className={`mt-6 flex items-center justify-between gap-3 transition-all duration-500 ease-out ${
                open
                  ? "translate-y-0 opacity-100"
                  : "translate-y-3 opacity-0"
              }`}
            >
              <span className="rcs-nav-sans text-[12px] font-medium text-[#F1EFE9]/50">
                Strategy / Story / Culture
              </span>

              <span className="rcs-nav-sans text-[12px] font-medium text-[#F1EFE9]/50">
                © RCS
              </span>
            </div>
          </div>
        </div>

        {/* amber hairline along the bottom edge + scroll progress */}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D9A441]/45 to-transparent"
        />

        <span
          ref={progressRef}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gradient-to-r from-[#D9A441] to-[#EBC36F]"
          style={{ transform: "scaleX(0)" }}
        />
      </header>

      {/* Reserve space only for the fixed mobile navbar. */}

      <div
        aria-hidden="true"
        className="h-[72px] md:hidden"
      />
    </>
  );
}