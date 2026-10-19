import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight } from "lucide-react";

/* Fonts (.rcs-display, .rcs-body, .rcs-serif) are injected by Navbar, which is mounted on every page.
   TYPE RULE: every size at md (768px) and up is exactly the original. Only phones get larger, readable sizes. */

const SERVICES = [
  { number: "01", title: "Narrative Design", description: "We shape the stories, perspectives, and positioning that make your brand matter." },
  { number: "02", title: "PR & Media Relations", description: "We build credibility through meaningful conversations and strategic media relationships." },
  { number: "03", title: "Thought Leadership", description: "We turn expertise into influence, helping the right voices lead important conversations." },
  { number: "04", title: "Creative Campaigns", description: "We transform distinctive ideas into campaigns that connect with people and culture." },
];

const APPROACH = ["Find the story", "Shape the narrative", "Create the moment"];

const CHAPTERS = [
  { n: "01", white: "Every great story begins with an", gold: "idea.", text: "We turn perspective into powerful narratives that shape culture.", art: "cubes" },
  { n: "02", white: "Attention is temporary.", gold: "A story can change everything.", text: "We craft narratives that move beyond the feed and into the real world.", art: "tiers" },
  { n: "03", white: "We create the conversations", gold: "people remember.", text: "Through strategic storytelling and cultural insight, we position your brand where it matters.", art: "ring" },
  { n: "04", white: "Visibility gets you noticed.", gold: "Relevance makes you matter.", text: "We create moments that last longer than a headline.", art: "door" },
];

const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C6A66B]";
const stone = "bg-gradient-to-b from-[#b4b8c2] via-[#737a89] to-[#262c3b]";
const rGrad = "bg-[linear-gradient(105deg,#16249a_0%,#4a68ff_42%,#2036c4_68%,#0b1560_100%)]";
const label = "text-[11px] md:text-[8px]"; // small caps labels: 8px on desktop, 11px on phones

/* ---------- Hero: monumental cobalt R in a concrete hall (pure CSS, no assets) ---------- */

