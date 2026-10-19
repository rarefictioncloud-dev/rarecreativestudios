import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";

/* Fonts (.rcs-display, .rcs-body, .rcs-serif) are injected by Navbar, which is mounted on every page. */

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

/* ---------- Hero: monumental cobalt R in a concrete hall (pure CSS, no assets) ---------- */

function HeroR() {
  const mask = "linear-gradient(to bottom, rgba(0,0,0,.7), transparent 40%)";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-full opacity-60 md:w-[64%] md:opacity-100">
      <div className={`absolute left-[6%] top-0 h-[80%] w-[15%] ${stone}`} />
      <div className={`absolute right-[4%] top-[8%] h-[70%] w-[30%] rounded-tr-[45%] ${stone} opacity-90`} />
      <div className="absolute left-[36%] top-0 h-full w-[22%] bg-gradient-to-b from-white/25 via-[#7d93ff]/20 to-transparent blur-3xl" />

      <div className="absolute left-1/2 top-[5%] flex -translate-x-1/2 flex-col items-center">
        <span className={`rcs-display select-none ${rGrad} bg-clip-text text-[clamp(17rem,76svh,40rem)] leading-[0.8] text-transparent drop-shadow-[0_0_70px_rgba(82,113,255,0.5)]`}>R</span>
        <span
          className={`rcs-display -mt-2 scale-y-[-1] select-none ${rGrad} bg-clip-text text-[clamp(17rem,76svh,40rem)] leading-[0.8] text-transparent opacity-30`}
          style={{ WebkitMaskImage: mask, maskImage: mask }}
        >
          R
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[26%] bg-gradient-to-t from-[#050A14] via-[#0b1740]/60 to-transparent" />

      <svg viewBox="0 0 12 36" className="absolute bottom-[19%] left-[27%] h-[7svh] w-auto fill-[#03060d]">
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
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-[radial-gradient(ellipse_at_70%_30%,#0f1d3d_0%,#050A14_62%)] px-5 pb-14 pt-32 sm:px-8 md:px-[4vw] md:pb-16">
        <HeroR />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,#050A14_0%,rgba(5,10,20,0.82)_32%,transparent_62%)]" />

        <div className="relative z-10 mx-auto w-full max-w-[1380px]">
          <h1 data-reveal className="rcs-display max-w-[11ch] text-[clamp(1.95rem,5.3vw,4.8rem)]">
            We don’t send press releases.
            <span className="block text-[#5271FF]">We create moments.</span>
          </h1>

          <p data-reveal className="mt-7 max-w-[34ch] text-[10.5px] leading-relaxed text-white/80 md:text-[12px]">
            Strategy-led storytelling that turns brands into conversations people remember.
          </p>

          <div data-reveal className="mt-9 flex flex-wrap items-center gap-x-9 gap-y-4">
            <Link
              to="/services"
              className={`group inline-flex min-h-12 items-center gap-3 rounded-[3px] bg-[#C6A66B] px-6 text-[8px] font-bold uppercase tracking-[0.16em] text-[#050A14] transition-colors hover:bg-[#DDC89D] ${focus}`}
            >
              Explore our work
              <ArrowUpRight size={15} strokeWidth={2} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link to="/contact" className={`group inline-flex min-h-12 items-center gap-3 text-[8px] font-semibold uppercase tracking-[0.18em] text-white ${focus}`}>
              Let’s talk
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-14 flex items-end justify-between border-t border-white/10 pt-5">
            <a href="#chapters" className={`group flex items-center gap-3 text-[8px] uppercase tracking-[0.22em] text-white/50 transition-colors hover:text-white ${focus}`}>
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
      <section id="chapters" aria-label="How we think" className="border-t border-white/10">
        {CHAPTERS.map((c) => (
          <article key={c.n} className="grid border-b border-white/10 md:min-h-[360px] md:grid-cols-[1fr_1.15fr]">
            <div data-reveal className="flex flex-col justify-between px-5 py-12 sm:px-8 md:px-[4vw] md:py-14">
              <div>
                <h2 className="rcs-display max-w-[16ch] text-[clamp(1.3rem,2.7vw,2.35rem)]">
                  {c.white} <span className="text-[#C6A66B]">{c.gold}</span>
                </h2>
                <p className="mt-5 max-w-[36ch] text-[10px] leading-relaxed text-white/65">{c.text}</p>
              </div>
              <div className="mt-10 flex items-center gap-4 text-[8px] tracking-[0.2em] text-white/50" aria-hidden="true">
                {c.n}
                <span className="h-px w-24 bg-white/25" />
              </div>
            </div>
            <div aria-hidden="true" className="relative min-h-[260px] overflow-hidden bg-[#070d1c] md:min-h-0">
              <Art kind={c.art} />
            </div>
          </article>
        ))}
      </section>

      {/* ============ POINT OF VIEW (light) ============ */}
      <section className="bg-[#ECEBE7] text-[#050A14]">
        <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[0.8fr_1.3fr_0.6fr]">
          <div aria-hidden="true" className="relative hidden min-h-[360px] overflow-hidden lg:block">
            <span className="absolute -left-[30%] top-[6%] h-[120%] w-[130%] rounded-[50%] border-[56px] border-[#c9c8c3] opacity-80" />
            <span className="absolute bottom-0 left-[44%] h-[46%] w-[28%] bg-gradient-to-b from-[#2038d8] to-[#0b1560]" />
          </div>

          <div data-reveal className="px-5 py-20 sm:px-8 md:px-[4vw] lg:px-14 lg:py-28">
            <h2 className="rcs-display max-w-[14ch] text-[clamp(1.45rem,3vw,2.75rem)]">
              PR is no longer about visibility.
              <span className="block text-[#B28F4A]">It’s about relevance.</span>
            </h2>
            <p className="mt-6 max-w-[44ch] text-[10.5px] leading-relaxed text-[#050A14]/70">
              We design stories that make brands culturally meaningful, not just momentarily noticed.
            </p>

            <ol className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#050A14]/60">
              {APPROACH.map((a, i) => (
                <li key={a}>
                  <span className="mr-2 text-[#B28F4A]">0{i + 1}</span>
                  {a}
                </li>
              ))}
            </ol>

            <Link to="/about" className={`group mt-9 inline-flex min-h-11 items-center gap-3 text-[8px] font-bold uppercase tracking-[0.2em] ${focus}`}>
              Our approach
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <blockquote data-reveal className="flex flex-col justify-center border-t border-[#050A14]/10 px-5 pb-16 sm:px-8 lg:border-l lg:border-t-0 lg:px-10 lg:py-28">
            <span aria-hidden="true" className="rcs-serif text-[2.4rem] leading-none text-[#B28F4A]">“</span>
            <p className="max-w-[12ch] text-[14.5px] leading-snug">Relevance creates influence.</p>
          </blockquote>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="relative isolate overflow-hidden bg-[#050A14] px-5 py-24 sm:px-8 md:px-[4vw] md:py-32">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 w-[70%] bg-[radial-gradient(ellipse_at_85%_60%,rgba(40,70,255,0.55),transparent_55%),radial-gradient(ellipse_at_60%_100%,rgba(82,113,255,0.35),transparent_50%)] blur-2xl" />

        <div className="mx-auto grid max-w-[1380px] gap-14 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20">
          <div data-reveal>
            <p className="mb-6 text-[8px] font-semibold uppercase tracking-[0.3em] text-[#C6A66B]">Our services</p>
            <h2 className="rcs-display text-[clamp(1.95rem,4vw,3.65rem)]">
              Idea.
              <span className="block text-[#5271FF]">Narrative.</span>
              Impact.
            </h2>
            <p className="mt-6 max-w-[30ch] text-[10px] leading-relaxed text-white/65">
              A strategic approach to PR, brand positioning and cultural storytelling.
            </p>
            <Link
              to="/services"
              className={`group mt-8 inline-flex min-h-11 items-center gap-3 rounded-full border border-[#C6A66B]/70 px-6 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#DDC89D] transition-colors hover:bg-[#C6A66B] hover:text-[#050A14] ${focus}`}
            >
              Explore services
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <li key={s.number} data-reveal>
                <Link to="/services" className={`group block border-t border-white/20 pt-5 ${focus}`}>
                  <span className="text-[8px] tracking-[0.2em] text-[#C6A66B]">{s.number}</span>
                  <h3 className="rcs-display mt-3 text-[clamp(1rem,1.45vw,1.3rem)] transition-colors group-hover:text-[#5271FF]">{s.title}</h3>
                  <p className="mt-3 max-w-[34ch] text-[9px] leading-relaxed text-white/60">{s.description}</p>
                  <ArrowRight size={16} className="mt-5 text-[#C6A66B] transition-transform group-hover:translate-x-2" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative isolate overflow-hidden bg-[#050A14] px-5 py-24 sm:px-8 md:px-[4vw] md:py-32">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_110%,rgba(40,70,255,0.8),transparent_55%),radial-gradient(ellipse_at_20%_0%,rgba(0,35,102,0.8),transparent_55%)]" />
        <div className="mx-auto flex max-w-[1380px] flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <h2 data-reveal className="rcs-serif max-w-[16ch] text-[clamp(1.45rem,3.5vw,3rem)] uppercase leading-[1.05] text-[#C6A66B]">
            Your next defining moment starts here.
          </h2>
          <Link to="/contact" data-reveal className={`group inline-flex shrink-0 items-center gap-5 text-[8px] font-semibold uppercase tracking-[0.2em] ${focus}`}>
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