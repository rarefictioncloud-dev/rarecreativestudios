import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight, Megaphone, Newspaper, PenLine, Share2, Target } from "lucide-react";

/* ====================================================================
   EVERYTHING FOR THE HOME PAGE LIVES IN THIS ONE FILE (no extra imports,
   no image files). Navbar and Footer are NOT part of this file. The hero
   is ivory, so the navbar needs dark text at the top of the page.

   RESPONSIVE MODEL (mobile first)
   - ALL SIZES: the hero is the whole first screen (100svh). Nothing of
               the next section peeks in underneath it.
   - < 1024px  phone + tablet: type and spacing are built on one unit,
               --u (1vw on phones, capped at 7.5px). The headline block
               sits in the upper part of the screen, the numbered list,
               the walking figure and the scroll cue are anchored to the
               bottom, and the doorway runs the full height. Taller
               phones just get more breathing room in the middle.
               Selected work is a one-card swipe carousel with a progress
               bar (3-col grid from 768px). Every card is a link.
   - >= 1024   desktop: same design as before (1586:762 composition in
               vw). On shorter laptop screens it now grows to fill the
               full screen height instead of leaving a strip of the next
               section visible.
   Small text never drops below 10px, body text never below 14px
   (except the decorative numbered list on the hero's right wall).
   ==================================================================== */

const CONTACT_EMAIL = "REPLACE-ME@yourdomain.com"; // <- replace with the real studio email

const COBALT = "#0b3fd9";
const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b3fd9]";

/* type helpers: fluid below lg, vw above lg, with readable floors */
const monoS = "text-[10px] lg:text-[max(10px,0.75vw)]";
const monoXS = "text-[10px] lg:text-[max(10px,0.62vw)]";
const bodyL = "text-[15px] leading-relaxed sm:text-[16px] lg:text-[max(14px,1.15vw)]";
const padX = "px-5 sm:px-8 lg:px-[6.4vw]";

const LIST = ["Ideas", "People", "Culture", "Coverage", "Results"];

const PROJECTS = [
  { n: "01", title: "A bolder tomorrow", cat: "Brand positioning / Global campaign", art: "face" },
  { n: "02", title: "Leaders talk different", cat: "Thought leadership / Media strategy", art: "beam" },
  { n: "03", title: "Culture in motion", cat: "Influencer campaign / Digital amplification", art: "room" },
];

const SERVICES = [
  { n: "01", icon: Target, title: "Brand Positioning", text: "Define how brands are perceived and remembered." },
  { n: "02", icon: Newspaper, title: "Media Strategy", text: "Build relevance through strategic media relationships and placements." },
  { n: "03", icon: PenLine, title: "Story Development", text: "Create narratives that connect brands with audiences." },
  { n: "04", icon: Megaphone, title: "Campaign Execution", text: "Turn ideas into culturally meaningful moments." },
  { n: "05", icon: Share2, title: "Digital Amplification", text: "Extend stories across digital platforms and communities." },
];

const PROCESS = [
  { n: "01", t: "Idea", d: "Find the strategic opportunity.", size: "28%" },
  { n: "02", t: "Narrative", d: "Create the story people care about.", size: "62%" },
  { n: "03", t: "Impact", d: "Turn attention into lasting relevance.", size: "100%" },
];

const ARTICLES = [
  { cat: "Perspective", title: "Why the Best PR Doesn’t Look Like PR", bg: "from-[#c6cbd3] to-[#f5f2ea]" },
  { cat: "Strategy", title: "Why Distance Is the Secret Language of Luxury", bg: "from-[#071c50] to-[#0b3fd9]" },
  { cat: "Thinking", title: "From Visibility to Cultural Relevance", bg: "from-[#111111] to-[#5b616b]" },
];

const NOISE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* ====================================================================
   HERO SCENE (SVG, 1586 x 762 space). The viewBox is swapped per screen
   size: desktop shows the whole hall, below lg it is a tall crop (the
   scene is extended far upward past y=0 so the doorway runs the full
   height of any phone, anchored to the floor).
   ==================================================================== */

const BOX = { desk: "0 0 1586 762", small: "451 -1000 712 1762" };

function useSceneBox() {
  const get = () => {
    if (typeof window === "undefined") return BOX.desk;
    return window.innerWidth >= 1024 ? BOX.desk : BOX.small;
  };
  const [box, setBox] = useState(get);
  useEffect(() => {
    const on = () => setBox(get());
    on();
    window.addEventListener("resize", on, { passive: true });
    return () => window.removeEventListener("resize", on);
  }, []);
  return box;
}