function HeroR() {
  const mask = "linear-gradient(to bottom, rgba(0,0,0,.7), transparent 40%)";
  const size = "text-[clamp(9rem,34svh,18rem)] md:text-[clamp(14rem,64svh,36rem)]";
  return (
    /* Phones: the R owns the top of the screen so it never sits behind the headline. Desktop: unchanged. */
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[max(5.5rem,11svh)] h-[50%] w-full md:inset-x-auto md:bottom-0 md:right-0 md:h-auto md:w-[64%]">
      <div className={`absolute left-[4%] top-0 h-[74%] w-[17%] ${stone} md:left-[6%] md:h-[80%] md:w-[15%]`} />
      <div className={`absolute right-[2%] top-[8%] h-[62%] w-[32%] rounded-tr-[45%] ${stone} opacity-90 md:right-[4%] md:h-[70%] md:w-[30%]`} />
      <div className="absolute left-[36%] top-0 h-full w-[22%] bg-gradient-to-b from-white/25 via-[#7d93ff]/20 to-transparent blur-3xl" />

      <div className="absolute left-1/2 top-[4%] flex -translate-x-1/2 flex-col items-center md:top-[3%]">
        <span className={`rcs-display select-none ${rGrad} bg-clip-text ${size} leading-[0.8] text-transparent drop-shadow-[0_0_70px_rgba(82,113,255,0.5)]`}>R</span>
        <span
          className={`rcs-display -mt-2 scale-y-[-1] select-none ${rGrad} bg-clip-text ${size} leading-[0.8] text-transparent opacity-30`}
          style={{ WebkitMaskImage: mask, maskImage: mask }}
        >
          R
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[26%] bg-gradient-to-t from-[#050A14] via-[#0b1740]/60 to-transparent" />

      <svg viewBox="0 0 12 36" className="absolute bottom-[24%] left-[27%] h-[6svh] w-auto fill-[#03060d] md:bottom-[19%] md:h-[7svh]">
        <circle cx="6" cy="4" r="3" />
        <path d="M2 10h8l1 14H9l-.5 12h-2L6 26l-.5 10h-2L3 24H1z" />
      </svg>
    </div>
  );
}

/* ---------- Chapter art (CSS / SVG) ---------- */

function Art({ kind }) {
  if (kind === "cubes")
    return (
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_25%,rgba(82,113,255,0.35),transparent_60%)]">
        <span className="absolute left-[16%] top-[20%] h-16 w-16 rotate-12 bg-gradient-to-br from-[#8da0ff] to-[#1c2fa8] shadow-2xl" />
        <span className="absolute left-[46%] top-[10%] h-24 w-20 -rotate-6 bg-gradient-to-br from-[#5271FF] to-[#0d1a6b]" />
        <span className="absolute left-[72%] top-[28%] h-14 w-14 rotate-45 bg-gradient-to-br from-[#cfd5e6] to-[#6b7388]" />
        <span className="absolute -bottom-6 left-[20%] h-24 w-[70%] -rotate-6 bg-gradient-to-b from-[#9ea3af] to-[#2b3142]" />
      </div>
    );
  if (kind === "tiers")
    return (
      <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,255,255,0.12),transparent_60%)]">
        <div className="relative h-[70%] w-[64%]">
          <span className="absolute inset-x-[16%] top-[4%] h-[30%] rounded-[50%] bg-gradient-to-b from-[#7d93ff] to-[#16249a]" />
          <span className="absolute inset-x-[8%] top-[30%] h-[28%] rounded-[50%] bg-gradient-to-b from-[#d7d9df] to-[#7a8090]" />
          <span className="absolute inset-x-0 top-[52%] h-[34%] rounded-[50%] bg-gradient-to-b from-[#b9bdc7] to-[#2b3142]" />
        </div>
      </div>
    );
  if (kind === "ring")
    return (
      <div className="absolute inset-0 grid place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_60%_50%,rgba(82,113,255,0.3),transparent_62%)]">
        <svg viewBox="0 0 400 400" className="rcs-spin h-[120%] max-h-[420px] w-auto">
          <defs>
            <path id="rcs-ring" d="M200 200 m-150 0 a150 150 0 1 1 300 0 a150 150 0 1 1 -300 0" />
            <linearGradient id="rcs-silver" x1="0" x2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.5" stopColor="#8f9bb3" />
              <stop offset="1" stopColor="#e9edf7" />
            </linearGradient>
          </defs>
          <circle cx="200" cy="200" r="104" fill="#2036c4" opacity="0.55" />
          <text fill="url(#rcs-silver)" fontFamily="Anton, Impact, sans-serif" fontSize="44" letterSpacing="3">
            <textPath href="#rcs-ring">CONVERSATIONS · CONVERSATIONS ·</textPath>
          </text>
        </svg>
      </div>
    );
  return (
    <div className="absolute inset-0">
      <span className={`absolute left-[18%] top-0 h-full w-[16%] ${stone}`} />
      <span className={`absolute right-[8%] top-0 h-full w-[18%] ${stone}`} />
      <span className="absolute left-[38%] top-[4%] h-[72%] w-[26%] bg-gradient-to-b from-[#1f35d6] to-[#0b1560] shadow-[0_0_60px_rgba(82,113,255,0.6)]" />
      <span className="absolute bottom-0 left-[24%] h-[26%] w-[52%] bg-[repeating-linear-gradient(to_bottom,#e7e8ec_0,#e7e8ec_3px,#9aa0ad_3px,#9aa0ad_10px)]" />
      <svg viewBox="0 0 12 36" className="absolute bottom-[26%] left-[49%] h-[17%] w-auto fill-[#03060d]">
        <circle cx="6" cy="4" r="3" />
        <path d="M2 10h8l1 14H9l-.5 12h-2L6 26l-.5 10h-2L3 24H1z" />
      </svg>
    </div>
  );
}

/* ---------- Page ---------- */

