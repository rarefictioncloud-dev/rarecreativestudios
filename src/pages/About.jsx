import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowUpRight } from "lucide-react";

/* BEYOND THE LENS — cinematic About.
   Obsidian #08090B · Charcoal #121417 · Copper #B87345 · Amber #D99A54 · Champagne #C7A477 · Ivory #EAE4DA
   One pinned stage + one master GSAP timeline (0 → 1). The timeline drives a single progress value
   that the R3F scene reads every frame, plus every typographic reveal, so scrolling backwards reverses
   everything. Lenis is NOT created here: use the one your homepage already owns
   (lenis.on("scroll", ScrollTrigger.update) if you haven't wired that already). */

const FilmCanvas = lazy(() => import("../components/about/FilmCanvas"));

const WHATSAPP_URL = `https://wa.me/917997658999?text=${encodeURIComponent("hi , i would like to enquire about rare creative studios")}`;

const STAGES = [
  { n: "01", t: "IMAGINE.", q: "Every extraordinary creation begins with an idea." },
  { n: "02", t: "CONCEPTUALISE.", q: "We turn imagination into direction." },
  { n: "03", t: "CREATE.", q: "We transform vision into experiences." },
  { n: "04", t: "DELIVER.", q: "We make ideas impossible to ignore." },
];
const STATEMENTS = [["VISION", "CONVENTION."], ["DETAIL", "ORDINARY."], ["IMPACT", "EVERYTHING."]];
const CHAPTERS = [[0, "The eye of creativity"], [0.17, "Enter the lens"], [0.36, "From nothing to extraordinary"], [0.71, "The RCS philosophy"], [0.9, "The final reveal"]];

const faqs = [
  { question: "What types of projects do you work on?", answer: "We partner on brand positioning, strategic PR, media strategy, narrative development, campaign execution, and digital amplification. Our creative production work spans creative direction, cinematography, video editing, post-production, and short films. We focus on projects where the ambition is to shape perception—not simply produce more content." },
  { question: "How much do your services cost?", answer: "Our engagements are scoped around the ambition, complexity, deliverables, timeline, and creative involvement required. We do not use a one-size-fits-all price list. After an initial conversation, we define the opportunity and propose a considered scope with clear deliverables and investment." },
  { question: "How long does a typical project take?", answer: "Timelines depend on scope. A focused strategy engagement may move faster than an integrated PR campaign or film production. We agree on milestones, approvals, and delivery expectations before work begins." },
  { question: "Can you work with our in-house team or marketing?", answer: "Yes. We work alongside founders, leadership, internal marketing teams, and production partners. We align on objectives, responsibilities, and approval paths early so the work feels coherent rather than disconnected." },
  { question: "Do you offer concept development or just execution?", answer: "We work from strategy and narrative through creative development, production, and amplification. We can lead the complete process or collaborate at a specific stage when the strategic foundation is already in place." },
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

/* ---------------- small pieces ---------------- */
const Split = ({ t, copper }) =>
  [...t].map((c, i) => (
    <span key={i} className="ch" aria-hidden="true" style={copper ? { color: "#B87345" } : undefined}>{c === " " ? "\u00A0" : c}</span>
  ));

function FadeIn({ children, delay = 0, y = 24, as = "div", className = "" }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;
  if (reduce) { const Plain = as; return <Plain className={className}>{children}</Plain>; }
  return (
    <Comp className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "40px" }} transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </Comp>
  );
}

const Eyebrow = ({ children }) => (
  <p className="mono flex items-center gap-3 text-[#C7A477]"><span aria-hidden="true" className="h-px w-8 bg-[#B87345]" />{children}</p>
);

function Cta({ href, children, external }) {
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="rcs-cta pointer-events-auto fc">
      <span className="rcs-cta-label">{children}</span>
      <span className="rcs-cta-arrow" aria-hidden="true"><ArrowRight size={18} strokeWidth={1.5} /></span>
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}

