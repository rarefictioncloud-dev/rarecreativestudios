import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUp, ArrowUpRight } from "lucide-react";

const LOGO_SRC = "";
const SOCIALS = [];
const EMAIL = "";

/* Work and Journal are sections on Home. */

const EXPLORE = [
  { label: "Work", section: "work" },
  { label: "What We Do", to: "/services" },
  { label: "About", to: "/about" },
  { label: "Journal", section: "journal" },
  { label: "Contact", to: "/letsconnect" },
];

const CAPABILITIES = [
  "Brand Positioning",
  "Media Strategy",
  "Story Development",
  "Campaign Execution",
  "Digital Amplification",
];

/* One consistent RCS color palette across every route. */

const THEME = {
  root: "bg-[#000000] text-white",
  heading: "text-[#D6B878]",
  link: "text-white/75 hover:text-[#D6B878]",
  muted: "text-white/65",
  faint: "text-white/45",
  rule: "border-white/15",
  stroke: "rgba(255,255,255,0.22)",
  focus:
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D6B878]",
  accent: "text-[#D6B878]",
  logo: "text-white",
  top: "rounded-full border-white/25 hover:border-[#D6B878] hover:bg-[#D6B878] hover:text-black",
};

const padX =
  "pl-[max(env(safe-area-inset-left),clamp(1.25rem,4vw,4rem))] pr-[max(env(safe-area-inset-right),clamp(1.25rem,4vw,4rem))";

const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400;1,700&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

  .rcs-body {
    font-family: "DM Sans", "Helvetica Neue", Arial, sans-serif;
  }

  .rcs-nav-logo {
    font-family: "Anton", "Impact", "Arial Narrow", sans-serif;
    letter-spacing: -0.01em;
  }

  .rcs-nav-mono {
    font-family: "IBM Plex Mono", "Courier New", monospace;
  }

  .rcs-nav-sans {
    font-family: "Manrope", "Inter", "Helvetica Neue", Arial, sans-serif;
  }

  .rcs-footer-serif {
    font-family: "Playfair Display", Georgia, serif;
  }
`;

export default function Footer() {
  const year = new Date().getFullYear();

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const s = THEME;

  /* Scroll to a Home section, or navigate Home first. */

  const goTo = (id) => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scrollToSection = () => {
      document.getElementById(id)?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    };

    if (pathname === "/") {
      scrollToSection();
    } else {
      navigate("/");

      window.setTimeout(() => {
        scrollToSection();
      }, 450);
    }
  };

  const heading = `
    rcs-nav-mono
    mb-5
    text-[10px]
    font-medium
    uppercase
    tracking-[0.3em]
    ${s.heading}
  `;

  const link = `
    rcs-nav-sans
    relative
    inline-block
    py-1.5
    text-[14px]
    transition-colors
    duration-300
    ${s.link}
    ${s.focus}
  `;

  const ctaClass = `
    rcs-nav-sans
    group
    mt-7
    inline-flex
    min-h-12
    items-center
    gap-4
    rounded-full
    bg-[#D6B878]
    px-7
    text-[13px]
    font-semibold
    text-white
    transition-all
    duration-300
    hover:bg-white hover:text-black
    ${s.focus}
  `;

  return (
    <footer
      className={`
        rcs-body
        relative
        overflow-hidden
        ${s.root}
      `}
    >
      <style>{FONT_CSS}</style>

      <div
        className={`
          ${padX}
          mx-auto
          max-w-[1500px]
          pt-16
          md:pt-24
        `}
      >
        {/* Brand statement */}

        <div
          className={`
            grid
            gap-10
            border-b
            pb-14
            md:grid-cols-[1.6fr_1fr]
            md:items-end
            md:gap-16
            md:pb-20
            ${s.rule}
          `}
        >
          <h2
            className="
              rcs-footer-serif
              text-[clamp(2.4rem,7vw,6rem)]
              font-black
              uppercase
              leading-[0.9]
              tracking-[-0.045em]
            "
          >
            Turning brands

            <em className={`block not-italic ${s.accent}`}>
              into conversations.
            </em>
          </h2>

          <div className="md:justify-self-end">
            <p
              className={`
                rcs-nav-sans
                max-w-[34ch]
                text-[15px]
                leading-relaxed
                ${s.muted}
              `}
            >
              A premium creative and public relations studio.
              We don't send press releases. We create moments.
            </p>

          
          
          </div>
        </div>

        {/* Footer columns */}

        <div
          className="
            grid
            grid-cols-2
            gap-x-6
            gap-y-12
            pt-14
            md:pt-16
            lg:grid-cols-12
          "
        >
          {/* Brand wordmark */}

          <div className="col-span-2 lg:col-span-5">
            {LOGO_SRC ? (
              <img
                src={LOGO_SRC}
                alt="Rare Creative Studios"
                className="h-10 w-auto max-w-full md:h-12"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center gap-3">
                <span
                  className={`
                    rcs-nav-logo
                    text-[44px]
                    uppercase
                    leading-none
                    ${s.logo}
                  `}
                >
                  RARE
                </span>

                <span
                  className={`
                    rcs-nav-mono
                    flex
                    flex-col
                    text-[9px]
                    uppercase
                    leading-[1.55]
                    tracking-[0.22em]
                    ${s.muted}
                  `}
                >
                  <span>Creative</span>
                  <span>Studios</span>
                </span>
              </div>
            )}

            <p
              className={`
                rcs-nav-mono
                mt-6
                max-w-[30ch]
                text-[10px]
                uppercase
                leading-[1.8]
                tracking-[0.2em]
                ${s.muted}
              `}
            >
              Strategy / Story / Culture
            </p>
          </div>

          {/* Explore */}

          <nav
            aria-label="Explore"
            className="lg:col-span-2 lg:col-start-6"
          >
            <h3 className={heading}>Explore</h3>

            <ul>
              {EXPLORE.map((item) => (
                <li key={item.label}>
                  {item.to ? (
                    <Link to={item.to} className={link}>
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => goTo(item.section)}
                      className={link}
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Capabilities */}

          <div className="lg:col-span-3">
            <h3 className={heading}>Capabilities</h3>

            <ul
              className={`
                rcs-nav-sans
                text-[14px]
                leading-[2.05]
                ${s.muted}
              `}
            >
              {CAPABILITIES.map((capability) => (
                <li key={capability}>{capability}</li>
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

              {SOCIALS.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={link}
                  >
                    {social.label}
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

      {/* Oversized outlined brand typography */}

      <div
        className={`
          ${padX}
          mx-auto
          mt-16
          max-w-[1500px]
          md:mt-24
        `}
        aria-hidden="true"
      >
        <svg
          viewBox="-3 0 1006 112"
          className="
            block
            h-auto
            w-full
            select-none
            overflow-visible
          "
          role="presentation"
        >
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

      {/* Bottom bar */}

      <div
        className={`
          ${padX}
          mt-10
          border-t
          pb-[max(1.5rem,env(safe-area-inset-bottom))]
          pt-6
          ${s.rule}
        `}
      >
        <div
          className={`
            rcs-nav-mono
            mx-auto
            flex
            max-w-[1500px]
            flex-col
            gap-4
            text-[10px]
            uppercase
            tracking-[0.18em]
            md:flex-row
            md:items-center
            md:justify-between
            ${s.faint}
          `}
        >
          <p>© {year} Rare Creative Studios</p>

       
        </div>
      </div>
    </footer>
  );
}