import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import RibbonFallback from "../components/hero/RibbonFallback";

/* Fonts (.rcs-display, .rcs-body, .rcs-nav-mono) are injected by Navbar, which is mounted on every page.
   THEME = Home: cobalt #124CCF, ivory #F5F2EA, Playfair serif headlines, Manrope body, mono labels.
   LAYOUT = 3D-creator portfolio pattern: giant hero type, scroll marquee, scroll-revealed text,
   numbered services list, sticky stacking cards. */

const RibbonWorld = lazy(() => import("../components/hero/RibbonWorld"));

const WHATSAPP_URL = `https://wa.me/917997658999?text=${encodeURIComponent(
  "hi , i would like to enquire about rare creative studios"
)}`;

const FOUNDER_IMAGE = "https://pub-c068270ff2f94b2691bb54438e646383.r2.dev/DSCF6122.JPG";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B93FF]";

/* Shared type tokens (match Home) */
const label = "text-[11px] md:text-[8px]";
const h2Main = "text-[clamp(1.7rem,8vw,2.4rem)] md:text-[clamp(1.45rem,3vw,2.75rem)]";
const h2Chapter = "text-[clamp(1.6rem,7.4vw,2.2rem)] md:text-[clamp(1.3rem,2.7vw,2.35rem)]";
const h2Big = "text-[clamp(2.1rem,10vw,3rem)] md:text-[clamp(1.95rem,4vw,3.65rem)]";
const h2Cta = "text-[clamp(1.8rem,9vw,2.6rem)] md:text-[clamp(1.45rem,3.5vw,3rem)]";
const bodyDark = "text-[15px] leading-7 md:text-[10.5px] md:leading-relaxed";
const small = "text-[14px] leading-relaxed md:text-[9px]";
const itemTitle = "text-[clamp(1.3rem,6vw,1.6rem)] md:text-[clamp(1rem,1.45vw,1.3rem)]";
const sectionTitle = "text-[clamp(3rem,12vw,9rem)]";

const FRAMES = ["STRATEGY", "STORY", "INFLUENCE", "FILM", "IMPACT"];

const faqs = [
  {
    question: "What types of projects do you work on?",
    answer:
      "We partner on brand positioning, strategic PR, media strategy, narrative development, campaign execution, and digital amplification. Our creative production work spans creative direction, cinematography, video editing, post-production, and short films. We focus on projects where the ambition is to shape perception—not simply produce more content.",
  },
  {
    question: "How much do your services cost?",
    answer:
      "Our engagements are scoped around the ambition, complexity, deliverables, timeline, and creative involvement required. We do not use a one-size-fits-all price list. After an initial conversation, we define the opportunity and propose a considered scope with clear deliverables and investment.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "Timelines depend on scope. A focused strategy engagement may move faster than an integrated PR campaign or film production. We agree on milestones, approvals, and delivery expectations before work begins.",
  },
  {
    question: "Can you work with our in-house team or marketing?",
    answer:
      "Yes. We work alongside founders, leadership, internal marketing teams, and production partners. We align on objectives, responsibilities, and approval paths early so the work feels coherent rather than disconnected.",
  },
  {
    question: "Do you offer concept development or just execution?",
    answer:
      "We work from strategy and narrative through creative development, production, and amplification. We can lead the complete process or collaborate at a specific stage when the strategic foundation is already in place.",
  },
];

const stages = [
  { number: "01", title: "Strategy", kicker: "Narrative design, brand positioning, and perception.", body: "Define the territory your brand should own and the feeling it should leave behind." },
  { number: "02", title: "Influence", kicker: "Thought leadership, media relationships, and cultural relevance.", body: "Give the story a voice through considered media, creators, leadership, and cultural placements." },
  { number: "03", title: "Execution", kicker: "Targeted media relations, campaign delivery, and amplification.", body: "Bring the plan to life with precise delivery, coherent creative, and purposeful distribution." },
];

const capabilities = [
  { number: "01", title: "Brand Positioning", description: "Define the space a brand should own, the audience it matters to, and the perception it needs to earn." },
  { number: "02", title: "Media Strategy & PR", description: "Build a deliberate narrative and place it with the right journalists, creators, platforms, and conversations." },
  { number: "03", title: "Story Development", description: "Find the human truth, sharpen the point of view, and turn brand substance into a story people want to carry forward." },
  { number: "04", title: "Campaign Execution", description: "Translate strategy into coordinated moments across media, talent, content, and brand experiences." },
  { number: "05", title: "Digital Amplification", description: "Extend the life of a story through thoughtful distribution and relevant audience touchpoints." },
  { number: "06", title: "Film & Creative Production", description: "Creative direction, cinematography, video editing, post-production, and short-film production." },
];