/* Reduced-motion / no-WebGL version: same story, no pinned scene */
function StaticFilm({ ctaHref }) {
  return (
    <section className="relative px-5 pb-24 pt-40 md:px-14">
      <div className="mx-auto max-w-[1440px] space-y-24">
        <h1 className="disp metal text-[clamp(3.4rem,15vw,13rem)]">Beyond<br />the lens<span className="text-[#B87345]">.</span></h1>
        <p className="disp text-[clamp(2.2rem,8vw,7rem)]">We see what others <span className="ital">imagine.</span></p>
        <ol className="grid gap-10 md:grid-cols-4">
          {STAGES.map((s) => (
            <li key={s.n} className="border-t border-white/15 pt-5">
              <p className="mono text-[#B87345]">Stage {s.n} / 04</p>
              <h2 className="disp mt-3 text-3xl md:text-4xl">{s.t}</h2>
              <p className="mt-3 text-[#EAE4DA]/70">{s.q}</p>
            </li>
          ))}
        </ol>
        <div className="space-y-4">{STATEMENTS.map(([a, b]) => <p key={a} className="disp metal text-[clamp(2rem,7vw,6rem)]">{a} <span className="ital">over</span> {b}</p>)}</div>
        <div className="space-y-6">
          <p className="disp text-[clamp(1.6rem,4vw,3.4rem)]">Rare Creative Studios</p>
          <p className="disp ital text-xl md:text-3xl">We don’t follow the frame. We redefine it.</p>
          <Cta href={ctaHref}>Explore what we create</Cta>
        </div>
      </div>
    </section>
  );
}

