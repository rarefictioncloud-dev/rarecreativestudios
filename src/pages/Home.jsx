import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";

/* ------------------------------------------------------------------
   NO IMAGE FILES NEEDED. Every collage (portrait, chess king, building,
   globe) is drawn in SVG/CSS inside this file.
   Navbar and Footer are NOT part of this file.

   Desktop sizing is in vw, derived from the 1024px-wide reference,
   so the layout scales exactly like the picture. Phones stack.
------------------------------------------------------------------- */

const BLUE = "#0a3fdc";
const MONO_SVG = "'IBM Plex Mono','Courier New',monospace";

const TICKER = ["Brand Strategy", "Media Relations", "Thought Leadership", "Creative Campaigns", "Digital Amplification"];

const STATS = [
  { value: "250+", label: "Brand stories\ncreated" },
  { value: "100+", label: "Media placements\nworldwide" },
  { value: "40+", label: "Industry leaders\npositioned" },
  { value: "∞", label: "Ideas still\nin progress" },
];

const SERVICES = [
  { n: "01", title: "Brand Positioning", text: "Define what you stand for — and why it matters." },
  { n: "02", title: "Media Strategy", text: "Earn attention in the right places." },
  { n: "03", title: "Story Development", text: "Turn expertise into compelling narratives." },
  { n: "04", title: "Campaign Execution", text: "Ideas that cut through and stay with people." },
  { n: "05", title: "Digital Amplification", text: "Extend reach. Deepen impact." },
];

const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0a3fdc]";
const disp = "rcs-d";
const mono = "rcs-m";
const body = "rcs-b";

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* ---------- shared SVG filters: torn paper edges + soft shadow ---------- */

function ArtDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" className="absolute">
      <defs>
        <filter id="rcs-torn" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.055" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" />
        </filter>
        <filter id="rcs-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
    </svg>
  );
}

const Note = ({ x, y, w, h, rot, lines, size = 11 }) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
    <rect x={x + 3} y={y + 4} width={w} height={h} fill="#000" opacity="0.18" filter="url(#rcs-blur)" />
    <rect x={x} y={y} width={w} height={h} fill="#dddcd8" />
    <rect x={x} y={y} width={w} height={h} fill="none" stroke="#bdbcb8" strokeWidth="0.8" />
    <text x={x + 12} y={y + 22} fontFamily={MONO_SVG} fontSize={size} letterSpacing="1.4" fill="#2a2a2a">
      {lines.map((l, i) => (
        <tspan key={l} x={x + 12} dy={i === 0 ? 0 : size + 6}>{l}</tspan>
      ))}
    </text>
  </g>
);

/* ---------- Hero collage: portrait, torn blue paper, tower, note ---------- */