const production = ["Creative direction", "Concept development", "Cinematography", "Video editing", "Post-production", "Short-film production"];

const philosophy = [
  "We don’t begin with a press release or a list of outlets. We begin with the business, the audience, the cultural context, and the perception the brand needs to earn.",
  "From there, we design the narrative, identify the right voices and moments, and bring the story to life through precise execution.",
  "The goal is not noise. It is meaningful attention that lasts.",
];

/* Marquee content: row 1 moves right on scroll, row 2 moves left */
const MARQUEE_ROW_1 = [
  ...capabilities.map((c) => ({ n: c.number, t: c.title, k: "Capability" })),
  ...stages.map((s) => ({ n: s.number, t: s.title, k: "Stage" })),
];
const MARQUEE_ROW_2 = [
  ...FRAMES.map((f, i) => ({ n: `0${i + 1}`, t: f, k: "Frame" })),
  ...production.map((p, i) => ({ n: `0${i + 1}`, t: p, k: "Production" })),
];

/* ------------------------------------------------------------------ */
/* Reusable components                                                 */
/* ------------------------------------------------------------------ */

/* Scroll-in wrapper. Respects reduced motion. */
function FadeIn({ children, delay = 0, duration = 0.7, x = 0, y = 30, as = "div", className = "", style }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;
  if (reduce) {
    const Plain = as;
    return <Plain className={className} style={style}>{children}</Plain>;
  }
  return (
    <Comp
      className={className}
      style={style}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </Comp>
  );
}

/* Mouse-following magnetic effect */
function Magnet({
  children,
  padding = 100,
  strength = 3,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.6s ease-in-out",
  className = "",
  disabled = false,
}) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (disabled) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const move = (e) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      if (Math.abs(dx) < r.width / 2 + padding && Math.abs(dy) < r.height / 2 + padding) {
        setActive(true);
        setPos({ x: dx / strength, y: dy / strength });
      } else {
        setActive(false);
        setPos({ x: 0, y: 0 });
      }
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [padding, strength, disabled]);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <div
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          transition: active ? activeTransition : inactiveTransition,
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* Character-by-character scroll reveal (opacity .2 -> 1) */
function Char({ char, index, total, progress }) {
  const start = index / total;
  const end = Math.min(1, start + 1 / total + 0.02);
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  return <motion.span style={{ opacity }}>{char}</motion.span>;
}

function AnimatedText({ text, className = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] });
  if (reduce) return <p className={className}>{text}</p>;

  const words = text.split(" ");
  const total = text.length;
  let cursor = 0;
  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((word, wi) => {
        const startIndex = cursor;
        cursor += word.length + 1;
        return (
          <span key={wi} aria-hidden="true" className="inline-block whitespace-nowrap">
            {word.split("").map((ch, ci) => (
              <Char key={ci} char={ch} index={startIndex + ci} total={total} progress={scrollYProgress} />
            ))}
            {wi < words.length - 1 && <span>&nbsp;</span>}
          </span>
        );
      })}
    </p>
  );
}

