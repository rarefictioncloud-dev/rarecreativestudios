import { Link } from "react-router-dom";

/* ------------------------------------------------------------------
   SET THESE FROM YOUR PROJECT (nothing here is invented):
   - LOGO_SRC: import your real light/white logo and assign it, e.g.
       import logo from "../assets/logo-white.svg";  const LOGO_SRC = logo;
     Until then a plain typographic wordmark is shown.
   - SOCIALS: [{ label: "Instagram", href: "https://..." }] from your real URLs.
   - EMAIL: your real address, or leave "" to point people to the Contact page.
------------------------------------------------------------------- */
const LOGO_SRC = "";
const SOCIALS = [];
const EMAIL = "";

// Route paths as used by the site's router (HashRouter-safe <Link>).
const EXPLORE = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Contact", to: "/contact" },
];
const CAPABILITIES = ["Brand Strategy", "PR & Media Relations", "Creative Campaigns", "Storytelling", "Video Production", "Digital Marketing"];

const CSS = `
@keyframes rcs-frame{to{transform:translateX(220px)}}
.rcs-frame{animation:rcs-frame 8s steps(11,end) infinite alternate}
@media (prefers-reduced-motion:reduce){.rcs-frame{animation:none}}`;

const font = '"Helvetica Now Display","Helvetica Now Text","Helvetica Neue",Helvetica,Arial,sans-serif';
const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271FF]";
const link = `relative inline-block text-white/90 transition-colors hover:text-white after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-[#5271FF] after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100 ${focus}`;
const h3 = "mb-5 text-xs font-bold tracking-[0.18em] text-[#75849B]";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ fontFamily: font }} className="overflow-hidden bg-black text-white">
      <style>{CSS}</style>

      {/* 1 — Closing statement */}
      <section aria-labelledby="footer-statement" className="px-[clamp(1.25rem,5vw,4rem)] pb-16 pt-20 md:pb-24 md:pt-32">
        <span aria-hidden="true" className="mb-8 block h-1 w-16 bg-[#FAD430]" />
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <h2 id="footer-statement" className="break-words text-[clamp(2.2rem,10.5vw,9rem)] font-bold uppercase leading-[0.9] tracking-tighter lg:col-span-8">
            <span className="block">LET'S MAKE{" "}</span>
            <span className="block">SOMETHING{" "}</span>
            <span className="block">RARE<span className="text-[#FAD430]">.</span></span>
          </h2>
          <div className="lg:col-span-4">
            <p className="max-w-[36ch] text-base leading-relaxed text-white/80 md:text-lg">
              Have an idea, a story, or a brand ready for its next chapter? Let's create something worth talking about.
            </p>
            <Link to="/contact" className={`mt-8 inline-flex min-h-12 items-center gap-3 bg-[#5271FF] px-7 py-4 text-[1.2rem] font-bold leading-none text-white transition-colors hover:bg-white hover:text-black ${focus}`}>
              START A CONVERSATION <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2 — Main footer */}
      <div className="border-t border-[#75849B]/30 px-[clamp(1.25rem,5vw,4rem)] py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="md:col-span-2 lg:col-span-5">
            {LOGO_SRC ? (
              <img src={LOGO_SRC} alt="Rare Creative Studios" className="h-10 w-auto max-w-full md:h-12" loading="lazy" />
            ) : (
              <p className="text-2xl font-bold leading-none tracking-tighter">RARE <span className="block text-xs font-bold tracking-[0.18em] text-[#75849B]">CREATIVE STUDIOS</span></p>
            )}
            <p className="mt-6 max-w-[40ch] text-base leading-relaxed text-white/80">
              Strategy, storytelling, PR, and creative production for brands ready to make a lasting impression.
            </p>
            <p className="mt-5 text-xs font-bold tracking-[0.18em] text-[#FAD430]">CREATIVE THINKING. RARE EXECUTION.</p>
          </div>

          <nav aria-label="Explore" className="lg:col-span-2 lg:col-start-7">
            <h3 className={h3}>EXPLORE</h3>
            <ul className="space-y-3">
              {EXPLORE.map((l) => <li key={l.to}><Link to={l.to} className={link}>{l.label}</Link></li>)}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h3 className={h3}>CAPABILITIES</h3>
            <ul className="space-y-3 text-white/80">
              {CAPABILITIES.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-12 lg:-mt-2">
            <h3 className={h3}>CONNECT</h3>
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {EMAIL && <li><a href={`mailto:${EMAIL}`} className={link}>{EMAIL}</a></li>}
              {SOCIALS.map((s) => <li key={s.href}><a href={s.href} target="_blank" rel="noopener noreferrer" className={link}>{s.label}</a></li>)}
              {!EMAIL && SOCIALS.length === 0 && <li><Link to="/contact" className={link}>Tell us about your project</Link></li>}
            </ul>
          </div>
        </div>

        {/* 3 — Creative detail: film frames with a single moving yellow frame */}
        <div aria-hidden="true" className="relative mt-14 h-3 w-[232px] max-w-full">
          <div className="flex gap-2">
            {Array.from({ length: 12 }, (_, i) => <span key={i} className="block h-3 w-3 border border-[#75849B]/60 bg-[#002366]" />)}
          </div>
          <span className="rcs-frame absolute left-0 top-0 block h-3 w-3 bg-[#FAD430]" />
        </div>
      </div>

      {/* 4 — Bottom bar */}
      <div className="border-t border-[#75849B]/30 px-[clamp(1.25rem,5vw,4rem)] py-6">
        <div className="flex flex-col gap-2 text-xs tracking-[0.14em] text-[#75849B] md:flex-row md:items-center md:justify-between">
          <p>© {year} RARE CREATIVE STUDIOS</p>
          <p>INDEPENDENT THINKING. DISTINCTIVE WORK.</p>
        </div>
      </div>
    </footer>
  );
}