function PortraitArt({ className = "" }) {
  return (
    <svg viewBox="0 0 484 437" className={className} aria-hidden="true" role="presentation">
      <defs>
        <linearGradient id="rcs-skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2f1ee" />
          <stop offset="0.55" stopColor="#bcbbb7" />
          <stop offset="1" stopColor="#6a6967" />
        </linearGradient>
        <linearGradient id="rcs-jacket" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#050505" />
          <stop offset="0.5" stopColor="#2b2b2b" />
          <stop offset="1" stopColor="#060606" />
        </linearGradient>
        <linearGradient id="rcs-tower" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8d7d3" />
          <stop offset="1" stopColor="#5d5c5a" />
        </linearGradient>
        <pattern id="rcs-win" width="10" height="13" patternUnits="userSpaceOnUse">
          <rect width="10" height="13" fill="url(#rcs-tower)" />
          <rect x="2" y="3" width="4.5" height="7" fill="#2a2a29" />
        </pattern>
      </defs>

      <g filter="url(#rcs-torn)">
        <polygon points="262,14 372,2 384,118 292,160" fill="#b9b8b4" />
        <polygon points="26,48 128,38 140,140 122,205 92,232 58,170" fill={BLUE} />
        <rect x="352" y="132" width="104" height="214" fill="url(#rcs-win)" />
        <rect x="352" y="132" width="104" height="214" fill="#000" opacity="0.12" />
      </g>
      {/* scribbled map fragment on the grey paper */}
      <path d="M300 42c10-6 14 6 24 0s12 8 24 2M308 62c8 4 12-4 22 2s14-6 24 0" stroke="#4a4a48" strokeWidth="1" fill="none" />

      {/* figure */}
      <path d="M118 150C112 70 170 20 240 30c80 10 112 80 90 160-12 45-30 60-44 72l-24-62-92 15c-20-15-45-25-52-65z" fill="#101010" />
      <path d="M52 437c8-77 58-147 123-175l125-10c70 18 120 78 136 185z" fill="url(#rcs-jacket)" />
      <path d="M178 215l60-10 24 57-62 28z" fill="url(#rcs-skin)" />
      <ellipse cx="215" cy="135" rx="52" ry="68" transform="rotate(-12 215 135)" fill="url(#rcs-skin)" />
      <path d="M160 108C170 55 230 45 268 88c-28-16-68-12-108 20z" fill="#101010" />
      <path d="M185 126q10-6 20 0M229 119q10-6 20 0" stroke="#1d1d1d" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M222 136q-5 18 4 23" stroke="#5a5a58" strokeWidth="1.6" fill="none" />
      <path d="M205 173q15-9 31-2-15 13-31 2z" fill="#4a4a48" />
      <path d="M118 160c-18 20-22 50-10 78M330 120c14 24 12 60-6 92" stroke="#101010" strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="160" cy="168" r="16" fill="none" stroke="#111" strokeWidth="2.2" />
      <circle cx="276" cy="146" r="13" fill="none" stroke="#111" strokeWidth="2.2" />
      <path d="M150 300c40-30 100-38 150-18" stroke="#3a3a3a" strokeWidth="2" fill="none" />

      {/* thin orbit line + sticky note + tape */}
      <path d="M8 392C70 300 230 250 392 268" stroke="#262626" strokeWidth="1.2" fill="none" />
      <Note x={24} y={236} w={104} h={80} rot={-6} lines={["IDEAS", "INTO", "INFLUENCE"]} />
      <polygon points="262,392 318,370 346,398 292,430" fill="#a7a6a3" opacity="0.9" />
      <text x="378" y="388" fontFamily={MONO_SVG} fontSize="10" letterSpacing="1.5" fill="#1b1b1b">
        <tspan x="378">STRATEGY</tspan>
        <tspan x="396" dy="14">STORY</tspan>
        <tspan x="390" dy="14">CULTURE</tspan>
      </text>
    </svg>
  );
}

/* ---------- Chess king on torn paper with handwritten notes ---------- */