export default function Home() {
  const pageRef = useRef(null);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const items = root.querySelectorAll("[data-reveal]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("rcs-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("rcs-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main ref={pageRef} className="rcs-body overflow-clip bg-[#050A14] text-white">
      <style>{`
        [data-reveal] { opacity: 0; transform: translateY(22px); transition: opacity .9s ease, transform .9s cubic-bezier(.2,.65,.25,1); }
        [data-reveal].rcs-visible { opacity: 1; transform: none; }
        @keyframes rcs-spin { to { transform: rotate(360deg); } }
        .rcs-spin { animation: rcs-spin 60s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal] { opacity: 1; transform: none; transition: none; }
          .rcs-spin { animation: none; }
        }
      `}</style>

      {/* ============ HERO ============ */}
      <section className="relative isolate flex h-[100svh] min-h-[560px] items-end overflow-hidden bg-[radial-gradient(ellipse_at_70%_30%,#0f1d3d_0%,#050A14_62%)] px-5 pb-[max(1rem,3svh)] pt-[max(5.5rem,11svh)] sm:px-8 md:px-[4vw]">
        <HeroR />
        {/* phones: fade up from the bottom so the type sits on solid navy; desktop: original left-to-right fade */}
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,20,0)_34%,rgba(5,10,20,0.88)_58%,#050A14_74%)] md:bg-[linear-gradient(90deg,#050A14_0%,rgba(5,10,20,0.82)_32%,transparent_62%)]" />

        <div className="relative z-10 mx-auto w-full max-w-[1380px]">
          <h1 data-reveal className="rcs-display max-w-[11ch] text-[clamp(1.9rem,min(11.5vw,7.4svh),3.6rem)] md:text-[clamp(1.9rem,min(5.3vw,8.4svh),4.8rem)]">
            We don’t send press releases.
            <span className="block text-[#5271FF]">We create moments.</span>
          </h1>

          <p data-reveal className="mt-[2.2svh] max-w-[34ch] text-[15px] leading-relaxed text-white/85 md:text-[12px] md:text-white/80">
            Strategy-led storytelling that turns brands into conversations people remember.
          </p>

          <div data-reveal className="mt-[2.6svh] flex flex-wrap items-center gap-x-9 gap-y-4">
            <Link
              to="/contact"
              className={`group inline-flex min-h-12 items-center gap-3 rounded-full border border-[#C6A66B]/70 px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#C6A66B] hover:text-[#050A14] md:min-h-12 md:rounded-none md:border-0 md:px-0 md:text-[8px] md:hover:bg-transparent md:hover:text-white ${focus}`}
            >
              Let’s talk
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-[3svh] flex items-end justify-between border-t border-white/10 pt-[1.4svh]">
            <a href="#chapters" className={`group flex min-h-11 items-center gap-3 ${label} uppercase tracking-[0.22em] text-white/60 transition-colors hover:text-white md:text-white/50 ${focus}`}>
              Scroll to explore
              <ArrowDown size={13} className="transition-transform group-hover:translate-y-1" />
            </a>
            <ul aria-hidden="true" className="hidden text-right text-[8px] uppercase leading-[2] tracking-[0.25em] text-white/55 md:block">
              {["Ideas", "Stories", "Culture", "Influence", "Impact"].map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ CHAPTERS ============ */}
      <section id="chapters" aria-label="How we think" className="scroll-mt-4 border-t border-white/10">
        {CHAPTERS.map((c) => (
          <article key={c.n} className="grid min-h-[100svh] grid-rows-[42svh_1fr] border-b border-white/10 md:grid-cols-[1fr_1.15fr] md:grid-rows-none">
            {/* phones: image first, then the line; desktop keeps text-left / art-right */}
            <div aria-hidden="true" className="relative order-first overflow-hidden bg-[#070d1c] md:order-none">
              <Art kind={c.art} />
              <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#050A14] to-transparent md:hidden" />
            </div>
            <div data-reveal className="flex flex-col justify-between px-5 py-10 sm:px-8 md:px-[4vw] md:py-14">
              <div>
                <h2 className="rcs-display max-w-[16ch] text-[clamp(1.6rem,7.4vw,2.2rem)] md:text-[clamp(1.3rem,2.7vw,2.35rem)]">
                  {c.white} <span className="text-[#C6A66B]">{c.gold}</span>
                </h2>
                <p className="mt-4 max-w-[36ch] text-[15px] leading-relaxed text-white/70 md:mt-5 md:text-[10px] md:text-white/65">{c.text}</p>
              </div>
              <div className={`mt-8 flex items-center gap-4 ${label} tracking-[0.2em] text-[#C6A66B] md:mt-10 md:text-white/50`} aria-hidden="true">
                {c.n}
                <span className="h-px w-24 bg-[#C6A66B]/40 md:bg-white/25" />
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* ============ POINT OF VIEW (light) ============ */}
      <section className="flex min-h-[100svh] items-center bg-[#ECEBE7] text-[#050A14]">
        <div className="mx-auto grid w-full max-w-[1500px] lg:grid-cols-[0.8fr_1.3fr_0.6fr]">
          <div aria-hidden="true" className="relative h-36 overflow-hidden sm:h-44 lg:h-auto lg:min-h-[360px]">
            <span className="absolute -left-[30%] top-[6%] h-[120%] w-[130%] rounded-[50%] border-[28px] border-[#c9c8c3] opacity-80 lg:border-[56px]" />
            <span className="absolute bottom-0 left-[44%] h-[46%] w-[28%] bg-gradient-to-b from-[#2038d8] to-[#0b1560] max-lg:left-[62%] max-lg:h-[70%] max-lg:w-[14%]" />
          </div>

          <div data-reveal className="px-5 py-14 sm:px-8 md:px-[4vw] lg:px-14 lg:py-28">
            <h2 className="rcs-display max-w-[14ch] text-[clamp(1.7rem,8vw,2.4rem)] md:text-[clamp(1.45rem,3vw,2.75rem)]">
              PR is no longer about visibility.
              <span className="block text-[#B28F4A]">It’s about relevance.</span>
            </h2>
            <p className="mt-5 max-w-[44ch] text-[15px] leading-relaxed text-[#050A14]/75 md:mt-6 md:text-[10.5px] md:text-[#050A14]/70">
              We design stories that make brands culturally meaningful, not just momentarily noticed.
            </p>

            <ol className={`mt-7 flex flex-col gap-y-3 ${label} font-semibold uppercase tracking-[0.18em] text-[#050A14]/70 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2 md:mt-8 md:text-[#050A14]/60`}>
              {APPROACH.map((a, i) => (
                <li key={a}>
                  <span className="mr-2 text-[#8A6A2B] md:text-[#B28F4A]">0{i + 1}</span>
                  {a}
                </li>
              ))}
            </ol>

            <Link to="/about" className={`group mt-8 inline-flex min-h-12 items-center gap-3 border-b border-[#B28F4A] ${label} font-bold uppercase tracking-[0.2em] md:mt-9 md:min-h-11 md:border-0 ${focus}`}>
              Our approach
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <blockquote data-reveal className="flex flex-col justify-center border-t border-[#050A14]/10 px-5 pb-14 pt-8 sm:px-8 lg:border-l lg:border-t-0 lg:px-10 lg:py-28">
            <span aria-hidden="true" className="rcs-serif text-[2.4rem] leading-none text-[#B28F4A]">“</span>
            <p className="max-w-[14ch] text-xl leading-snug md:text-[14.5px]">Relevance creates influence.</p>
          </blockquote>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#050A14] px-5 py-20 sm:px-8 md:px-[4vw] md:py-24">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 w-full bg-[radial-gradient(ellipse_at_85%_60%,rgba(40,70,255,0.55),transparent_55%),radial-gradient(ellipse_at_60%_100%,rgba(82,113,255,0.35),transparent_50%)] blur-2xl md:w-[70%]" />

        <div className="mx-auto grid w-full max-w-[1380px] gap-12 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
          <div data-reveal>
            <p className={`mb-5 ${label} font-semibold uppercase tracking-[0.3em] text-[#C6A66B] md:mb-6`}>Our services</p>
            <h2 className="rcs-display text-[clamp(2.3rem,11.5vw,3.2rem)] md:text-[clamp(1.95rem,4vw,3.65rem)]">
              Idea.
              <span className="block text-[#5271FF]">Narrative.</span>
              Impact.
            </h2>
            <p className="mt-5 max-w-[30ch] text-[15px] leading-relaxed text-white/70 md:mt-6 md:text-[10px] md:text-white/65">
              A strategic approach to PR, brand positioning and cultural storytelling.
            </p>
            <Link
              to="/services"
              className={`group mt-7 inline-flex min-h-12 items-center gap-3 rounded-full border border-[#C6A66B]/70 px-6 ${label} font-semibold uppercase tracking-[0.18em] text-[#DDC89D] transition-colors hover:bg-[#C6A66B] hover:text-[#050A14] md:mt-8 md:min-h-11 ${focus}`}
            >
              Explore services
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ul className="grid gap-x-10 gap-y-2 sm:grid-cols-2 md:gap-y-12">
            {SERVICES.map((s) => (
              <li key={s.number} data-reveal>
                <Link to="/services" className={`group block border-t border-white/20 py-6 md:pb-0 md:pt-5 ${focus}`}>
                  <span className={`${label} tracking-[0.2em] text-[#C6A66B]`}>{s.number}</span>
                  <h3 className="rcs-display mt-2 text-[clamp(1.3rem,6vw,1.6rem)] transition-colors group-hover:text-[#5271FF] md:mt-3 md:text-[clamp(1rem,1.45vw,1.3rem)]">{s.title}</h3>
                  <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-white/65 md:text-[9px] md:text-white/60">{s.description}</p>
                  <ArrowRight size={18} className="mt-4 text-[#C6A66B] transition-transform group-hover:translate-x-2 md:mt-5 md:h-4 md:w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#050A14] px-5 py-20 sm:px-8 md:px-[4vw] md:py-24">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_110%,rgba(40,70,255,0.8),transparent_55%),radial-gradient(ellipse_at_20%_0%,rgba(0,35,102,0.8),transparent_55%)]" />
        <div className="mx-auto flex w-full max-w-[1380px] flex-col gap-10 md:flex-row md:items-end md:justify-between md:gap-12">
          <h2 data-reveal className="rcs-serif max-w-[16ch] text-[clamp(1.8rem,9vw,2.6rem)] uppercase leading-[1.05] text-[#C6A66B] md:text-[clamp(1.45rem,3.5vw,3rem)]">
            Your next defining moment starts here.
          </h2>
          <Link to="/contact" data-reveal className={`group inline-flex shrink-0 items-center gap-5 ${label} font-semibold uppercase tracking-[0.2em] ${focus}`}>
            <span className="grid h-16 w-16 place-items-center rounded-full border border-[#C6A66B]/80 text-[#C6A66B] transition-colors duration-300 group-hover:bg-[#C6A66B] group-hover:text-[#050A14]">
              <ArrowRight size={20} strokeWidth={1.6} />
            </span>
            Start a conversation
          </Link>
        </div>
      </section>
    </main>
  );
}