/* Cobalt pill CTA (WhatsApp) */
function ContactButton({ children = "Start a conversation", className = "" }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-full px-8 py-3 font-medium uppercase tracking-widest text-white transition-transform duration-300 hover:scale-[1.03] sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-[11px] ${focus} ${className}`}
      style={{
        background: "linear-gradient(123deg, #071C50 7%, #124CCF 40%, #245DFF 72%, #6B93FF 100%)",
        boxShadow: "0px 4px 4px rgba(18,76,207,.25), 4px 4px 12px #245DFF inset",
        outline: "2px solid white",
        outlineOffset: "-3px",
      }}
    >
      {children}
      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  );
}

function GhostPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border-2 border-[#D7E2EA]/70 px-6 py-2 text-[11px] font-medium uppercase tracking-widest text-[#D7E2EA] sm:px-8 sm:py-2.5 md:text-[9px]">
      {children}
    </span>
  );
}

function PlusIcon({ open }) {
  return (
    <span aria-hidden="true" className={`relative flex h-11 w-11 shrink-0 items-center justify-center transition-transform duration-300 ${open ? "rotate-45 text-[#6B93FF]" : "text-white/75"}`}>
      <span className="absolute h-[2px] w-5 bg-current" />
      <span className="absolute h-5 w-[2px] bg-current" />
    </span>
  );
}

function Eyebrow({ children, tone = "dark" }) {
  return (
    <p className={`rcs-nav-mono flex items-center gap-3 ${label} font-medium uppercase tracking-[.28em] md:tracking-[.3em] ${tone === "light" ? "text-[#124CCF]" : "text-[#6B93FF]"}`}>
      <span aria-hidden="true" className="h-px w-8 bg-current" />
      {children}
    </p>
  );
}

/* Decorative floating "3D" objects used in the philosophy corners */
function FloatObject({ kind, className, delay, x, floatDelay = 0 }) {
  const reduce = useReducedMotion();
  const shapes = {
    ring: (
      <div className="aspect-square w-full rounded-full border-[clamp(10px,2vw,22px)] border-[#245DFF] shadow-[0_0_60px_rgba(36,93,255,.55),inset_0_0_24px_rgba(255,255,255,.35)]" />
    ),
    sheet: (
      <div className="aspect-[4/5] w-full rotate-[-12deg] border border-white/20 bg-[#F5F2EA] shadow-[0_30px_80px_rgba(0,0,0,.55)]">
        <span className="mt-[14%] ml-[14%] block h-[2px] w-[45%] bg-[#C6A66B]" />
      </div>
    ),
    orb: (
      <div className="aspect-square w-full rounded-full bg-[radial-gradient(circle_at_30%_28%,#8FB0FF_0%,#124CCF_45%,#071C50_100%)] shadow-[0_20px_70px_rgba(18,76,207,.6)]" />
    ),
    gold: (
      <div className="aspect-square w-full rounded-full border-[clamp(4px,.8vw,9px)] border-[#C6A66B] shadow-[0_0_40px_rgba(198,166,107,.4),inset_0_0_14px_rgba(255,236,190,.5)]" />
    ),
  };
  return (
    <FadeIn delay={delay} x={x} y={0} duration={0.9} className={`pointer-events-none absolute ${className}`}>
      <motion.div
        aria-hidden="true"
        animate={reduce ? undefined : { y: [0, -16, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 6 + floatDelay, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
      >
        {shapes[kind]}
      </motion.div>
    </FadeIn>
  );
}

/* One row of the scroll-driven marquee */
function MarqueeTile({ item, i }) {
  const v = i % 3;
  const styles = [
    "bg-[#124CCF] text-white",
    "bg-[#F5F2EA] text-[#111111]",
    "border border-[#6B93FF]/50 bg-[#071C50]/60 text-[#8FB0FF]",
  ];
  return (
    <div className={`relative flex h-[180px] w-[280px] shrink-0 flex-col justify-between rounded-2xl p-5 sm:h-[270px] sm:w-[420px] sm:p-7 ${styles[v]}`}>
      <div className="rcs-nav-mono flex items-center justify-between text-[10px] uppercase tracking-[.25em] opacity-70 md:text-[8px]">
        <span>{item.k}</span>
        <span>{item.n}</span>
      </div>
      <p className="rcs-display uppercase text-[clamp(1.4rem,3.4vw,2.4rem)] leading-[.95]">{item.t}</p>
    </div>
  );
}

function MarqueeSection() {
  const sectionRef = useRef(null);
  const row1 = useRef(null);
  const row2 = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    let frame = 0;
    const run = () => {
      frame = 0;
      const el = sectionRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const offset = (window.scrollY - top + window.innerHeight) * 0.3;
      if (row1.current) row1.current.style.transform = `translate3d(calc(-33.333% + ${offset - 200}px), 0, 0)`;
      if (row2.current) row2.current.style.transform = `translate3d(calc(-33.333% - ${offset - 200}px), 0, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };
    run();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduce]);

  const tripled = (arr) => [...arr, ...arr, ...arr];

  return (
    <section ref={sectionRef} aria-hidden="true" className="relative overflow-hidden border-y border-white/10 bg-[#050A14]/80 pb-10 pt-24 sm:pt-32 md:pt-40">
      <div ref={row1} className="flex w-max gap-3" style={{ willChange: "transform", transform: "translate3d(-33.333%,0,0)" }}>
        {tripled(MARQUEE_ROW_1).map((item, i) => (
          <MarqueeTile key={`a${i}`} item={item} i={i} />
        ))}
      </div>
      <div ref={row2} className="mt-3 flex w-max gap-3" style={{ willChange: "transform", transform: "translate3d(-33.333%,0,0)" }}>
        {tripled(MARQUEE_ROW_2).map((item, i) => (
          <MarqueeTile key={`b${i}`} item={item} i={i + 1} />
        ))}
      </div>
    </section>
  );
}