function HeroScene({ box }) {
  const mobile = box === BOX.small;
  const k = mobile ? 1.2 : 1; // the figure is larger in the tall crop
  const yOff = mobile ? -10 : 0;
  const lineGap = mobile ? 30 : 33;

  return (
    <svg viewBox={box} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true" role="presentation">
      <defs>
        <linearGradient id="hs-wallL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3f0e8" />
          <stop offset="1" stopColor="#e6e2d8" />
        </linearGradient>
        <linearGradient id="hs-wallR" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d4d2cc" />
          <stop offset="1" stopColor="#a9a7a1" />
        </linearGradient>
        <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f7cd0" />
          <stop offset="0.5" stopColor="#5f9ae0" />
          <stop offset="0.8" stopColor="#a6c8ef" />
          <stop offset="1" stopColor="#d3e3f4" />
        </linearGradient>
        <linearGradient id="hs-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ea8c4" />
          <stop offset="1" stopColor="#b9cde0" />
        </linearGradient>
        <linearGradient id="hs-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d3d1cb" />
          <stop offset="0.5" stopColor="#b2b0ab" />
          <stop offset="1" stopColor="#8f8d89" />
        </linearGradient>
        <linearGradient id="hs-coat" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#09090b" />
          <stop offset="0.6" stopColor="#1b1c20" />
          <stop offset="1" stopColor="#09090b" />
        </linearGradient>
        <linearGradient id="hs-fadeg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id="hs-fade"><rect x="700" y="640" width="520" height="122" fill="url(#hs-fadeg)" /></mask>
        <clipPath id="hs-slot"><rect x="875" y="0" width="136" height="662" /></clipPath>
        <filter id="hs-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id="hs-soft2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16" /></filter>
        <g id="hs-man">
          <ellipse cx="0" cy="-132" rx="8.5" ry="10" fill="#0b0b0d" />
          <path d="M-8-122L8-122C18-118 22-108 22-96L25-60 29-14-29-14-25-60-22-96C-22-108-18-118-8-122Z" fill="url(#hs-coat)" />
          <path d="M-12-14L-10 0-3 0-2-14ZM2-14L3 0 11 0 12-14Z" fill="#0b0b0d" />
        </g>
      </defs>

      {/* base (extended above y=0 for the tall mobile crop) */}
      <rect x="-200" y="-1200" width="2000" height="2000" fill="#efebe3" />

      {/* left wall, lit; a big diagonal shadow cuts its lower corner */}
      <polygon points="-200,0 875,0 875,662 -200,706" fill="url(#hs-wallL)" />
      <rect x="-200" y="-1200" width="1075" height="1201" fill="#f3f0e8" />
      <polygon points="0,352 358,694 0,700" fill="#2b2a26" opacity="0.2" filter="url(#hs-soft)" />
      {mobile && <polygon points="451,360 800,664 451,692" fill="#2b2a26" opacity="0.2" filter="url(#hs-soft)" />}

      {/* the slot: sky, distant land, sea, drifting clouds */}
      <rect x="875" y="-1200" width="136" height="1201" fill="#3f7cd0" />
      <g clipPath="url(#hs-slot)">
        <rect x="875" y="0" width="136" height="662" fill="url(#hs-sky)" />
        <polygon points="875,606 930,598 960,604 1011,610 1011,626 875,626" fill="#8a9db5" opacity="0.8" />
        <rect x="875" y="618" width="136" height="44" fill="url(#hs-sea)" />
        <g transform={mobile ? "translate(0 -115)" : undefined}>
          <g className="rcs-drift" fill="#fff">
            <ellipse cx="905" cy="548" rx="42" ry="16" opacity="0.95" />
            <ellipse cx="940" cy="530" rx="38" ry="20" opacity="0.95" />
            <ellipse cx="980" cy="522" rx="34" ry="22" opacity="0.92" />
            <ellipse cx="1000" cy="545" rx="34" ry="16" opacity="0.95" />
            <ellipse cx="930" cy="560" rx="60" ry="12" opacity="0.9" />
            {!mobile && <ellipse cx="920" cy="140" rx="50" ry="8" opacity="0.25" />}
          </g>
        </g>
      </g>

      {/* right wall: bright upper-left, long shadow wedge below */}
      <polygon points="1011,0 1800,0 1800,700 1011,664" fill="url(#hs-wallR)" />
      <rect x="1011" y="-1200" width="789" height="1201" fill="url(#hs-wallR)" />
      <polygon points="1011,0 1390,0 1011,458" fill="#ebe9e3" opacity="0.9" filter="url(#hs-soft)" />
      <rect x="1011" y="-1200" width="379" height="1208" fill="#ebe9e3" opacity="0.9" />
      <polygon points="1011,430 1330,632 1586,650 1800,700 1011,664" fill="#4f4d48" opacity="0.3" filter="url(#hs-soft)" />
      <polygon points="1430,0 1586,0 1586,240" fill="#f0eee8" opacity="0.35" filter="url(#hs-soft2)" />
      <line x1="1011" y1="-1200" x2="1011" y2="664" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.5" />
      <line x1="875" y1="-1200" x2="875" y2="662" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.5" />

      {/* engraved lettering in the right wall */}
      <text
        transform={mobile ? "translate(1032 10) rotate(-13) skewX(-6) scale(0.46 1)" : "translate(1064 168) rotate(-13) skewX(-6)"}
        fontFamily="'Playfair Display', Georgia, serif"
        fontSize={mobile ? 36 : 38}
        letterSpacing="-1.2"
        fill="#7b7972"
        opacity="0.75"
        style={{ textTransform: "uppercase" }}
      >
        <tspan x="0" dy="0">Ideas</tspan>
        <tspan x="2" dy={lineGap}>People</tspan>
        <tspan x="4" dy={lineGap}>Culture</tspan>
        <tspan x="6" dy={lineGap + 1}>Brands</tspan>
      </text>

      {/* polished floor */}
      <polygon points="-200,706 875,662 1011,664 1800,700 1800,762 -200,762" fill="url(#hs-floor)" />
      <polygon points="0,700 360,694 540,762 0,762" fill="#000" opacity="0.12" filter="url(#hs-soft)" />
      <polygon points="875,662 1011,664 1140,762 750,762" fill="#dbe9f7" opacity="0.85" filter="url(#hs-soft)" />
      <polygon points="1011,664 1800,700 1800,716 1011,674" fill="#fff" opacity="0.18" />

      {/* the figure, his reflection and long shadow */}
      <g mask="url(#hs-fade)">
        <use href="#hs-man" transform={`translate(960 ${700 + yOff}) scale(${0.92 * k} ${-0.72 * k})`} opacity="0.32" filter="url(#hs-soft)" />
      </g>
      <g transform={`translate(0 ${yOff})`}>
        <path d="M964 698 L1128 712 L1120 718 L960 704Z" fill="#1a1a1c" opacity="0.45" filter="url(#hs-soft)" />
      </g>
      <use href="#hs-man" transform={`translate(960 ${694 + yOff}) scale(${0.92 * k})`} />
    </svg>
  );
}

/* ---------- project artwork (SVG, no image files) ---------- */

function ProjectArt({ kind }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]">
      <svg viewBox="0 0 527 540" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <linearGradient id="pa-face" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0a0b10" /><stop offset="1" stopColor="#262a36" /></linearGradient>
          <linearGradient id="pa-blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a46f0" /><stop offset="1" stopColor="#0a2a9a" /></linearGradient>
          <linearGradient id="pa-concrete" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c4c4c1" /><stop offset="1" stopColor="#8a8a87" /></linearGradient>
        </defs>
        {kind === "face" && (
          <>
            <rect width="527" height="540" fill="#04060c" />
            <rect x="395" y="0" width="75" height="540" fill="url(#pa-blue)" />
            <rect x="470" y="0" width="57" height="540" fill="#0a0c14" />
            <path d="M0 0H300C340 40 372 90 364 132L400 160C392 172 384 176 380 182 388 192 388 204 378 212 388 224 382 244 370 254 376 270 366 290 340 300L290 338 200 540H0Z" fill="url(#pa-face)" />
            <path d="M300 0C340 40 372 90 364 132L400 160C392 172 384 176 380 182 388 192 388 204 378 212 388 224 382 244 370 254" fill="none" stroke="#6b86ff" strokeWidth="2.5" opacity="0.85" />
          </>
        )}
        {kind === "beam" && (
          <>
            <rect width="527" height="540" fill="url(#pa-concrete)" />
            <polygon points="170,0 400,0 310,540 210,540" fill="#e9e8e3" />
            <polygon points="400,0 527,0 527,540 310,540" fill="#4a4a4c" opacity="0.55" />
            <polygon points="215,0 330,0 527,190 527,300" fill="#1237c8" />
            <polygon points="215,0 235,0 527,300 527,320" fill="#5a78ff" opacity="0.6" />
          </>
        )}
        {kind === "room" && (
          <>
            <rect width="527" height="540" fill="#04060f" />
            <rect x="170" y="0" width="330" height="540" fill="url(#pa-blue)" />
            <rect x="170" y="0" width="14" height="540" fill="#0a0c18" opacity="0.7" />
            <rect x="470" y="0" width="57" height="540" fill="#04060f" />
            <circle cx="372" cy="350" r="30" fill="#05060a" />
            <path d="M322 540C322 440 340 392 372 386s50 54 50 154Z" fill="#05060a" />
          </>
        )}
      </svg>
    </div>
  );
}

