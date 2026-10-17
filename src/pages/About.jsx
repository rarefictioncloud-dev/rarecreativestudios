import { lazy, Suspense, useEffect, useRef, useState } from "react";
import RibbonFallback from "../components/hero/RibbonFallback";

// Three.js is loaded on demand so the page content never waits for it.
const RibbonWorld = lazy(() => import("../components/hero/RibbonWorld"));

// WhatsApp enquiry link: +91 7997658999
const WHATSAPP_URL = `https://wa.me/917997658999?text=${encodeURIComponent(
  "hi , i would like to enquire about rare creative studios"
)}`;

const FOUNDER_IMAGE = "https://pub-c068270ff2f94b2691bb54438e646383.r2.dev/DSCF6122.JPG";

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
  {
    number: "01",
    title: "Strategy",
    kicker: "Narrative design, brand positioning, and perception.",
    body: "Define the territory your brand should own and the feeling it should leave behind.",
  },
  {
    number: "02",
    title: "Influence",
    kicker: "Thought leadership, media relationships, and cultural relevance.",
    body: "Give the story a voice through considered media, creators, leadership, and cultural placements.",
  },
  {
    number: "03",
    title: "Execution",
    kicker: "Targeted media relations, campaign delivery, and amplification.",
    body: "Bring the plan to life with precise delivery, coherent creative, and purposeful distribution.",
  },
];

const capabilities = [
  {
    number: "01",
    title: "Brand Positioning",
    description:
      "Define the space a brand should own, the audience it matters to, and the perception it needs to earn.",
  },
  {
    number: "02",
    title: "Media Strategy & PR",
    description:
      "Build a deliberate narrative and place it with the right journalists, creators, platforms, and conversations.",
  },
  {
    number: "03",
    title: "Story Development",
    description:
      "Find the human truth, sharpen the point of view, and turn brand substance into a story people want to carry forward.",
  },
  {
    number: "04",
    title: "Campaign Execution",
    description:
      "Translate strategy into coordinated moments across media, talent, content, and brand experiences.",
  },
  {
    number: "05",
    title: "Digital Amplification",
    description:
      "Extend the life of a story through thoughtful distribution and relevant audience touchpoints.",
  },
  {
    number: "06",
    title: "Film & Creative Production",
    description:
      "Creative direction, cinematography, video editing, post-production, and short-film production.",
  },
];

const production = [
  "Creative direction",
  "Concept development",
  "Cinematography",
  "Video editing",
  "Post-production",
  "Short-film production",
];