/* Sticky stacking card: scales down as later cards slide over it */
function StageCard({ stage, index, total, progress }) {
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const range = [index / total, 1];
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div className="sticky top-24 h-[85vh] md:top-32">
      <motion.div
        style={{ scale, top: `${index * 28}px` }}
        className="relative origin-top rounded-[40px] border-2 border-[#6B93FF]/50 bg-[#050A14] p-4 shadow-[0_40px_120px_rgba(0,0,0,.6)] sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8"
      >
        {/* top row */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-2 sm:px-4">
          <div className="flex items-center gap-4 sm:gap-8">
            <span className="rcs-display rcs-outline text-[clamp(3rem,10vw,8rem)] leading-none text-[#245DFF]">{stage.number}</span>
            <div>
              <p className={`rcs-nav-mono ${label} uppercase tracking-[.25em] text-[#6B93FF]`}>Stage {stage.number} / 0{total}</p>
              <h3 className="rcs-display mt-1 uppercase text-[clamp(1.4rem,4vw,3rem)]">{stage.title}</h3>
            </div>
          </div>
          <GhostPill>The hierarchy</GhostPill>
        </div>

        {/* bottom grid: 40% / 60% */}
        <div className="mt-4 grid grid-cols-[40fr_60fr] gap-3 sm:mt-6 sm:gap-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div
              className="flex items-end overflow-hidden rounded-[28px] bg-[#124CCF] p-4 sm:rounded-[40px] sm:p-6 md:rounded-[50px]"
              style={{ height: "clamp(130px, 16vw, 230px)" }}
            >
              <p className="text-[11px] font-semibold leading-snug text-white sm:text-[13px] md:text-[11px]">{stage.kicker}</p>
            </div>
            <div
              className="flex items-end overflow-hidden rounded-[28px] bg-[#F5F2EA] p-4 text-[#111111] sm:rounded-[40px] sm:p-6 md:rounded-[50px]"
              style={{ height: "clamp(160px, 22vw, 340px)" }}
            >
              <p className="text-[11px] leading-snug text-black/70 sm:text-[13px] md:text-[11px]">{stage.body}</p>
            </div>
          </div>
          <div
            className="relative flex items-center justify-center overflow-hidden rounded-[28px] bg-[radial-gradient(ellipse_at_70%_20%,#245DFF_0%,#124CCF_40%,#071C50_100%)] sm:rounded-[40px] md:rounded-[50px]"
            style={{ height: "calc(clamp(130px, 16vw, 230px) + clamp(160px, 22vw, 340px) + 0.75rem)" }}
          >
            <span aria-hidden="true" className="absolute h-[70%] w-[46%] rotate-[-18deg] rounded-[50%] border-[clamp(10px,2.4vw,30px)] border-[#8FB0FF]/70 shadow-[0_0_60px_rgba(143,176,255,.5)]" />
            <span aria-hidden="true" className="absolute right-[12%] top-[14%] h-[14%] w-[9%] rounded-full border-[3px] border-[#C6A66B]" />
            <span aria-hidden="true" className="rcs-display pointer-events-none select-none uppercase text-[clamp(1.6rem,6.5vw,6rem)] text-white/90 mix-blend-overlay">{stage.title}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StrategyStack() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <div ref={ref} className="mt-12 md:mt-20">
      {stages.map((s, i) => (
        <StageCard key={s.number} stage={s} index={i} total={stages.length} progress={scrollYProgress} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function About() {
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const [activeFaq, setActiveFaq] = useState(-1);
  const [webgl, setWebgl] = useState(false);
  const [reduced, setReduced] = useState(false);

  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], [0, -140]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0.2]);

  /* The footer sits outside <main>; give the page a solid navy backdrop so it is always readable */
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#050A14";
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, []);

  /* WebGL support + reduced motion + data saver */
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);
    if (rm || navigator.connection?.saveData) return;
    try {
      const c = document.createElement("canvas");
      setWebgl(Boolean(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))));
    } catch {
      setWebgl(false);
    }
  }, []);

  return (
    <main ref={rootRef} data-scene-root className="rcs-about rcs-body relative overflow-x-clip bg-[#050A14] text-[#F5F2EA]">
      <style>{`
        .rcs-about { font-family: 'Manrope', 'Helvetica Neue', Arial, sans-serif; }
        .rcs-about .rcs-display { font-family: 'Playfair Display', Georgia, serif; font-weight: 900; letter-spacing: -0.045em; line-height: .92; }
        .rcs-about .font-editorial { font-family: 'Playfair Display', Georgia, serif; }
        .rcs-about ::selection { background: #124CCF; color: #fff; }

        /* gradient headline text */
        .rcs-grad { background: linear-gradient(180deg, #7F8796 0%, #D7E2EA 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }

        .rcs-grain::after { content: ""; pointer-events: none; position: absolute; inset: 0; opacity: .07;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.32'/%3E%3C/svg%3E");
          mix-blend-mode: soft-light; }

        .rcs-outline { color: transparent; -webkit-text-stroke: 1px currentColor; }

        .rcs-faq-panel { display: grid; grid-template-rows: 0fr; visibility: hidden; transition: grid-template-rows .35s ease, visibility 0s linear .35s; }
        .rcs-faq-panel[data-open="true"] { grid-template-rows: 1fr; visibility: visible; transition-delay: 0s; }

        @media (prefers-reduced-motion: reduce) {
          .rcs-faq-panel { transition: none; }
        }
      `}</style>

      {/* ============ SHARED 3D LAYER (one canvas for the whole page) ============ */}
      <div className="pointer-events-none absolute inset-0 z-0 [clip-path:inset(0)]" aria-hidden="true">
        <div className="fixed inset-0">
          {webgl ? (
            <Suspense fallback={<RibbonFallback />}>
              <RibbonWorld />
            </Suspense>
          ) : (
            <RibbonFallback />
          )}
          <div className="absolute inset-0 bg-[#050A14]/55 md:bg-[#050A14]/40" />
        </div>
      </div>

      <div className="relative z-10">
        {/* ================= 1. HERO ================= */}
        <section ref={heroRef} className="rcs-grain relative isolate flex h-screen min-h-[640px] flex-col justify-end overflow-hidden px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-28 sm:px-8 md:px-14">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,5,8,.1)_0%,rgba(4,5,8,.2)_45%,#050A14_100%)]" aria-hidden="true" />

          <motion.div style={reduced ? undefined : { y: heroY, opacity: heroOpacity }} className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end">
            <FadeIn delay={0} y={-20}>
              <p className={`rcs-nav-mono mb-6 ${label} uppercase tracking-[.3em] text-white/70`}>Strategy / Story / Culture</p>
            </FadeIn>

            <FadeIn delay={0.15} y={40} className="w-full overflow-hidden">
              <h1 className="rcs-display w-full whitespace-nowrap uppercase leading-none text-[10.5vw] sm:text-[11vw] md:text-[11.5vw] lg:text-[12vw]">
                <span className="rcs-grad block">The best PR</span>
                <span className="rcs-grad block">isn’t seen.</span>
                <span className="font-editorial mt-2 block font-black normal-case italic tracking-[-.04em] text-[#6B93FF] text-[9vw] sm:text-[9.5vw] md:text-[9.5vw]">It’s felt.</span>
              </h1>
            </FadeIn>
          </motion.div>

          {/* bottom bar */}
          <div className="relative mx-auto mt-8 flex w-full max-w-[1440px] items-end justify-between gap-6 pb-2 sm:pb-4 md:pb-6">
            <FadeIn delay={0.35} y={20}>
              <p className="max-w-[160px] font-light uppercase leading-snug tracking-wide text-[#D7E2EA] sm:max-w-[220px] md:max-w-[260px]" style={{ fontSize: "clamp(0.75rem, 1.2vw, 1.1rem)" }}>
                Modern PR, reimagined. Narrative, influence and film that shape perception.
              </p>
            </FadeIn>
            <FadeIn delay={0.5} y={20}>
              <Magnet padding={120} strength={3}>
                <ContactButton />
              </Magnet>
            </FadeIn>
          </div>
        </section>

        {/* ============ 2. MARQUEE ============ */}
        <MarqueeSection />

        {/* ================= 3. PHILOSOPHY (about) ================= */}
        <section id="our-philosophy" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050A14]/55 px-5 py-20 sm:px-8 md:px-10">
          <FloatObject kind="orb" delay={0.1} x={-80} floatDelay={0} className="left-[1%] top-[4%] w-[110px] sm:left-[2%] sm:w-[150px] md:left-[4%] md:w-[200px]" />
          <FloatObject kind="gold" delay={0.25} x={-80} floatDelay={1.2} className="bottom-[8%] left-[3%] w-[90px] sm:left-[6%] sm:w-[130px] md:left-[10%] md:w-[170px]" />
          <FloatObject kind="ring" delay={0.15} x={80} floatDelay={0.6} className="right-[1%] top-[4%] w-[110px] sm:right-[2%] sm:w-[150px] md:right-[4%] md:w-[200px]" />
          <FloatObject kind="sheet" delay={0.3} x={80} floatDelay={1.8} className="bottom-[8%] right-[3%] w-[100px] sm:right-[6%] sm:w-[140px] md:right-[10%] md:w-[190px]" />

          <div className="relative z-10 flex flex-col items-center gap-16 text-center sm:gap-20 md:gap-24">
            <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
              <FadeIn y={40}>
                <div className="flex flex-col items-center gap-5">
                  <Eyebrow>Our philosophy</Eyebrow>
                  <h2 className="rcs-display rcs-grad uppercase leading-none text-[clamp(2.2rem,9vw,7rem)]">
                    Visibility
                    <br />
                    is easy.
                  </h2>
                  <p className="font-editorial font-black italic tracking-[-.04em] text-[#6B93FF] text-[clamp(1.6rem,6vw,4.5rem)]">Relevance is earned.</p>
                </div>
              </FadeIn>

              <div className="flex max-w-[560px] flex-col gap-5">
                <AnimatedText text={philosophy[0]} className="text-center font-medium leading-relaxed text-[#D7E2EA]" />
                <AnimatedText text={philosophy[1]} className="text-center font-medium leading-relaxed text-[#D7E2EA]" />
                <AnimatedText text={philosophy[2]} className="text-center font-bold leading-relaxed text-white" />
              </div>
            </div>

            <FadeIn delay={0.1}>
              <Magnet padding={120} strength={3}>
                <ContactButton />
              </Magnet>
            </FadeIn>
          </div>
        </section>

        {/* ================= 4. WHAT WE DO (ivory, numbered list) ================= */}
        <section className="relative rounded-t-[40px] bg-[#F5F2EA] px-5 py-20 text-[#0C0C0C] sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32">
          <FadeIn>
            <div className="mb-16 flex flex-col items-center gap-4 text-center sm:mb-20 md:mb-28">
              <Eyebrow tone="light">What we do</Eyebrow>
              <h2 className={`rcs-display uppercase leading-none ${sectionTitle}`}>
                One clear
                <br />
                <span className="font-editorial font-black normal-case italic tracking-[-.04em] text-[#124CCF]">point of view.</span>
              </h2>
            </div>
          </FadeIn>

          <ul className="mx-auto max-w-5xl">
            {capabilities.map((c, i) => (
              <FadeIn as="li" key={c.number} delay={i * 0.1} className="flex items-start gap-5 border-b py-8 sm:gap-8 sm:py-10 md:gap-12 md:py-12" style={{ borderColor: "rgba(12,12,12,.15)", borderTopWidth: i === 0 ? 1 : 0, borderTopStyle: "solid" }}>
                <span className="rcs-display shrink-0 leading-none text-[#0C0C0C]" style={{ fontSize: "clamp(3rem, 10vw, 140px)" }}>{c.number}</span>
                <div className="flex flex-col gap-3 pt-1 sm:pt-3">
                  <h3 className="rcs-display uppercase" style={{ fontSize: "clamp(1rem, 2.2vw, 2.1rem)" }}>{c.title}</h3>
                  <p className="max-w-2xl font-light leading-relaxed" style={{ fontSize: "clamp(0.85rem, 1.6vw, 1.25rem)", opacity: 0.6 }}>{c.description}</p>
                </div>
              </FadeIn>
            ))}
          </ul>
        </section>

        {/* ================= 5. STRATEGY HIERARCHY (sticky stacking cards) ================= */}
        <section className="relative z-10 -mt-10 rounded-t-[40px] bg-[#050A14] px-5 pb-24 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pt-32">
          <FadeIn>
            <div className="flex flex-col items-center gap-5 text-center">
              <Eyebrow>The strategy hierarchy</Eyebrow>
              <h2 className={`rcs-display rcs-grad uppercase leading-none ${sectionTitle}`}>Start at the top.</h2>
              <p className="font-editorial font-black italic tracking-[-.04em] text-white/55 text-[clamp(1.4rem,5vw,3.2rem)]">Make every move count.</p>
              <p className={`mt-2 max-w-xl text-white/70 ${bodyDark}`}>
                Every campaign begins with a clear strategic objective, not a list of disconnected tactics. Each stage carries the one before it.
              </p>
            </div>
          </FadeIn>

          <div className="mx-auto max-w-[1440px]">
            <StrategyStack />
          </div>
        </section>

        {/* ================= 6. CREATIVE PRODUCTION ================= */}
        <section className="relative overflow-hidden border-t border-white/10 bg-[#071C50]/85 px-5 py-24 sm:px-8 sm:py-32 md:px-14 md:py-44">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(36,93,255,.3),transparent_60%)]" />
          <FadeIn className="relative mx-auto max-w-[1440px]">
            <div className="relative px-0 py-2 sm:px-10 sm:py-10">
              <span aria-hidden="true" className="absolute left-0 top-0 hidden h-8 w-8 border-l border-t border-[#6B93FF]/70 sm:block" />
              <span aria-hidden="true" className="absolute right-0 top-0 hidden h-8 w-8 border-r border-t border-[#6B93FF]/70 sm:block" />
              <span aria-hidden="true" className="absolute bottom-0 left-0 hidden h-8 w-8 border-b border-l border-[#6B93FF]/70 sm:block" />
              <span aria-hidden="true" className="absolute bottom-0 right-0 hidden h-8 w-8 border-b border-r border-[#6B93FF]/70 sm:block" />

              <Eyebrow>Creative production</Eyebrow>
              <h2 className={`rcs-display mt-5 uppercase ${h2Big}`}>
                Stories designed
                <br />
                <span className="font-editorial font-black normal-case italic tracking-[-.04em] text-[#8FB0FF]">to be felt.</span>
              </h2>

              <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
                <p className={`max-w-md text-white/75 ${bodyDark}`}>
                  Creative production translates strategy into visual experiences with a clear point of view. The idea comes first; the craft carries it.
                </p>
                <ul className="border-t border-white/20">
                  {production.map((p, i) => (
                    <FadeIn as="li" key={p} delay={i * 0.06} y={16} className="flex items-baseline gap-4 border-b border-white/20 py-3.5 text-[15px] font-medium tracking-[-.01em] text-[#F5F2EA] md:text-[10.5px]">
                      <span aria-hidden="true" className={`rcs-nav-mono ${label} tracking-[.2em] text-[#8FB0FF]`}>0{i + 1}</span>
                      {p}
                    </FadeIn>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ================= 7. FOUNDER'S MESSAGE ================= */}
        <section className="relative px-4 py-16 sm:px-8 sm:py-24 md:px-14 md:py-32">
          <div className="relative mx-auto max-w-[1440px]">
            <FadeIn y={50} className="relative overflow-hidden rounded-[40px] bg-[#F5F2EA] px-5 py-12 text-[#111111] shadow-[0_40px_120px_rgba(0,0,0,.55)] sm:rounded-[50px] sm:px-10 sm:py-16 md:rounded-[60px] md:px-16 md:py-24">
              <span aria-hidden="true" className="rcs-display pointer-events-none absolute -bottom-6 right-[-4%] select-none text-[clamp(8rem,34vw,32rem)] uppercase leading-none text-black/[0.045]">Rare</span>

              <div className="relative grid items-start gap-12 lg:grid-cols-[minmax(0,.62fr)_minmax(0,1.38fr)] lg:gap-20">
                <figure className="relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
                  <span aria-hidden="true" className="absolute -left-3 -top-3 h-16 w-16 border-l border-t border-[#124CCF] sm:h-24 sm:w-24" />
                  <span aria-hidden="true" className="absolute -bottom-3 -right-3 h-16 w-16 border-b border-r border-black/25 sm:h-24 sm:w-24" />
                  <Magnet padding={150} strength={3} activeTransition="transform 0.3s ease-out" inactiveTransition="transform 0.6s ease-in-out" className="block w-full">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#C6CBD3] sm:rounded-[36px]">
                      <img src={FOUNDER_IMAGE} alt="Pallapati Vinayvardhan Reddy, Founder of Rare creative studios" loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-5 pb-5 pt-16">
                        <p className="rcs-nav-mono text-[10px] font-medium uppercase tracking-[.22em] text-[#8FB0FF] md:text-[8px]">Rare creative studios</p>
                        <p className="rcs-display mt-1 text-base leading-tight text-white md:text-[clamp(1rem,1.45vw,1.3rem)]">Pallapati Vinayvardhan Reddy</p>
                        <p className="rcs-nav-mono mt-1 text-[10px] uppercase tracking-[.22em] text-white/70 md:text-[8px]">Founder</p>
                      </figcaption>
                    </div>
                  </Magnet>
                </figure>

                <div className="min-w-0">
                  <Eyebrow tone="light">Founder’s message</Eyebrow>
                  <h2 className={`rcs-display mt-5 uppercase ${h2Chapter}`}>
                    Make work
                    <br />
                    <span className="text-[#124CCF]">worth remembering.</span>
                  </h2>

                  <div className={`mt-8 max-w-2xl space-y-5 border-l border-[#124CCF] pl-5 text-black/75 sm:pl-7 ${bodyDark}`}>
                    <p>At Rare creative studios, we see every project as an opportunity to think differently, tell better stories, and create work that makes an impact. We bring together creativity, strategy, and execution to help brands communicate with clarity and connect with the people who matter to them.</p>
                    <p>For us, it’s never just about creating content. It’s about understanding the story behind a brand and finding the right way to bring it to life.</p>
                  </div>

                  <div className="rcs-nav-mono mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#111111]/15 pt-5 text-[10px] uppercase tracking-[.2em] text-black/60 md:text-[8px]">
                    <span>Pallapati Vinayvardhan Reddy</span>
                    <span aria-hidden="true" className="h-px w-10 bg-[#124CCF]" />
                    <span className="text-black/50">Founder / Rare creative studios</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ================= 8. FAQ ================= */}
        <section id="faq" className="relative border-t border-white/10 bg-[#050A14]/90 px-5 py-20 sm:px-8 sm:py-28 md:px-14 md:py-32">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
            <FadeIn className="lg:sticky lg:top-24 lg:self-start">
              <Eyebrow>Frequently asked questions</Eyebrow>
              <h2 className={`rcs-display rcs-grad mt-5 uppercase ${h2Main}`}>
                The right
                <br />
                questions.
              </h2>
            </FadeIn>

            <div className="border-t border-white/20">
              {faqs.map((item, index) => {
                const open = activeFaq === index;
                const panelId = `rcs-faq-panel-${index}`;
                const buttonId = `rcs-faq-button-${index}`;
                return (
                  <FadeIn key={item.question} delay={index * 0.05} y={18} className="border-b border-white/20">
                    <h3>
                      <button
                        type="button"
                        id={buttonId}
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => setActiveFaq(open ? -1 : index)}
                        className={`flex min-h-[72px] w-full items-center justify-between gap-4 py-5 text-left md:min-h-[84px] ${focus}`}
                      >
                        <span className="min-w-0 flex-1 text-[clamp(1.05rem,4.6vw,1.2rem)] font-medium leading-snug tracking-[-.02em] md:text-[clamp(.9rem,1.45vw,1.15rem)]">{item.question}</span>
                        <PlusIcon open={open} />
                      </button>
                    </h3>
                    <div id={panelId} role="region" aria-labelledby={buttonId} data-open={open} className="rcs-faq-panel">
                      <div className="overflow-hidden">
                        <p className={`max-w-3xl pb-7 pr-2 text-white/70 sm:pr-10 ${bodyDark} md:text-[10px]`}>{item.answer}</p>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= 9. CTA ================= */}
        <section className="relative isolate overflow-hidden border-t border-white/10 bg-[#124CCF] px-5 pb-[max(6rem,env(safe-area-inset-bottom))] pt-24 text-[#F5F2EA] sm:px-8 sm:py-36 md:px-14 md:py-48">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_110%,rgba(36,93,255,.9),transparent_55%),radial-gradient(ellipse_at_15%_0%,rgba(7,28,80,.7),transparent_55%)]" />
          <FadeIn className="relative mx-auto max-w-[1440px]">
            <p className={`rcs-nav-mono flex items-center gap-3 ${label} font-medium uppercase tracking-[.28em] text-white/80`}>
              <span aria-hidden="true" className="h-px w-8 bg-current" />
              The next move
            </p>
            <h2 className={`rcs-display mt-5 max-w-5xl uppercase ${h2Cta}`}>
              Your brand deserves
              <br />
              <span className="font-editorial font-black normal-case italic tracking-[-.04em]">a defining moment.</span>
            </h2>

            <div className="mt-10 flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
              <p className={`max-w-md text-white/85 ${bodyDark}`}>If the ambition is bigger than a mention, let’s start with the story worth telling.</p>
              <Magnet padding={140} strength={3}>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group inline-flex shrink-0 items-center gap-5 ${label} font-semibold uppercase tracking-[.2em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white`}
                >
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-[#F5F2EA]/80 text-[#F5F2EA] transition-colors duration-300 group-hover:bg-[#F5F2EA] group-hover:text-[#124CCF]">
                    <ArrowUpRight size={20} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  Start a conversation
                  <span className="sr-only"> (opens WhatsApp in a new tab)</span>
                </a>
              </Magnet>
            </div>
          </FadeIn>
        </section>
      </div>
    </main>
  );
}