/* swipe track on phones, grid from md up */
const track = "flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/* ====================================================================
   PAGE
   ==================================================================== */

export default function Home() {
  const pageRef = useRef(null);
  const workRef = useRef(null);
  const [reduced, setReduced] = useState(false);
  const [slide, setSlide] = useState({ i: 0, p: 0 });
  const box = useSceneBox();

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // section reveals
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const items = root.querySelectorAll("[data-reveal]");
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("rcs-in"));
      return;
    }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("rcs-in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduced]);

  // selected work: swipe progress (phones) + jump to a slide
  const onWorkScroll = () => {
    const el = workRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const p = max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0;
    setSlide({ i: Math.round(p * (PROJECTS.length - 1)), p });
  };
  const goTo = (i) => {
    const el = workRef.current;
    if (!el || !el.children[1]) return;
    const step = el.children[1].offsetLeft - el.children[0].offsetLeft;
    el.scrollTo({ left: i * step, behavior: reduced ? "auto" : "smooth" });
  };

  // smooth scroll for the hero cue (respects reduced motion)
  const toWork = (e) => {
    const target = document.getElementById("work");
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <main ref={pageRef} className="rcs-home relative overflow-clip bg-[#F5F2EA] text-[#111111]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .rcs-home { font-family: 'Manrope', 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; }
        .rcs-home ::selection { background: ${COBALT}; color: #fff; }
        .rcs-disp { font-family: 'Bebas Neue', 'Anton', 'Arial Narrow', Impact, sans-serif; font-weight: 400; letter-spacing: -0.005em; line-height: .92; text-transform: uppercase; }
        .rcs-disp em { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-weight: 700; letter-spacing: -0.055em; text-transform: uppercase; }
        .rcs-head { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; letter-spacing: -0.035em; line-height: 1; }
        .rcs-head em { font-weight: 400; font-style: italic; }
        .rcs-mono { font-family: 'IBM Plex Mono', 'Courier New', monospace; text-transform: uppercase; letter-spacing: var(--ls, .2em); }
        /* project titles: serif caps under the image on phones, Bebas over the image from md up */
        .rcs-ptitle { font-family: 'Playfair Display', Georgia, serif; font-weight: 500; letter-spacing: .01em; text-transform: uppercase; }
        @media (min-width: 768px) { .rcs-ptitle { font-family: 'Bebas Neue', 'Anton', 'Arial Narrow', Impact, sans-serif; font-weight: 400; letter-spacing: -0.005em; } }
        .rcs-grain { position: absolute; inset: 0; pointer-events: none; opacity: .08; mix-blend-mode: multiply; background-image: ${NOISE}; }
        [data-reveal] { opacity: 0; transform: translateY(22px); transition: opacity .9s ease var(--d, 0ms), transform .9s cubic-bezier(.2,.65,.25,1) var(--d, 0ms); }
        [data-reveal].rcs-in { opacity: 1; transform: none; }
        .rcs-grow { transform: scale(.35); transition: transform 1.2s cubic-bezier(.2,.65,.25,1) var(--d, 0ms); }
        .rcs-in .rcs-grow { transform: scale(1); }

        /* ---------- HERO: always the whole first screen ----------
           --u = 1vw up to a 750px screen, then fixed at 7.5px.
           The phone composition is 141u tall; on taller screens the
           extra height (--ex) is shared out so nothing looks stranded. */
        .rcs-hero { --u: min(1vw, 7.5px); --H: max(100vh, calc(141 * var(--u))); height: var(--H); --ex: calc(var(--H) - 141 * var(--u)); }
        @supports (height: 100svh) { .rcs-hero { --H: max(100svh, calc(141 * var(--u))); } }
        @media (min-width: 1024px) {
          .rcs-hero { height: auto; aspect-ratio: 1586 / 762; min-height: min(100vh, 56vw); }
          @supports (height: 100svh) { .rcs-hero { min-height: min(100svh, 56vw); } }
        }
        @media (max-width: 1023.98px) {
          .hm-eyebrow { --ls: .13em; left: calc(4.9 * var(--u)); top: calc(26.8 * var(--u) + 0.32 * var(--ex)); }
          .hm-h1 { left: calc(4.9 * var(--u)); top: calc(31 * var(--u) + 0.32 * var(--ex)); }
          .hm-l { font-size: calc(10 * var(--u)); line-height: calc(9.5 * var(--u)); }
          .hm-l3 { margin-top: calc(4 * var(--u)); }
          .hm-m { font-size: calc(10.4 * var(--u)); line-height: calc(10.5 * var(--u)); margin-left: calc(-0.5 * var(--u)); }
          .hm-tag { left: calc(4.9 * var(--u)); top: calc(77.5 * var(--u) + 0.32 * var(--ex)); gap: calc(3.1 * var(--u)); }
          .hm-rule { width: calc(6.8 * var(--u)); }
          .hm-tagp { font-size: max(14px, calc(3.6 * var(--u))); max-width: calc(48 * var(--u)); }
          .hm-cue { left: calc(4.9 * var(--u)); bottom: calc(12 * var(--u) + env(safe-area-inset-bottom, 0px)); }
          .hm-list { --ls: .03em; left: 79.5vw; bottom: calc(42 * var(--u) + env(safe-area-inset-bottom, 0px)); padding-left: 1.4vw; font-size: clamp(8px, 2.5vw, 10px); }
          .hm-li { height: calc(4.4 * var(--u)); grid-template-columns: 4.8vw 1fr; }
        }

        @keyframes rcs-drift { from { transform: translateX(0); } to { transform: translateX(-22px); } }
        .rcs-drift { animation: rcs-drift 16s ease-in-out infinite alternate; }
        @keyframes rcs-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        .rcs-hero-text > * { animation: rcs-rise .9s cubic-bezier(.2,.65,.25,1) both; }
        .rcs-hero-text > *:nth-child(2) { animation-delay: .08s; }
        .rcs-hero-text > *:nth-child(3) { animation-delay: .2s; }
        .rcs-hero-text > *:nth-child(4) { animation-delay: .3s; }
        .rcs-hero-text > *:nth-child(5) { animation-delay: .4s; }
        @keyframes rcs-nudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(6px); } }
        .rcs-nudge { animation: rcs-nudge 1.8s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          [data-reveal], .rcs-grow { opacity: 1; transform: none; transition: none; }
          .rcs-drift, .rcs-hero-text > *, .rcs-nudge { animation: none; }
        }
      `}</style>
      <span aria-hidden="true" className="rcs-grain" />

      {/* ============ HERO ============ */}
      <section className="rcs-hero relative isolate overflow-hidden bg-[#efebe3]">
        {/* scene fills the whole hero at every size */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <HeroScene box={box} />
        </div>

        {/* copy: sits on the left wall */}
        <div className="rcs-hero-text">
          <p className={`rcs-mono hm-eyebrow absolute ${monoS} text-black/75 lg:left-[6.6vw] lg:top-[9.4vw] lg:tracking-[0.3em]`}>Strategy / Story / Culture</p>

          <h1 className="rcs-disp hm-h1 absolute text-black lg:left-[6.6vw] lg:top-[11vw]">
            <span className="hm-l block lg:text-[5.8vw] lg:leading-[5.4vw]">We don’t send</span>
            <span className="hm-l block lg:text-[5.8vw] lg:leading-[5.4vw]">press releases.</span>
            <span className="hm-l hm-l3 block lg:mt-[0.4vw] lg:text-[5.8vw] lg:leading-[5.6vw]">We create</span>
            <em className="hm-m block lg:-ml-[0.3vw] lg:text-[6.9vw] lg:leading-[6.5vw]" style={{ color: COBALT }}>Moments.</em>
          </h1>

          <div className="hm-tag absolute flex items-center lg:left-[5.7vw] lg:top-[35.9vw] lg:gap-[1vw]">
            <span aria-hidden="true" className="hm-rule h-px shrink-0 bg-black/60 lg:w-[4vw]" />
            <p className="hm-tagp leading-[1.45] lg:text-[max(14px,1.1vw)] lg:leading-[1.45vw]">
              Rare Creative Studios —<br />Turning brands into conversations.
            </p>
          </div>
        </div>

        {/* scroll cue: circle + two-line label */}
        <a
          href="#work"
          onClick={toWork}
          className={`hm-cue group absolute z-20 flex flex-col items-start gap-3 lg:left-[5.9vw] lg:bottom-[4.3vw] lg:flex-row lg:items-center lg:gap-[1.1vw] ${focus}`}
        >
          <span className="relative grid h-11 w-11 place-items-center rounded-full border border-black/70 transition-colors group-hover:border-[#0b3fd9] lg:h-[3.5vw] lg:min-h-[44px] lg:w-[3.5vw] lg:min-w-[44px]">
            <span aria-hidden="true" className="absolute left-1/2 top-[3px] h-[5px] w-px -translate-x-1/2 bg-black/60 lg:hidden" />
            <span aria-hidden="true" className="h-[3px] w-[3px] rounded-full bg-black transition-colors group-hover:bg-[#0b3fd9]" />
            <ArrowDown aria-hidden="true" size={14} strokeWidth={1.4} className="absolute opacity-0 transition-opacity group-hover:opacity-100" />
          </span>
          <span className={`rcs-mono ${monoS} leading-[1.7] lg:text-[max(10px,0.7vw)]`}>Scroll<br /> to explore</span>
        </a>

        {/* the numbered list set against the right wall (all sizes) */}
        <ul
          aria-hidden="true"
          className="rcs-mono hm-list absolute z-10 border-l border-black/70 py-[0.2vw] lg:left-auto lg:right-[4vw] lg:top-[18.7vw] lg:pl-[1.2vw] lg:text-[max(10px,0.7vw)]"
        >
          {LIST.map((w, i) => (
            <li key={w} className="hm-li grid items-center lg:h-[2.1vw] lg:grid-cols-[2.6vw_1fr]">
              <span className="text-black/65">{String(i + 1).padStart(2, "0")}</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ============ SELECTED WORK ============ */}
      <section id="work" className="relative scroll-mt-4 bg-[#f6f3ee] pb-14 pt-9 sm:pb-16 sm:pt-14 lg:pb-[5vw] lg:pt-[1.9vw]">
        <div data-reveal className={`relative flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between ${padX}`}>
          <div>
            <p className={`rcs-mono ${monoS} text-black/75 lg:tracking-[0.3em]`}>Selected work / 2024 – 26</p>
            <h2 className="rcs-head mt-3 text-[clamp(2rem,9.4vw,4.6rem)] lg:mt-[0.5vw] lg:text-[4.6vw]">
              Make them feel <em>something.</em>
            </h2>
          </div>
          <Link to="/work" className={`group absolute -top-3.5 right-5 flex min-h-11 items-center gap-2 sm:static sm:gap-4 lg:gap-[1.2vw] ${focus}`}>
            <span aria-hidden="true" className="hidden h-px w-14 bg-black/60 transition-all duration-500 group-hover:w-20 sm:block lg:w-[5.8vw] lg:group-hover:w-[7vw]" />
            <span className={`rcs-mono ${monoS}`}>
              <span className="sm:hidden">View all</span>
              <span className="hidden sm:inline">View all work</span>
            </span>
            <ArrowUpRight size={15} strokeWidth={1.4} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div
          ref={workRef}
          onScroll={onWorkScroll}
          role="region"
          aria-roledescription="carousel"
          aria-label="Selected work"
          tabIndex={0}
          className={`mt-6 px-5 sm:mt-8 sm:px-8 md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:px-3 lg:mt-[1.6vw] lg:gap-[1.1vw] lg:px-[0.4vw] ${track} ${focus}`}
        >
          {PROJECTS.map((p, i) => (
            <article
              key={p.n}
              data-reveal
              style={{ "--d": `${i * 120}ms` }}
              className="group relative w-full shrink-0 snap-start md:aspect-[3/4] md:w-auto md:shrink md:overflow-hidden md:bg-black md:text-white lg:aspect-auto lg:h-[34vw]"
            >
              {/* whole card is one link */}
              <Link to="/work" aria-label={`${p.n} ${p.title}, ${p.cat}`} className={`absolute inset-0 z-10 ${focus}`} />

              {/* image: wide card on phones, fills the tile from md up */}
              <div className="relative aspect-[666/297] overflow-hidden bg-black text-white md:absolute md:inset-0 md:aspect-auto">
                <ProjectArt kind={p.art} />
                <div aria-hidden="true" className="absolute inset-0 hidden bg-gradient-to-t from-black/75 via-transparent to-black/10 md:block" />
                <p className={`rcs-mono absolute left-4 top-4 ${monoS} md:left-5 md:top-5 lg:left-[1.6vw] lg:top-[1.6vw]`}>{p.n}</p>
                <span aria-hidden="true" className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full border border-white/70 transition-colors duration-300 group-hover:bg-white group-hover:text-black md:hidden">
                  <ArrowRight size={16} strokeWidth={1.4} />
                </span>
              </div>

              {/* title: below the image on phones, over it from md up */}
              <div className="pt-4 md:absolute md:inset-x-5 md:bottom-5 md:flex md:items-end md:justify-between md:gap-4 md:p-0 lg:inset-x-[1.6vw] lg:bottom-[1.6vw]">
                <div className="md:transition-transform md:duration-500 md:group-hover:-translate-y-1.5">
                  <h3 className="rcs-ptitle text-[clamp(1.05rem,4.9vw,1.5rem)] leading-[1.1] md:text-[clamp(1.9rem,8vw,2.6rem)] md:leading-[0.93] lg:text-[2.6vw]">{p.title}</h3>
                  <p className={`rcs-mono mt-3 leading-[1.6] text-black/70 md:text-white/80 ${monoXS}`}>{p.cat}</p>
                </div>
                <span aria-hidden="true" className="hidden h-11 w-11 shrink-0 place-items-center rounded-full border border-white/60 transition-transform duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-black md:grid lg:h-[2.6vw] lg:min-h-[40px] lg:w-[2.6vw] lg:min-w-[40px]">
                  <ArrowUpRight size={15} strokeWidth={1.4} />
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* phones: slide counter + progress bar + the remaining numbers */}
        <div className={`mt-5 flex items-center gap-4 md:hidden ${padX}`}>
          <span aria-live="polite" className={`rcs-mono ${monoS} text-black`}>{PROJECTS[slide.i].n}</span>
          <div aria-hidden="true" className="relative h-[2px] flex-1 bg-black/15">
            <span
              className="absolute inset-y-0 left-0 bg-black transition-[width] duration-200 ease-out"
              style={{ width: `${((1 + slide.p * (PROJECTS.length - 1)) / PROJECTS.length) * 100}%` }}
            />
          </div>
          {PROJECTS.map((p, idx) =>
            idx > slide.i ? (
              <button
                key={p.n}
                type="button"
                onClick={() => goTo(idx)}
                aria-label={`Show project ${p.n}: ${p.title}`}
                className={`rcs-mono ${monoS} min-h-11 min-w-8 text-black/45 transition-colors hover:text-black ${focus}`}
              >
                {p.n}
              </button>
            ) : null
          )}
        </div>

        <div className={`mt-2 md:mt-3 ${padX}`}>
          <p className={`rcs-mono text-black/55 ${monoXS}`}>Illustrative concepts, not client case studies.</p>
        </div>
      </section>

      {/* ============ PHILOSOPHY ============ */}
      <section className={`relative border-t border-black/15 py-16 sm:py-20 lg:py-[9vw] ${padX}`}>
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-[3vw]">
          <p data-reveal className={`rcs-mono text-black/70 lg:col-span-2 ${monoS}`}>01 / Perspective</p>
          <h2 data-reveal className="rcs-disp text-[clamp(3.1rem,15vw,7.2rem)] lg:col-span-7 lg:text-[7.4vw] lg:leading-[6.8vw]">
            Anyone can<br />publish news.
            <em className="mt-1 block sm:ml-[8vw] lg:ml-[7vw] lg:mt-[1vw]" style={{ color: COBALT }}>Not everyone<br />can make it matter.</em>
          </h2>
          <div data-reveal style={{ "--d": "150ms" }} className="flex items-center gap-5 sm:gap-8 lg:col-span-3 lg:block lg:self-end">
            <span aria-hidden="true" className="block h-20 w-20 shrink-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,#ffffff_0%,#c6cbd3_30%,#4b515c_75%,#1b1e24_100%)] shadow-[0_24px_40px_-18px_rgba(0,0,0,0.55)] sm:h-28 sm:w-28 lg:mb-6 lg:h-[8vw] lg:w-[8vw]" />
            <p className={`max-w-[30ch] ${bodyL}`}>PR is no longer just about visibility. It’s about relevance.</p>
          </div>
        </div>
      </section>

      {/* ============ STRATEGY / SERVICES ============ */}
      <section className={`relative border-t border-black/15 py-16 sm:py-20 lg:py-[7vw] ${padX}`}>
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-12 lg:items-end lg:gap-[3vw]">
          <h2 data-reveal className="rcs-disp text-[clamp(3.2rem,16vw,7.6rem)] lg:col-span-7 lg:text-[8vw] lg:leading-[7.2vw]">
            Strategy.<br />Narrative.<br /><em style={{ color: COBALT }}>Impact.</em>
          </h2>
          <p data-reveal style={{ "--d": "120ms" }} className={`max-w-[44ch] lg:col-span-5 ${bodyL}`}>
            We help ambitious brands shape culture, earn attention, and build lasting influence through strategic PR and creative storytelling.
          </p>
        </div>

        <ul className="mt-10 border-t border-black/25 sm:mt-12 md:grid md:grid-cols-2 md:gap-x-10 lg:mt-[4vw] lg:grid-cols-5 lg:gap-x-[1.6vw] lg:border-t-0">
          {SERVICES.map((s, i) => (
            <li key={s.n} data-reveal style={{ "--d": `${i * 80}ms` }} className="border-b border-black/25 lg:border-b-0 lg:border-t">
              <Link to="/services" className={`group grid grid-cols-[2.4rem_1fr_auto] items-start gap-x-3 py-5 sm:py-6 lg:block lg:pt-[1.6vw] ${focus}`}>
                {/* desktop card header: number + icon */}
                <div className="hidden items-center justify-between lg:flex">
                  <span className="rcs-mono text-[max(10px,0.7vw)]">{s.n}</span>
                  <s.icon aria-hidden="true" strokeWidth={1.2} className="h-[2.4vw] min-h-7 w-[2.4vw] min-w-7 transition-colors group-hover:text-[#0b3fd9]" />
                </div>
                {/* phone/tablet row: number | copy | icon */}
                <span className="rcs-mono pt-1 text-[10px] text-black/60 lg:hidden">{s.n}</span>
                <div>
                  <h3 className="text-[18px] font-semibold transition-colors group-hover:text-[#0b3fd9] sm:text-[19px] lg:mt-[1.6vw] lg:text-[max(16px,1.2vw)]">{s.title}</h3>
                  <p className="mt-1.5 max-w-[34ch] text-[14px] leading-relaxed text-black/70 lg:mt-2 lg:max-w-[28ch] lg:text-[max(13px,0.95vw)]">{s.text}</p>
                  <span aria-hidden="true" className="mt-4 hidden h-px w-8 bg-[#0b3fd9] transition-all duration-500 group-hover:w-16 lg:block" />
                </div>
                <s.icon aria-hidden="true" strokeWidth={1.2} className="h-6 w-6 text-black/70 transition-colors group-hover:text-[#0b3fd9] lg:hidden" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ============ PROCESS ============ */}
      <section aria-labelledby="process" className={`relative bg-[#071C50] py-16 text-[#F5F2EA] sm:py-20 lg:py-[8vw] ${padX}`}>
        <h2 id="process" data-reveal className="rcs-disp max-w-[14ch] text-[clamp(2.9rem,14vw,6.4rem)] md:max-w-none lg:text-[6.2vw] lg:leading-[5.8vw]">
          From a point of view<br />to a <em className="text-[#6f92ff]">point of culture.</em>
        </h2>
        <ol className="mt-10 grid gap-8 sm:mt-14 md:grid-cols-3 md:gap-6 lg:mt-[5vw] lg:gap-[3vw]">
          {PROCESS.map((p, i) => (
            <li key={p.n} data-reveal style={{ "--d": `${i * 160}ms` }} className="grid grid-cols-[6.5rem_1fr] items-center gap-5 border-t border-white/20 pt-6 md:block md:border-t-0 md:pt-0">
              <div className="relative h-24 border-b border-white/25 md:mb-6 md:h-40 lg:mb-[2vw] lg:h-[14vw]">
                <span aria-hidden="true" className="rcs-grow absolute bottom-0 left-0 bg-gradient-to-br from-[#245DFF] to-[#0b3fd9]" style={{ width: p.size, height: p.size, "--d": `${i * 160 + 200}ms`, transformOrigin: "bottom left" }} />
              </div>
              <div>
                <p className={`rcs-mono text-white/70 ${monoS}`}>{p.n}</p>
                <h3 className="rcs-disp mt-1 text-[clamp(2.6rem,11vw,3.4rem)] lg:mt-2 lg:text-[3.6vw]">{p.t}</h3>
                <p className="mt-2 max-w-[28ch] text-[14px] leading-relaxed text-white/75 lg:text-[max(14px,1vw)]">{p.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ============ JOURNAL ============ */}
      <section className="relative py-16 sm:py-20 lg:py-[7vw]">
        <h2 data-reveal className={`rcs-head text-[clamp(2.3rem,10.6vw,4.6rem)] lg:text-[4.6vw] ${padX}`}>
          Ideas that travel <em style={{ color: COBALT }}>further.</em>
        </h2>
        <div className={`mt-8 px-5 sm:px-8 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible lg:mt-[4vw] lg:gap-[2vw] lg:px-[6.4vw] ${track}`}>
          {ARTICLES.map((a, i) => (
            <article key={a.title} data-reveal style={{ "--d": `${i * 120}ms` }} className="group w-[76vw] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink">
              <div aria-hidden="true" className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${a.bg}`}>
                <span className="absolute -bottom-[18%] -right-[10%] h-[70%] w-[55%] rounded-full bg-[radial-gradient(circle_at_32%_28%,#fff_0%,#c6cbd3_35%,#3b414c_100%)] opacity-90 transition-transform duration-700 group-hover:-translate-y-3" />
              </div>
              <p className={`rcs-mono mt-4 lg:mt-5 ${monoS}`} style={{ color: COBALT }}>{a.cat}</p>
              <h3 className="rcs-head mt-2 text-[1.45rem] leading-[1.08] sm:text-[1.6rem] lg:text-[max(1.4rem,1.9vw)]">{a.title}</h3>
              <p className={`rcs-mono mt-3 text-black/55 ${monoXS}`}>Essay in progress</p>
            </article>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className={`relative isolate overflow-hidden bg-[#0b3fd9] pb-[max(4.5rem,env(safe-area-inset-bottom))] pt-20 text-[#F5F2EA] sm:pb-24 sm:pt-24 lg:py-[9vw] ${padX}`}>
        <svg aria-hidden="true" viewBox="0 0 400 200" className="absolute -right-[20%] top-0 -z-10 h-[60%] w-[110%] opacity-40 sm:-right-[10%] sm:h-[80%] sm:w-[70%]">
          <path d="M10 150C80 20 160 20 200 90s120 90 190-70" stroke="#245DFF" strokeWidth="40" fill="none" strokeLinecap="round" />
          <path d="M10 150C80 20 160 20 200 90s120 90 190-70" stroke="#F5F2EA" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        </svg>
        <h2 data-reveal className="rcs-disp text-[clamp(3.1rem,15.4vw,7.6rem)] lg:text-[8.6vw] lg:leading-[7.8vw]">Your brand deserves<br />more than <em>mentions.</em></h2>
        <p data-reveal style={{ "--d": "120ms" }} className="mt-5 text-[17px] sm:mt-6 sm:text-[19px] lg:mt-[2vw] lg:text-[max(17px,1.4vw)]">Let’s create something people remember.</p>
        <div data-reveal style={{ "--d": "200ms" }} className="mt-8 flex flex-col items-stretch gap-5 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-10 lg:mt-[3vw]">
          <Link to="/contact" className="group inline-flex min-h-14 items-center justify-between gap-4 bg-[#F5F2EA] px-7 text-[12px] font-bold uppercase tracking-[0.16em] text-[#071C50] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:justify-start">
            Start a conversation
            <ArrowUpRight size={16} strokeWidth={2} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className={`rcs-mono break-all underline underline-offset-4 ${monoS}`}>{CONTACT_EMAIL}</a>
        </div>
      </section>
    </main>
  );
}