function PlusIcon({ open }) {
  return (
    <span
      aria-hidden="true"
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center transition-transform duration-300 ${
        open ? "rotate-45 text-[#6BA8FF]" : "text-white/75"
      }`}
    >
      <span className="absolute h-[2px] w-5 bg-current" />
      <span className="absolute h-5 w-[2px] bg-current" />
    </span>
  );
}

/* Decorative paper layer. Moves at its own speed (see parallax effect). */
function Layer({ speed, rot = 0, className = "" }) {
  return (
    <div
      aria-hidden="true"
      data-par={speed}
      data-rot={rot}
      className={`pointer-events-none absolute will-change-transform ${className}`}
      style={{ transform: `rotate(${rot}deg)` }}
    />
  );
}

export default function About() {
  const rootRef = useRef(null);
  const [activeFaq, setActiveFaq] = useState(-1);
  const [webgl, setWebgl] = useState(false);
  const [reduced, setReduced] = useState(false);

  /* WebGL support + reduced motion + data saver */
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);
    if (rm || navigator.connection?.saveData) return;
    try {
      const c = document.createElement("canvas");
      setWebgl(
        Boolean(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")))
      );
    } catch {
      setWebgl(false);
    }
  }, []);

  /* Reveal on enter (one observer, unobserves after firing) */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll("[data-reveal]");
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach((i) => i.classList.add("rcs-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("rcs-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.1, rootMargin: "0px 0px -4% 0px" }
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, [reduced]);

  /* Scroll parallax for paper layers: one passive listener, one rAF per frame */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    const layers = Array.from(root.querySelectorAll("[data-par]"));
    let frame = 0;
    const run = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of layers) {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        const d = r.top + r.height / 2 - vh / 2;
        const s = parseFloat(el.dataset.par);
        const rot = parseFloat(el.dataset.rot || 0);
        el.style.transform = `translate3d(0, ${(d * s).toFixed(1)}px, 0) rotate(${(rot + d * s * 0.01).toFixed(2)}deg)`;
      }
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
  }, [reduced]);

  return (
    <main ref={rootRef} className="relative overflow-x-clip bg-[#07080b] text-[#F5F5F2]">
      <style>{`
        .rcs-reveal { opacity: 0; transform: translateY(22px);
          transition: opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1); }
        .rcs-reveal.rcs-tilt { transform: perspective(1200px) rotateX(8deg) translateY(40px); transform-origin: 50% 100%; }
        .rcs-reveal.rcs-in { opacity: 1; transform: none; }

        .rcs-grain::after { content: ""; pointer-events: none; position: absolute; inset: 0; opacity: .07;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.32'/%3E%3C/svg%3E");
          mix-blend-mode: soft-light; }

        .rcs-outline { color: transparent; -webkit-text-stroke: 1.5px currentColor; }
        .rcs-cue { animation: rcs-cue 2.2s ease-in-out infinite; transform-origin: top; }
        @keyframes rcs-cue { 0% { transform: scaleY(0); } 50% { transform: scaleY(1); } 100% { transform: scaleY(1); opacity: 0; } }

        .rcs-faq-panel { display: grid; grid-template-rows: 0fr; visibility: hidden;
          transition: grid-template-rows .35s ease, visibility 0s linear .35s; }
        .rcs-faq-panel[data-open="true"] { grid-template-rows: 1fr; visibility: visible; transition-delay: 0s; }

        @media (prefers-reduced-motion: reduce) {
          .rcs-reveal, .rcs-reveal.rcs-tilt { opacity: 1; transform: none; transition: none; }
          .rcs-cue { animation: none; }
          .rcs-faq-panel { transition: none; }
        }
      `}</style>

      {/* ============ SHARED 3D LAYER (one canvas for the whole page) ============ */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        {webgl ? (
          <Suspense fallback={<RibbonFallback />}>
            <RibbonWorld />
          </Suspense>
        ) : (
          <RibbonFallback />
        )}
        {/* legibility scrim: stronger on phones where the ribbon is closer to the text */}
        <div className="absolute inset-0 bg-[#07080b]/50 md:bg-[#07080b]/25" />
      </div>

      <div className="relative z-10">
        {/* ================= 1. HERO ================= */}
        <section className="rcs-grain relative isolate flex min-h-[92svh] items-end overflow-hidden px-5 pb-[max(3rem,env(safe-area-inset-bottom))] pt-32 sm:px-8 md:min-h-[100svh] md:px-14 md:pb-16">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,5,8,.1)_0%,rgba(4,5,8,.2)_45%,#07080b_100%)]"
            aria-hidden="true"
          />
          <div className="relative mx-auto w-full max-w-[1440px]">

            <h1 className="max-w-[1100px] text-[clamp(1.24rem,6.13vw,4.89rem)] font-black uppercase leading-[.9] tracking-[-.06em] sm:leading-[.86]">
              The best PR
              <br />
              isn’t seen.
              <br />
              <span className="font-editorial font-normal italic tracking-[-.04em] text-[#6BA8FF]">
                It’s felt.
              </span>
            </h1>
          </div>

          <div className="absolute bottom-6 right-5 hidden flex-col items-center gap-3 text-[9px] uppercase tracking-[.25em] text-white/50 sm:flex md:right-14" aria-hidden="true">
            Scroll
            <span className="rcs-cue block h-12 w-px bg-white/60" />
          </div>
        </section>

        {/* ================= 2. PHILOSOPHY ================= */}
        <section id="our-philosophy" className="relative px-4 py-16 sm:px-8 sm:py-24 md:px-14 md:py-32">
          <div className="relative mx-auto max-w-[1440px]">
            {/* back sheets drifting at different speeds */}
            <Layer speed={0.05} rot={-4} className="-left-2 top-6 h-[85%] w-[92%] bg-[#c7cdd6]/40 md:left-4" />
            <Layer speed={-0.04} rot={2.5} className="left-3 top-0 h-[90%] w-[94%] bg-[#6BA8FF]/20 md:left-10" />

            <div
              data-reveal
              className="rcs-reveal rcs-tilt relative bg-[#F1F0EC] px-5 py-12 text-[#0a0b0e] shadow-[0_40px_120px_rgba(0,0,0,.55)] sm:px-10 sm:py-16 md:px-16 md:py-24"
            >
              <div className="grid gap-10 lg:grid-cols-[.6fr_1.4fr] lg:gap-20">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[.28em] text-[#0756BD]">Our philosophy</p>
                  <p className="mt-5 max-w-xs font-editorial text-xl italic leading-snug text-black/60">
                    Modern PR, reimagined.
                  </p>
                </div>

                <div>
                  <h2 className="text-[clamp(1.46rem,5.11vw,4.38rem)] font-semibold uppercase leading-[.95] tracking-[-.05em]">
                    Visibility is easy.
                    <br />
                    <span className="font-editorial font-normal normal-case italic text-[#0756BD]">
                      Relevance is earned.
                    </span>
                  </h2>

                  <div className="mt-8 max-w-2xl space-y-5 border-t border-black/15 pt-6 text-[15px] leading-7 text-black/70 sm:text-base sm:leading-8">
                    <p>
                      We don’t begin with a press release or a list of outlets. We begin with the business, the
                      audience, the cultural context, and the perception the brand needs to earn.
                    </p>
                    <p>
                      From there, we design the narrative, identify the right voices and moments, and bring the story
                      to life through precise execution.
                    </p>
                    <p className="font-semibold text-black">
                      The goal is not noise. It is meaningful attention that lasts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. STRATEGY ================= */}
        <section className="relative overflow-hidden px-5 py-20 sm:px-8 sm:py-28 md:px-14 md:py-36">
          <Layer speed={0.06} rot={8} className="-right-10 top-10 h-64 w-44 bg-[#d9d8d3]/15 sm:h-80 sm:w-56" />
          <div className="relative mx-auto max-w-[1440px]">
            <div data-reveal className="rcs-reveal max-w-5xl">
              <p className="text-[11px] font-bold uppercase tracking-[.28em] text-[#6BA8FF]">The strategy hierarchy</p>
              <h2 className="mt-5 text-[clamp(1.46rem,5.11vw,4.82rem)] font-black uppercase leading-[.9] tracking-[-.06em]">
                Start at the top.
                <br />
                <span className="font-editorial font-normal normal-case italic text-white/55">
                  Make every move count.
                </span>
              </h2>
              <p className="mt-6 max-w-xl text-[15px] leading-7 text-white/70 sm:text-base sm:leading-8">
                Every campaign begins with a clear strategic objective, not a list of disconnected tactics. Each stage
                carries the one before it.
              </p>
            </div>

            {/* connected stages: a descending staircase joined by one line */}
            <ol className="relative mt-14 grid gap-12 md:mt-20 md:grid-cols-3 md:gap-8">
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-[22px] top-0 w-px bg-gradient-to-b from-[#0756BD] via-[#6BA8FF] to-transparent md:hidden"
              />
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 top-[3.5rem] hidden h-px bg-gradient-to-r from-[#0756BD] via-[#6BA8FF] to-transparent md:block"
              />
              {stages.map((s, i) => (
                <li
                  key={s.number}
                  data-reveal
                  className="rcs-reveal relative pl-14 md:pl-0"
                  style={{ marginTop: undefined, transitionDelay: `${i * 90}ms` }}
                >
                  <div className="md:pt-0" style={{ paddingTop: undefined }}>
                    <div className={i === 1 ? "md:mt-16" : i === 2 ? "md:mt-32" : ""}>
                      <span
                        aria-hidden="true"
                        className="absolute left-[16px] top-3 h-3 w-3 rounded-full bg-[#0756BD] ring-4 ring-[#07080b] md:hidden"
                      />
                      <p className="rcs-outline text-[clamp(4.5rem,13vw,9rem)] font-black leading-none tracking-[-.06em] text-[#6BA8FF]">
                        {s.number}
                      </p>
                      <h3 className="mt-4 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">{s.title}</h3>
                      <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-[#6BA8FF]">{s.kicker}</p>
                      <p className="mt-4 max-w-sm text-[15px] leading-7 text-white/65">{s.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ================= 4. CAPABILITIES ================= */}
        <section className="relative px-4 py-16 sm:px-8 sm:py-24 md:px-14 md:py-32">
          <div className="relative mx-auto max-w-[1440px]">
            <Layer speed={0.05} rot={3} className="left-2 top-10 h-[92%] w-[96%] bg-[#C7CDD6]/35 md:left-8" />
            <div
              data-reveal
              className="rcs-reveal rcs-tilt relative bg-[#E9E8E3] px-5 py-12 text-[#090a0d] shadow-[0_40px_120px_rgba(0,0,0,.55)] sm:px-10 sm:py-16 md:px-16 md:py-24"
            >
              <p className="text-[11px] font-bold uppercase tracking-[.28em] text-[#0756BD]">What we do</p>
              <h2 className="mt-5 text-[clamp(1.46rem,5.11vw,4.38rem)] font-black uppercase leading-[.92] tracking-[-.06em]">
                One clear
                <br />
                <span className="font-editorial font-normal normal-case italic text-[#0756BD]">point of view.</span>
              </h2>

              <ul className="mt-12 border-t border-black/15 md:mt-16">
                {capabilities.map((c, i) => (
                  <li
                    key={c.number}
                    className={`grid gap-2 border-b border-black/15 py-7 sm:grid-cols-[minmax(4.5rem,.25fr)_1fr] md:grid-cols-[minmax(6rem,.2fr)_.9fr_1.1fr] md:items-baseline md:gap-8 md:py-9 ${
                      i % 2 ? "md:pl-10 lg:pl-20" : ""
                    }`}
                  >
                    <span className="text-[clamp(2.6rem,6vw,4.5rem)] font-black leading-none tracking-[-.05em] text-[#0756BD]/90">
                      {c.number}
                    </span>
                    <h3 className="text-xl font-semibold leading-tight tracking-[-.03em] sm:text-2xl md:text-3xl">
                      {c.title}
                    </h3>
                    <p className="text-[15px] leading-7 text-black/65 sm:col-start-2 md:col-start-auto">{c.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ================= 5. CREATIVE PRODUCTION ================= */}
        <section className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-32 md:px-14 md:py-44">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(7,86,189,.28),transparent_60%)]"
          />
          <Layer speed={0.07} rot={-9} className="-left-12 top-16 h-72 w-48 bg-[#d9d8d3]/10 sm:h-96 sm:w-64" />
          <Layer speed={-0.05} rot={6} className="-right-10 bottom-10 h-64 w-44 bg-[#C7CDD6]/10 sm:h-80 sm:w-56" />

          <div data-reveal className="rcs-reveal relative mx-auto max-w-[1440px]">
            {/* viewfinder corners */}
            <div className="relative border-[#C7CDD6]/0 px-0 py-2 sm:px-10 sm:py-10">
              <span aria-hidden="true" className="absolute left-0 top-0 hidden h-8 w-8 border-l border-t border-[#C7CDD6]/60 sm:block" />
              <span aria-hidden="true" className="absolute right-0 top-0 hidden h-8 w-8 border-r border-t border-[#C7CDD6]/60 sm:block" />
              <span aria-hidden="true" className="absolute bottom-0 left-0 hidden h-8 w-8 border-b border-l border-[#C7CDD6]/60 sm:block" />
              <span aria-hidden="true" className="absolute bottom-0 right-0 hidden h-8 w-8 border-b border-r border-[#C7CDD6]/60 sm:block" />

              <p className="text-[11px] font-bold uppercase tracking-[.28em] text-[#C7CDD6]">Creative production</p>
              <h2 className="mt-5 text-[clamp(1.61rem,6.21vw,5.4rem)] font-black uppercase leading-[.88] tracking-[-.06em]">
                Stories designed
                <br />
                <span className="font-editorial font-normal normal-case italic text-[#6BA8FF]">to be felt.</span>
              </h2>

              <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
                <p className="max-w-md text-[15px] leading-7 text-white/75 sm:text-base sm:leading-8">
                  Creative production translates strategy into visual experiences with a clear point of view. The
                  idea comes first; the craft carries it.
                </p>
                <ul className="border-t border-[#C7CDD6]/30">
                  {production.map((p) => (
                    <li
                      key={p}
                      className="border-b border-[#C7CDD6]/30 py-3.5 text-base font-medium tracking-[-.01em] text-[#F5F5F2] sm:text-lg"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 5b. FOUNDER'S MESSAGE ================= */}
        <section className="relative px-4 py-16 sm:px-8 sm:py-24 md:px-14 md:py-32">
          <div className="relative mx-auto max-w-[1440px]">
            <Layer speed={0.05} rot={-2.5} className="-left-2 top-8 h-[90%] w-[94%] bg-[#C7CDD6]/35 md:left-6" />
            <div
              data-reveal
              className="rcs-reveal rcs-tilt relative overflow-hidden bg-[#F5F5F2] px-5 py-12 text-[#07080B] shadow-[0_40px_120px_rgba(0,0,0,.55)] sm:px-10 sm:py-16 md:px-16 md:py-24"
            >
              {/* oversized ghost lettering */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-6 right-[-4%] select-none text-[clamp(8rem,34vw,32rem)] font-black uppercase leading-none tracking-[-.06em] text-black/[0.045]"
              >
                Rare
              </span>

              <div className="relative grid items-start gap-12 lg:grid-cols-[minmax(0,.62fr)_minmax(0,1.38fr)] lg:gap-20">
                {/* portrait */}
                <figure className="relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
                  <span aria-hidden="true" className="absolute -left-3 -top-3 h-16 w-16 border-l border-t border-[#0756BD] sm:h-24 sm:w-24" />
                  <span aria-hidden="true" className="absolute -bottom-3 -right-3 h-16 w-16 border-b border-r border-black/25 sm:h-24 sm:w-24" />
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#c7cdd6]">
                    <img
                      src={FOUNDER_IMAGE}
                      alt="Pallapati Vinayvardhan Reddy, Founder of Rare creative studios"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-top"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-5 pb-5 pt-16">
                      <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-white/70">Rare creative studios</p>
                      <p className="mt-1 text-lg font-extrabold leading-tight tracking-[-.02em] text-white sm:text-xl">
                        Pallapati Vinayvardhan Reddy
                      </p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[.22em] text-white/70">Founder</p>
                    </figcaption>
                  </div>
                </figure>

                {/* message */}
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[.28em] text-[#0756BD]">Founder’s message</p>

                  <h2 className="mt-5 text-[clamp(1.39rem,5.4vw,4.09rem)] font-black uppercase leading-[.88] tracking-[-.06em]">
                    Make work
                    <br />
                    <span className="text-black/25">worth remembering.</span>
                  </h2>

                  <div className="mt-8 max-w-2xl space-y-5 border-l border-black/40 pl-5 text-[15px] leading-7 text-black/75 sm:pl-7 sm:text-base sm:leading-8">
                    <p>
                      At Rare creative studios, we see every project as an opportunity to think differently, tell better
                      stories, and create work that makes an impact. We bring together creativity, strategy, and
                      execution to help brands communicate with clarity and connect with the people who matter to
                      them.
                    </p>
                    <p>
                      For us, it’s never just about creating content. It’s about understanding the story behind a
                      brand and finding the right way to bring it to life.
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-black/15 pt-5 text-[10px] font-semibold uppercase tracking-[.2em] text-black/55">
                    <span>Pallapati Vinayvardhan Reddy</span>
                    <span aria-hidden="true" className="h-px w-10 bg-[#0756BD]" />
                    <span className="text-black/45">Founder / Rare creative studios</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 6. FAQ ================= */}
        <section id="faq" className="relative bg-[#07080b]/80 px-5 py-20 sm:px-8 sm:py-28 md:px-14 md:py-32">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
            <div data-reveal className="rcs-reveal lg:sticky lg:top-24 lg:self-start">
              <p className="text-[11px] font-bold uppercase tracking-[.28em] text-[#6BA8FF]">Frequently asked questions</p>
              <h2 className="mt-5 text-[clamp(1.46rem,5.11vw,4.38rem)] font-black uppercase leading-[.9] tracking-[-.06em]">
                The right
                <br />
                questions.
              </h2>
            </div>

            <div className="border-t border-white/20">
              {faqs.map((item, index) => {
                const open = activeFaq === index;
                const panelId = `rcs-faq-panel-${index}`;
                const buttonId = `rcs-faq-button-${index}`;
                return (
                  <div key={item.question} className="border-b border-white/20">
                    <h3>
                      <button
                        type="button"
                        id={buttonId}
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => setActiveFaq(open ? -1 : index)}
                        className="flex min-h-[72px] w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6BA8FF] sm:min-h-[96px]"
                      >
                        <span className="min-w-0 flex-1 text-[clamp(1rem,2.2vw,1.55rem)] font-medium leading-snug tracking-[-.02em]">
                          {item.question}
                        </span>
                        <PlusIcon open={open} />
                      </button>
                    </h3>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      data-open={open}
                      className="rcs-faq-panel"
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-3xl pb-7 pr-2 text-[15px] leading-7 text-white/70 sm:pr-10 sm:text-base sm:leading-8">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= 7. CTA ================= */}
        <section className="relative overflow-hidden px-5 pb-[max(6rem,env(safe-area-inset-bottom))] pt-24 sm:px-8 sm:py-36 md:px-14 md:py-48">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(7,86,189,.35),transparent_60%)]"
          />
          <div data-reveal className="rcs-reveal relative mx-auto max-w-[1440px]">
            <p className="text-[11px] font-bold uppercase tracking-[.28em] text-[#6BA8FF]">The next move</p>
            <h2 className="mt-5 max-w-5xl text-[clamp(1.46rem,5.84vw,5.4rem)] font-black uppercase leading-[.88] tracking-[-.06em]">
              Your brand deserves
              <br />
              <span className="font-editorial font-normal normal-case italic text-[#6BA8FF]">a defining moment.</span>
            </h2>

            <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-md text-[15px] leading-7 text-white/75 sm:text-base sm:leading-8">
                If the ambition is bigger than a mention, let’s start with the story worth telling.
              </p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[56px] w-full items-center justify-between gap-5 rounded-full bg-[#0756BD] px-7 text-xs font-semibold uppercase tracking-[.12em] text-white transition hover:bg-[#06469a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6BA8FF] sm:w-fit sm:justify-start"
              >
                Start a conversation
                <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens WhatsApp in a new tab)</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}