function ChessArt({ className = "" }) {
  return (
    <svg viewBox="0 0 420 365" className={className} aria-hidden="true" role="presentation">
      <defs>
        <linearGradient id="rcs-king" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#050505" />
          <stop offset="0.3" stopColor="#4a4a4a" />
          <stop offset="0.42" stopColor="#101010" />
          <stop offset="1" stopColor="#020202" />
        </linearGradient>
      </defs>
      <g filter="url(#rcs-torn)">
        <polygon points="22,22 150,8 162,205 40,220" fill="#bcbbb7" />
        <polygon points="326,56 412,72 406,205 298,192" fill="#b3b2ae" />
        <polygon points="300,232 420,214 406,352 290,346" fill="#c9c8c4" />
        <polygon points="262,118 362,150 330,212" fill="#8c8b88" />
      </g>
      <polygon points="215,292 320,238 376,262 306,322 236,326" fill="#222" opacity="0.55" filter="url(#rcs-blur)" />

      {/* king */}
      <g>
        <rect x="200" y="14" width="20" height="52" rx="3" fill="url(#rcs-king)" />
        <rect x="186" y="26" width="48" height="18" rx="3" fill="url(#rcs-king)" />
        <path d="M176 118c-2-30 12-50 34-50s36 20 34 50z" fill="url(#rcs-king)" />
        <rect x="160" y="116" width="100" height="16" rx="8" fill="url(#rcs-king)" />
        <path d="M184 132c-6 52-34 100-46 154h144c-12-54-40-102-46-154z" fill="url(#rcs-king)" />
        <rect x="124" y="284" width="172" height="20" rx="10" fill="url(#rcs-king)" />
        <rect x="114" y="302" width="192" height="24" rx="12" fill="url(#rcs-king)" />
        <path d="M200 150c-4 40-20 84-32 128" stroke="#7a7a7a" strokeWidth="2" opacity="0.6" fill="none" />
      </g>

      {/* blue scribbles + handwriting */}
      <ellipse cx="205" cy="112" rx="128" ry="50" transform="rotate(-18 205 112)" fill="none" stroke={BLUE} strokeWidth="2" />
      <ellipse cx="225" cy="100" rx="110" ry="40" transform="rotate(-24 225 100)" fill="none" stroke={BLUE} strokeWidth="1.4" opacity="0.8" />
      <text transform="rotate(-14 24 250)" x="22" y="250" fontFamily="Caveat, 'Comic Sans MS', cursive" fontSize="22" letterSpacing="1" fill={BLUE}>
        <tspan x="22">STRATEGY</tspan>
        <tspan x="22" dy="23">LED</tspan>
        <tspan x="22" dy="23">STORYTELLING</tspan>
        <tspan x="22" dy="23">THAT</tspan>
        <tspan x="22" dy="23">TRAVELS.</tspan>
      </text>
      <path d="M52 340c40-14 78-20 108-24M62 350c30-8 70-12 98-16" stroke={BLUE} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Building: low-angle cladding in a torn opening ---------- */

function BuildingArt({ className = "" }) {
  return (
    <svg viewBox="0 0 400 280" className={className} aria-hidden="true" role="presentation">
      <defs>
        <linearGradient id="rcs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f8e8b" />
          <stop offset="1" stopColor="#b9b8b4" />
        </linearGradient>
        <pattern id="rcs-panel" width="30" height="26" patternUnits="userSpaceOnUse" patternTransform="skewY(16)">
          <rect width="30" height="26" fill="#d2d1ce" />
          <path d="M30 0V26M0 26H30" stroke="#8b8a87" strokeWidth="1.4" />
        </pattern>
      </defs>
      <g filter="url(#rcs-torn)">
        <polygon points="10,44 400,0 400,280 0,280" fill="#cfceca" />
        <polygon points="14,150 118,64 252,34 332,62 386,150 396,280 26,280" fill="url(#rcs-sky)" />
      </g>
      <path d="M118 66C160 18 244 20 300 54c-44-14-98 6-150 50z" fill="#0d0d0d" />
      <polygon points="150,100 304,50 396,150 396,280 196,280" fill="url(#rcs-panel)" />
      <polygon points="150,100 304,50 316,64 168,116" fill="#f0efec" opacity="0.7" />
      <polygon points="14,150 150,178 196,280 26,280" fill="#171717" />
      <polygon points="40,215 120,198 138,250 52,262" fill="#3b3b3b" />
      <path d="M262 150c20-24 40-30 62-14s14 52 44 40M248 176c24-30 50-40 74-22s20 60 52 50" stroke={BLUE} strokeWidth="2" fill="none" />
      <Note x={14} y={24} w={112} h={124} rot={-3} lines={["A", "DIFFERENT", "POINT", "OF VIEW"]} size={12} />
    </svg>
  );
}

/* ---------- Globe on torn paper with blue tear ---------- */

function GlobeArt({ className = "" }) {
  return (
    <svg viewBox="0 0 229 240" className={className} aria-hidden="true" role="presentation">
      <defs>
        <radialGradient id="rcs-globe" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#7d7d7b" />
          <stop offset="0.45" stopColor="#262626" />
          <stop offset="1" stopColor="#050505" />
        </radialGradient>
      </defs>
      <g filter="url(#rcs-torn)">
        <polygon points="4,40 70,18 90,140 10,150" fill="#bdbcb8" />
      </g>
      <circle cx="104" cy="118" r="88" fill="url(#rcs-globe)" />
      <g fill="#a2a2a0" opacity="0.5">
        <path d="M54 80c14-14 34-14 42 0 4 14-12 20-8 34s-22 12-28 0-18-20-6-34zM116 62c14-8 36-4 40 12s-14 16-8 30-24 10-30-4 0-30-2-38zM112 138c18-4 34 6 28 22s-26 18-30 4 2-22 2-26zM74 148c8 2 12 12 6 22s-14 4-14-8 2-12 8-14z" />
      </g>
      <circle cx="104" cy="118" r="88" fill="none" stroke="#3a3a3a" strokeWidth="1.5" />
      <g filter="url(#rcs-torn)">
        <polygon points="14,212 229,176 229,240 4,240" fill={BLUE} />
      </g>
      <Note x={128} y={12} w={92} h={72} rot={6} lines={["GLOBAL", "PERSPECTIVE.", "CULTURAL", "IMPACT."]} size={9} />
    </svg>
  );
}

function Label({ children, className = "" }) {
  return <p className={`${mono} text-[10px] uppercase tracking-[0.14em] text-black/80 md:text-[0.9vw] ${className}`}>{children}</p>;
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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main ref={pageRef} className="rcs-home relative overflow-clip bg-[#e7e6e2] text-[#0b0b0b]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Caveat:wght@500&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .rcs-home ::selection { background: ${BLUE}; color: #fff; }
        .rcs-home { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
        .rcs-home .rcs-d { font-family: 'Anton', 'Impact', 'Arial Narrow', sans-serif; font-weight: 400; letter-spacing: -0.012em; }
        .rcs-home .rcs-m { font-family: 'IBM Plex Mono', 'Courier New', monospace; }
        .rcs-home .rcs-b { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; }
        .rcs-home h1, .rcs-home h2, .rcs-home h3 { font-weight: 400; }
        .rcs-home a { -webkit-tap-highlight-color: transparent; }
        .rcs-home .rcs-paper { position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: .09; mix-blend-mode: multiply; background-image: ${NOISE}; }

        [data-reveal] { opacity: 0; transform: translateY(14px); transition: opacity .8s ease var(--d, 0ms), transform .8s cubic-bezier(.2,.65,.25,1) var(--d, 0ms); }
        [data-reveal].rcs-visible { opacity: 1; transform: none; }
        .rcs-link { background: linear-gradient(currentColor, currentColor) 0 100% / 100% 1px no-repeat; }
        .rcs-draw path { stroke-dasharray: 260; stroke-dashoffset: 260; animation: rcs-draw 1.4s .6s cubic-bezier(.2,.65,.25,1) forwards; }
        @keyframes rcs-draw { to { stroke-dashoffset: 0; } }
        .rcs-row:hover .rcs-circle { background: ${BLUE}; color: #fff; }
        .rcs-row:hover .rcs-rowtitle { color: ${BLUE}; }

        @media (prefers-reduced-motion: reduce) {
          .rcs-home { scroll-behavior: auto; }
          [data-reveal] { opacity: 1; transform: none; transition: none; }
          .rcs-draw path { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
      <span aria-hidden="true" className="rcs-paper" />
      <ArtDefs />

      {/* ============ HERO ============ */}
      <section className="relative z-[1] overflow-hidden px-5 pb-0 pt-[6.5rem] sm:px-8 md:h-[48.5vw] md:p-0">
        <div className="md:absolute md:left-[6.8vw] md:top-[10.2vw]">
          <h1 data-reveal className={`${disp} text-black`}>
            <span className="block text-[clamp(2.6rem,11vw,3.6rem)] leading-[1.02] md:text-[5.4vw] md:leading-[6.2vw]">We don’t send</span>
            <span className="ml-[10vw] block text-[clamp(3rem,12.6vw,4.2rem)] uppercase leading-[1.02] md:ml-[5.6vw] md:text-[6vw] md:leading-[6.9vw]" style={{ color: BLUE }}>Press releases.</span>
            <span className="mt-2 block text-[clamp(2.6rem,11vw,3.6rem)] leading-[1.02] md:ml-[0.5vw] md:mt-0 md:text-[5.4vw] md:leading-[6.8vw]">We create</span>
            <span className="ml-[10vw] block text-[clamp(3.2rem,13vw,4.4rem)] uppercase leading-[1.02] md:ml-[6.2vw] md:text-[6.2vw] md:leading-[6.2vw]" style={{ color: BLUE }}>Moments.</span>
          </h1>
        </div>

        {/* hand-drawn underline under MOMENTS */}
        <svg aria-hidden="true" viewBox="0 0 110 30" className="rcs-draw absolute left-[33vw] top-[21.5rem] hidden h-auto w-[10.3vw] fill-none sm:block md:top-[34.7vw]" stroke={BLUE} strokeWidth="2.4" strokeLinecap="round">
          <path d="M3 22 C28 11 62 8 100 9" />
          <path d="M12 27 C42 17 82 15 106 6" />
        </svg>

        <p data-reveal style={{ "--d": "200ms" }} className={`${body} mt-6 text-[14px] font-medium leading-[1.3] md:absolute md:left-[13.2vw] md:top-[36.5vw] md:mt-0 md:text-[1.27vw]`}>
          Rare Creative Studios<br />Modern PR, Reimagined.
        </p>

        <a href="#perspective" data-reveal style={{ "--d": "300ms" }} className={`group mt-8 flex items-center gap-4 md:absolute md:left-[6.7vw] md:top-[43vw] md:mt-0 md:gap-[1.2vw] ${focus}`}>
          <span className="grid h-11 w-11 place-items-center rounded-full border text-[#0a3fdc] transition-colors group-hover:bg-[#0a3fdc] group-hover:text-white md:h-[3vw] md:w-[3vw]" style={{ borderColor: BLUE }}>
            <ArrowDown className="h-4 w-4 md:h-[1.1vw] md:w-[1.1vw]" strokeWidth={1.4} />
          </span>
          <span className={`${mono} text-[10px] uppercase leading-[1.5] tracking-[0.12em] md:text-[0.95vw]`}>Explore<br />the studio</span>
        </a>

        <div className="relative mt-8 md:absolute md:bottom-0 md:right-0 md:mt-0 md:w-[47.3vw]">
          <PortraitArt className="ml-auto block h-auto w-full max-w-[520px] md:max-w-none" />
        </div>
      </section>

      {/* ============ TICKER ============ */}
      <div className="relative z-[1] overflow-x-auto bg-[#0047ee] text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className={`${mono} flex min-w-max items-center justify-between gap-6 px-5 py-3 text-[11px] uppercase tracking-[0.12em] sm:px-8 md:min-w-0 md:px-[5.2vw] md:py-[0.95vw] md:text-[1.1vw]`}>
          {TICKER.map((t, i) => (
            <li key={t} className="flex items-center gap-6 md:gap-[2.2vw]">
              {i > 0 && <span aria-hidden="true" className="text-white/80">/</span>}
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* ============ 01 PERSPECTIVE + 02 NUMBERS ============ */}
      <section id="perspective" className="relative z-[1] border-b border-black/10 px-5 py-14 sm:px-8 md:h-[41.2vw] md:p-0">
        <div className="md:absolute md:left-[5.2vw] md:top-[3.7vw]" data-reveal>
          <Label>01 / Our perspective</Label>
          <h2 className={`${disp} mt-5 text-[clamp(2.8rem,13vw,4rem)] leading-[1.02] md:mt-[1.5vw] md:text-[4.6vw] md:leading-[4.5vw]`}>
            Anyone can<br />publish news.
            <span className="mt-1 block md:mt-[0.9vw]" style={{ color: BLUE }}>Not everyone<br />can make it<br />matter.</span>
          </h2>
        </div>

        <p data-reveal className={`${body} mt-6 max-w-[34ch] text-[14px] leading-[1.4] md:absolute md:left-[5.2vw] md:top-[31vw] md:mt-0 md:max-w-[25vw] md:text-[1.27vw] md:leading-[1.35]`}>
          PR is no longer about visibility. It’s about relevance — and the conversations that shape what’s next.
        </p>

        <Link to="/about" className={`group ${mono} mt-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.12em] md:absolute md:left-[5.2vw] md:top-[37.6vw] md:mt-0 md:gap-[1.2vw] md:text-[0.95vw] ${focus}`} style={{ color: BLUE }}>
          <span aria-hidden="true" className="h-px w-12 bg-[#0a3fdc] md:w-[4.3vw]" />
          <span className="rcs-link pb-0.5">Read our manifesto</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:h-[1.1vw] md:w-[1.1vw]" strokeWidth={1.4} />
        </Link>

        <div className="mt-10 md:absolute md:left-[34.7vw] md:top-[3.6vw] md:mt-0 md:w-[41vw]">
          <ChessArt className="mx-auto block h-auto w-full max-w-[460px] md:max-w-none" />
        </div>

        <div className="mt-12 md:absolute md:left-[78.9vw] md:top-[3.7vw] md:mt-0 md:w-[17.8vw]">
          <Label>02 / By the numbers</Label>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 md:mt-[2vw] md:block">
            {STATS.map((s, i) => (
              <li key={s.value} data-reveal style={{ "--d": `${i * 90}ms` }} className="flex items-center gap-4 border-b border-black/25 py-5 last:border-b-0 md:h-[8.3vw] md:gap-[1.9vw] md:py-0">
                <span className={`${disp} min-w-[4.6rem] text-[2.4rem] leading-none md:min-w-[6vw] md:text-[3.7vw]`}>
                  {s.value === "∞" ? (
                    <svg viewBox="0 0 64 30" className="h-[1.6rem] w-auto md:h-[2.3vw]" fill="none" stroke="#0b0b0b" strokeWidth="8" strokeLinecap="round" aria-label="infinity">
                      <path d="M32 15C26 4 6 4 6 15c0 11 20 11 26 0 6-11 26-11 26 0 0 11-20 11-26 0z" />
                    </svg>
                  ) : (
                    s.value
                  )}
                </span>
                <span className={`${mono} whitespace-pre-line text-[9px] uppercase leading-[1.45] tracking-[0.1em] md:text-[0.82vw]`}>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ 03 WHAT WE DO ============ */}
      <section className="relative z-[1] border-b border-black/10 px-5 py-14 sm:px-8 md:h-[23vw] md:p-0">
        <div className="md:absolute md:left-[5.2vw] md:top-[2.1vw]" data-reveal>
          <Label>03 / What we do</Label>
          <h2 className={`${disp} mt-5 text-[clamp(3.2rem,15vw,4.6rem)] uppercase leading-[0.98] md:mt-[0.9vw] md:text-[6vw] md:leading-[5.9vw]`}>
            Idea.<br />Narrative.<br /><span style={{ color: BLUE }}>Impact.</span>
          </h2>
        </div>

        <ul className={`${body} mt-8 md:absolute md:left-[36.5vw] md:top-[1.1vw] md:mt-0 md:w-[59.2vw]`}>
          {SERVICES.map((s, i) => (
            <li key={s.n} data-reveal style={{ "--d": `${i * 70}ms` }} className="border-b border-black/20 last:border-b-0">
              <Link to="/services" className={`rcs-row flex items-center gap-4 py-4 md:h-[4.3vw] md:gap-0 md:py-0 ${focus}`}>
                <span className={`${body} w-9 text-[13px] font-semibold md:w-[4.4vw] md:text-[1.3vw]`} style={{ color: BLUE }}>{s.n}</span>
                <span className="flex flex-1 flex-col gap-1 md:flex-row md:items-center md:gap-0">
                  <span className="rcs-rowtitle text-[15px] font-semibold transition-colors md:w-[20.6vw] md:text-[1.46vw]">{s.title}</span>
                  <span className="text-[13px] text-black/80 md:flex-1 md:text-[1.12vw]">{s.text}</span>
                </span>
                <span className="rcs-circle grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[#0a3fdc] transition-colors md:h-[2.2vw] md:w-[2.2vw]" style={{ borderColor: BLUE }}>
                  <ArrowRight className="h-4 w-4 md:h-[1.1vw] md:w-[1.1vw]" strokeWidth={1.4} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ============ 04 THE DIFFERENCE ============ */}
      <section className="relative z-[1] px-5 pb-16 pt-10 sm:px-8 md:h-[27.3vw] md:p-0">
        <BuildingArt className="mx-auto block h-auto w-full max-w-[480px] md:absolute md:left-[2.7vw] md:top-0 md:mx-0 md:w-[39vw] md:max-w-none" />

        <div className="mt-8 md:absolute md:left-[44.9vw] md:top-[2.4vw] md:mt-0" data-reveal>
          <Label>04 / The difference</Label>
          <h2 className={`${disp} mt-4 text-[clamp(2.6rem,12vw,3.6rem)] leading-[1.02] md:mt-[1.2vw] md:text-[4.4vw] md:leading-[4.3vw]`}>
            Stop chasing<br />clips. Start<br /><span style={{ color: BLUE }}>building a legacy.</span>
          </h2>
        </div>

        <p data-reveal className={`${body} mt-5 max-w-[36ch] text-[14px] leading-[1.35] md:absolute md:left-[44.9vw] md:top-[19.3vw] md:mt-0 md:max-w-[30vw] md:text-[1.27vw]`}>
          We engineer conversations that move brands from visibility to cultural relevance.
        </p>

        <Link to="/contact" className={`group ${mono} mt-6 inline-flex items-center justify-between gap-6 bg-[#0b0b0b] px-5 py-3.5 text-[10px] uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#0a3fdc] md:absolute md:left-[44.9vw] md:top-[23.1vw] md:mt-0 md:h-[2.9vw] md:w-[16.8vw] md:px-[1.7vw] md:py-0 md:text-[0.95vw] ${focus}`}>
          Let’s make it matter
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:h-[1.1vw] md:w-[1.1vw]" strokeWidth={1.4} />
        </Link>

        <GlobeArt className="ml-auto mt-10 block h-auto w-[60%] max-w-[260px] md:absolute md:left-[77.7vw] md:top-[1.4vw] md:ml-0 md:mt-0 md:w-[22.3vw] md:max-w-none" />
      </section>
    </main>
  );
}