/* ---------------- page ---------------- */
export default function About({ ctaHref = "/work" }) {
  const root = useRef(), film = useRef(), bar = useRef(), chap = useRef();
  const [mode, setMode] = useState("pending"); // pending | 3d | static
  const [active, setActive] = useState(true);
  const [faq, setFaq] = useState(-1);
  const prog = useMemo(() => ({ v: 0, intro: 0, ex: 1 }), []);

  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#08090B";
    return () => { document.body.style.backgroundColor = prev; };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || navigator.connection?.saveData) return setMode("static");
    try {
      const c = document.createElement("canvas");
      setMode(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")) ? "3d" : "static");
    } catch { setMode("static"); }
  }, []);

  /* ============ MASTER TIMELINE: one scrubbed timeline, 0 → 1 ============ */
  useLayoutEffect(() => {
    if (mode !== "3d") return;
    gsap.registerPlugin(ScrollTrigger);
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const ctx = gsap.context(() => {
      const Q = gsap.utils.selector(root.current);
      const chars = (sel, at, dur = 0.03, st = 0.003, from = {}) =>
        tl.fromTo(Q(`${sel} .ch`), { yPercent: 110, opacity: 0, ...from }, { yPercent: 0, opacity: 1, rotateX: 0, z: 0, duration: dur, stagger: st, ease: "power3.out" }, at);
      const out = (sel, at, dur = 0.03, to = {}) => tl.to(Q(sel), { autoAlpha: 0, duration: dur, ease: "power2.in", ...to }, at);

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: film.current, start: "top top", end: () => `+=${window.innerHeight * (mobile ? 8 : 11)}`,
          pin: true, scrub: 1.1, anticipatePin: 1, invalidateOnRefresh: true,
          onToggle: (s) => setActive(s.isActive),
        },
        onUpdate: () => {
          const v = prog.v;
          if (bar.current) bar.current.style.transform = `scaleX(${v})`;
          let c = 0; CHAPTERS.forEach(([s], i) => { if (v >= s) c = i; });
          if (chap.current && chap.current.dataset.i !== String(c)) { chap.current.dataset.i = c; chap.current.textContent = `0${c + 1} — ${CHAPTERS[c][1]}`; }
        },
      });

      // the world: camera, lenses, lights, particles all read prog.v
      tl.to(prog, { v: 1, duration: 1 }, 0);

      // SCENE 01 — hero reveals on load (not scrubbed), exits as the camera closes in
      gsap.fromTo(Q("[data-l=hero] .ch"), { yPercent: 110, opacity: 0, rotateX: -50 }, { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.4, stagger: 0.06, ease: "power4.out", delay: 0.9 });
      gsap.fromTo(Q("[data-l=hero] .sm"), { opacity: 0 }, { opacity: 1, duration: 1.6, delay: 1.8 });
      gsap.to(prog, { intro: 1, duration: 3.2, ease: "power2.out", delay: 0.2 });
      tl.to(Q("[data-l=hero]"), { autoAlpha: 0, scale: 1.2, duration: 0.06, ease: "power2.in" }, 0.08);
      tl.to(Q("[data-l=hint]"), { autoAlpha: 0, duration: 0.02 }, 0);

      // SCENE 02 — enter the lens
      chars("[data-l=enter] .r1", 0.25, 0.03, 0.004);
      chars("[data-l=enter] .r2", 0.275, 0.03, 0.004);
      chars("[data-l=enter] .r3", 0.3, 0.035, 0.005);
      out("[data-l=enter]", 0.345, 0.035, { scale: 1.15 });

      // SCENE 03 — four stages
      [0.385, 0.465, 0.545, 0.625].forEach((a, i) => {
        const s = `[data-l=st${i}]`;
        tl.fromTo(Q(s), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.015 }, a);
        chars(`${s} .tt`, a, 0.03, 0.003);
        tl.fromTo(Q(`${s} .qq`), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.025, ease: "power2.out" }, a + 0.02);
        out(s, a + 0.062, 0.02, { y: -30 });
      });

      // SCENE 04 — philosophy
      [0.715, 0.775, 0.835].forEach((s, i) => {
        const sel = `[data-l=ss${i}]`;
        tl.fromTo(Q(sel), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, s);
        chars(sel, s, 0.035, 0.002, { rotateX: -75, z: -260 });
        out(sel, s + 0.052, 0.02, { scale: 1.08 });
      });

      // SCENE 05 — final reveal
      tl.fromTo(Q("[data-l=final]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.915);
      chars("[data-l=final] .ft", 0.92, 0.03, 0.002);
      tl.fromTo(Q("[data-l=final] .fq"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.02, ease: "power2.out" }, 0.95);
      tl.fromTo(Q("[data-l=final] .fc"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.02, ease: "power2.out" }, 0.965);
    }, root);
    return () => { ctx.revert(); prog.v = 0; };
  }, [mode, prog]);

  return (
    <main ref={root} className="rcs-about relative overflow-x-clip">
      <style>{`
        .rcs-about{font-family:'Manrope','Helvetica Neue',Arial,sans-serif;background:#08090B;color:#EAE4DA}
        .rcs-about .disp{font-family:'Playfair Display',Georgia,serif;font-weight:900;letter-spacing:-.04em;line-height:.88;text-transform:uppercase}
        .rcs-about .ital{font-style:italic;text-transform:none;color:#B87345;letter-spacing:-.03em}
        .rcs-about .mono{font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;letter-spacing:.28em;text-transform:uppercase;font-size:10px}
        .rcs-about .metal{background:linear-gradient(180deg,#F4EFE6 0%,#C9BFAF 55%,#8E8372 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
        .rcs-about .metal .ch{background:linear-gradient(180deg,#F4EFE6 0%,#C9BFAF 55%,#8E8372 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
        .rcs-about .mask{display:block;overflow:hidden;padding:.06em 0 .12em}
        .rcs-about .free{display:block;perspective:900px}
        .rcs-about .ch{display:inline-block;will-change:transform,opacity}
        .rcs-about ::selection{background:#B87345;color:#08090B}
        .rcs-about [data-l]{visibility:hidden}
        .rcs-about [data-l=hero]{visibility:visible}
        .rcs-cta{display:inline-flex;align-items:center;gap:1.1rem;position:relative;padding:1rem 0;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#EAE4DA}
        .rcs-cta::before,.rcs-cta::after{content:"";position:absolute;left:0;bottom:0;height:1px;width:100%}
        .rcs-cta::before{background:rgba(234,228,218,.25)}
        .rcs-cta::after{background:#B87345;transform:scaleX(0);transform-origin:left;transition:transform .7s cubic-bezier(.2,.8,.2,1)}
        .rcs-cta:hover::after,.rcs-cta:focus-visible::after{transform:scaleX(1)}
        .rcs-cta-label{transition:letter-spacing .6s cubic-bezier(.2,.8,.2,1),color .4s}
        .rcs-cta:hover .rcs-cta-label{letter-spacing:.38em;color:#D99A54}
        .rcs-cta-arrow{display:grid;place-items:center;width:2.6rem;height:2.6rem;border:1px solid #B87345;border-radius:999px;color:#B87345;transition:transform .6s cubic-bezier(.2,.8,.2,1),background .4s,color .4s}
        .rcs-cta:hover .rcs-cta-arrow{transform:translateX(10px);background:#B87345;color:#08090B}
        .rcs-cta:focus-visible{outline:2px solid #D99A54;outline-offset:6px}
        .rcs-faq{display:grid;grid-template-rows:0fr;visibility:hidden;transition:grid-template-rows .4s ease,visibility 0s linear .4s}
        .rcs-faq[data-open=true]{grid-template-rows:1fr;visibility:visible;transition-delay:0s}
        @media (prefers-reduced-motion:reduce){.rcs-faq{transition:none}}
      `}</style>

      {mode === "pending" && <div className="h-[100svh] bg-[#08090B]" />}
      {mode === "static" && <StaticFilm ctaHref={ctaHref} />}

      {/* =============== THE FILM (pinned, scroll-driven) =============== */}
      {mode === "3d" && (
        <section ref={film} className="relative h-[100svh] w-full overflow-hidden bg-[#08090B]" aria-label="Beyond the lens — Rare Creative Studios">
          <div className="absolute inset-0" aria-hidden="true">
            <Suspense fallback={null}><FilmCanvas progress={prog} active={active} /></Suspense>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(8,9,11,.75)_100%)]" aria-hidden="true" />

          <div className="pointer-events-none absolute inset-0">
            {/* SCENE 01 */}
            <div data-l="hero" className="absolute inset-x-0 bottom-0 px-5 pb-[14vh] md:px-14 md:pb-[11vh]">
              <div className="mx-auto max-w-[1440px]">
                <div className="sm mono mb-5 flex justify-between text-[#C7A477]"><span>Rare Creative Studios / About</span><span className="hidden md:inline">Anamorphic · T1.3 · 50 mm</span></div>
                <h1 aria-label="Beyond the lens." className="disp text-[clamp(3.4rem,15.5vw,15rem)] [text-shadow:0_8px_60px_rgba(0,0,0,.6)]">
                  <span className="mask metal"><Split t="BEYOND" /></span>
                  <span className="mask metal"><Split t="THE LENS" /><Split t="." copper /></span>
                </h1>
              </div>
            </div>

            {/* SCENE 02 */}
            <div data-l="enter" className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center" aria-label="We see what others imagine.">
              <span className="mask disp r1 text-[clamp(2.6rem,10vw,10rem)]"><Split t="WE SEE" /></span>
              <span className="mask disp r2 text-[clamp(2.6rem,10vw,10rem)]"><Split t="WHAT OTHERS" /></span>
              <span className="mask disp ital r3 text-[clamp(2.6rem,10vw,10rem)]"><Split t="IMAGINE." /></span>
            </div>

            {/* SCENE 03 */}
            {STAGES.map((s, i) => (
              <div key={s.n} data-l={`st${i}`} className="absolute inset-x-0 bottom-0 px-5 pb-[17vh] md:px-14 md:pb-[15vh]">
                <div className="mx-auto max-w-[1440px]">
                  <p className="mono mb-4 flex items-center gap-3 text-[#B87345]"><span className="h-px w-10 bg-[#B87345]" aria-hidden="true" />Stage {s.n} / 04</p>
                  <h2 className="disp mask tt metal text-[clamp(2.1rem,8.2vw,7.2rem)]"><Split t={s.t} /></h2>
                  <p className="qq mt-4 max-w-sm font-light leading-relaxed text-[#EAE4DA]/80 md:text-lg">{s.q}</p>
                </div>
              </div>
            ))}

            {/* SCENE 04 */}
            {STATEMENTS.map(([a, b], i) => (
              <div key={a} data-l={`ss${i}`} className="disp absolute inset-0 flex flex-col items-center justify-center px-5 text-center" aria-label={`${a} over ${b}`}>
                <span className="free metal text-[clamp(2.6rem,11.5vw,11rem)]"><Split t={a} /></span>
                <span className="free ital my-[.25em] text-[clamp(1.4rem,5vw,4.5rem)]"><Split t="OVER" /></span>
                <span className="free metal text-[clamp(2.6rem,11.5vw,11rem)]"><Split t={b} /></span>
              </div>
            ))}

            {/* SCENE 05 */}
            <div data-l="final" className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-5 pb-[11vh] text-center">
              <h2 className="disp ft mask metal text-[clamp(1.5rem,4.4vw,4rem)]"><Split t="RARE CREATIVE STUDIOS" /></h2>
              <p className="fq disp ital text-[clamp(1.1rem,2.4vw,2rem)]">We don’t follow the frame. We redefine it.</p>
              <Cta href={ctaHref}>Explore what we create</Cta>
            </div>

            {/* HUD */}
            <div className="absolute inset-x-0 bottom-0 px-5 pb-4 md:px-14">
              <div className="mx-auto max-w-[1440px]">
                <p ref={chap} data-i="0" className="mono mb-3 text-[#EAE4DA]/55">01 — The eye of creativity</p>
                <div className="h-px w-full bg-white/10"><div ref={bar} className="h-full origin-left bg-[#B87345]" style={{ transform: "scaleX(0)" }} /></div>
              </div>
            </div>
            <div data-l="hint" className="mono absolute bottom-[7.5rem] right-5 flex items-center gap-3 text-[#C7A477] md:right-14">Scroll<span className="h-10 w-px bg-[#B87345]" aria-hidden="true" /></div>
          </div>
        </section>
      )}

      {/* =============== AFTER THE FILM =============== */}
      <div className="relative z-10 bg-[#08090B]">
        <section className="px-5 py-28 md:px-14 md:py-44">
          <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[1.1fr_.9fr]">
            <FadeIn>
              <Eyebrow>Our philosophy</Eyebrow>
              <h2 className="disp metal mt-6 text-[clamp(2.6rem,8vw,7.5rem)]">Visibility<br />is easy.</h2>
              <p className="disp ital mt-4 text-[clamp(1.8rem,5vw,4.5rem)]">Relevance is earned.</p>
            </FadeIn>
            <div className="max-w-xl space-y-6 self-end text-[15px] leading-8 text-[#EAE4DA]/70 md:text-[17px]">
              {philosophy.map((t, i) => <FadeIn key={i} delay={i * 0.08}><p className={i === 2 ? "font-semibold text-[#EAE4DA]" : ""}>{t}</p></FadeIn>)}
            </div>
          </div>
        </section>

        <section className="bg-[#121417] px-5 py-24 md:px-14 md:py-36">
          <div className="mx-auto max-w-6xl">
            <FadeIn><Eyebrow>What we do</Eyebrow><h2 className="disp mt-6 text-[clamp(2.4rem,7vw,6.5rem)]">One clear <span className="ital">point of view.</span></h2></FadeIn>
            <ul className="mt-16 md:mt-24">
              {capabilities.map((c, i) => (
                <FadeIn as="li" key={c.number} delay={i * 0.04} className="grid grid-cols-[3.5rem_1fr] gap-x-4 gap-y-3 border-t border-white/10 py-8 md:grid-cols-[8rem_1fr_1.1fr] md:items-baseline md:py-10">
                  <span className="disp text-3xl text-[#B87345] md:text-6xl">{c.number}</span>
                  <h3 className="disp text-xl md:text-3xl">{c.title}</h3>
                  <p className="col-span-2 leading-7 text-[#EAE4DA]/60 md:col-span-1">{c.description}</p>
                </FadeIn>
              ))}
            </ul>
            <FadeIn className="mt-12 flex flex-wrap gap-3">
              {production.map((p) => <span key={p} className="rounded-full border border-[#B87345]/50 px-4 py-2 text-[13px] text-[#C7A477]">{p}</span>)}
            </FadeIn>
          </div>
        </section>

        <section className="px-5 py-28 md:px-14 md:py-40">
          <FadeIn className="relative mx-auto max-w-4xl border-l border-[#B87345] pl-6 md:pl-12">
            <Eyebrow>Founder’s message</Eyebrow>
            <h2 className="disp mt-6 text-[clamp(2rem,5.6vw,4.8rem)]">Make work <span className="ital">worth remembering.</span></h2>
            <div className="mt-8 max-w-2xl space-y-5 leading-8 text-[#EAE4DA]/75 md:text-[17px]">
              <p>At Rare creative studios, we see every project as an opportunity to think differently, tell better stories, and create work that makes an impact. We bring together creativity, strategy, and execution to help brands communicate with clarity and connect with the people who matter to them.</p>
              <p>For us, it’s never just about creating content. It’s about understanding the story behind a brand and finding the right way to bring it to life.</p>
            </div>
            <p className="mono mt-8 text-[#C7A477]">Pallapati Vinayvardhan Reddy — Founder</p>
          </FadeIn>
        </section>

        <section id="faq" className="border-t border-white/10 bg-[#121417] px-5 py-24 md:px-14 md:py-32">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
            <FadeIn className="lg:sticky lg:top-28 lg:self-start">
              <Eyebrow>Frequently asked questions</Eyebrow>
              <h2 className="disp metal mt-6 text-[clamp(2.2rem,5vw,4.6rem)]">The right<br />questions.</h2>
            </FadeIn>
            <div className="border-t border-white/15">
              {faqs.map((f, i) => {
                const open = faq === i;
                return (
                  <div key={f.question} className="border-b border-white/15">
                    <h3>
                      <button type="button" id={`rcs-fb-${i}`} aria-expanded={open} aria-controls={`rcs-fp-${i}`} onClick={() => setFaq(open ? -1 : i)}
                        className="flex min-h-[76px] w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D99A54]">
                        <span className="flex-1 text-[clamp(1.05rem,4.4vw,1.25rem)] font-medium leading-snug tracking-[-.01em]">{f.question}</span>
                        <span aria-hidden="true" className={`relative grid h-10 w-10 shrink-0 place-items-center transition-transform duration-300 ${open ? "rotate-45 text-[#D99A54]" : "text-[#EAE4DA]/70"}`}>
                          <span className="absolute h-[2px] w-5 bg-current" /><span className="absolute h-5 w-[2px] bg-current" />
                        </span>
                      </button>
                    </h3>
                    <div id={`rcs-fp-${i}`} role="region" aria-labelledby={`rcs-fb-${i}`} data-open={open} className="rcs-faq">
                      <div className="overflow-hidden"><p className="max-w-3xl pb-7 pr-2 leading-7 text-[#EAE4DA]/65 md:pr-10">{f.answer}</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden border-t border-white/10 px-5 py-28 md:px-14 md:py-44">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_110%,rgba(184,115,69,.35),transparent_60%)]" />
          <FadeIn className="mx-auto max-w-[1440px]">
            <Eyebrow>The next move</Eyebrow>
            <h2 className="disp mt-6 max-w-5xl text-[clamp(2.2rem,7vw,6.2rem)]">Your brand deserves <span className="ital">a defining moment.</span></h2>
            <div className="mt-12 flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-md leading-8 text-[#EAE4DA]/75">If the ambition is bigger than a mention, let’s start with the story worth telling.</p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="rcs-cta">
                <span className="rcs-cta-label">Start a conversation</span>
                <span className="rcs-cta-arrow" aria-hidden="true"><ArrowUpRight size={18} strokeWidth={1.5} /></span>
                <span className="sr-only"> (opens WhatsApp in a new tab)</span>
              </a>
            </div>
          </FadeIn>
        </section>
      </div>
    </main>
  );
}