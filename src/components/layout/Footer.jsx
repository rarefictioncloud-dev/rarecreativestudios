import { Link } from "react-router-dom";

const LOGO_SRC = "";
const SOCIALS = [];
const EMAIL = "";

const EXPLORE = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
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

const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C6A66B]";
const padX = "pl-[max(env(safe-area-inset-left),clamp(1.25rem,4vw,4rem))] pr-[max(env(safe-area-inset-right),clamp(1.25rem,4vw,4rem))]";
const heading = "mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C6A66B]";
const link = `relative inline-block py-1.5 text-[13px] text-white/65 transition-colors hover:text-white ${focus}`;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="rcs-body overflow-hidden bg-[#03060D] text-white">
      <div className={`${padX} mx-auto max-w-[1500px] pt-16 md:pt-24`}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-5">
            {LOGO_SRC ? (
              <img src={LOGO_SRC} alt="Rare Creative Studios" className="h-10 w-auto max-w-full md:h-12" loading="lazy" />
            ) : (
              <div className="flex items-center gap-3">
                <span className="rcs-display text-[44px] leading-none">R</span>
                <span className="flex flex-col leading-none">
                  <span className="text-[14px] font-bold uppercase tracking-[0.16em]">Rare</span>
                  <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.3em] text-white/50">Creative Studios</span>
                </span>
              </div>
            )}
            <p className="mt-6 max-w-[38ch] text-[13px] leading-relaxed text-white/55">
              Strategy, storytelling, PR, and creative production for brands ready to make a lasting impression.
            </p>
          </div>

          {/* Explore */}
          <nav aria-label="Explore" className="lg:col-span-2 lg:col-start-7">
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
          <div className="lg:col-span-2">
            <h3 className={heading}>Capabilities</h3>
            <ul className="text-[13px] leading-[2] text-white/55">
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
              {SOCIALS.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={link}>
                    {s.label}
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

      {/* Outlined wordmark */}
      <p
        aria-hidden="true"
        className="rcs-display mt-14 select-none whitespace-nowrap text-center text-[clamp(3rem,15vw,13rem)] leading-[0.85] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.14)] md:mt-20"
      >
        Rare Creative Studios
      </p>

      {/* Bottom bar */}
      <div className={`${padX} border-t border-white/10 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6`}>
        <div className="mx-auto flex max-w-[1500px] flex-col gap-2 text-[10px] uppercase tracking-[0.18em] text-white/40 md:flex-row md:items-center md:justify-between">
          <p>© {year} Rare Creative Studios</p>
          <p>Independent thinking. Distinctive work.</p>
        </div>
      </div>
    </footer>
  );
}