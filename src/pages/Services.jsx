import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import Footer from "../components/layout/Footer";

/* Fonts (.rcs-display, .rcs-body, .rcs-serif) are injected by Navbar, which is mounted on every page. */

/* ---------- data ---------- */
const SERVICES = [
  { n: "01", label: "Strategy", name: ["BRAND", "STRATEGY"], desc: "Before the first headline, there's a position. We define what your brand stands for, who it's for, and why it should matter." },
  { n: "02", label: "Earned media", name: ["PR &", "MEDIA", "RELATIONS"], desc: "The right story, told to the right editors, creators, and communities, so coverage feels earned and conversation feels natural." },
  { n: "03", label: "Campaigns", name: ["CREATIVE", "CAMPAIGNS"], desc: "Big, ownable ideas built to travel across media, talent, and culture, then executed with craft." },
  { n: "04", label: "Narrative", name: ["STORYTELLING"], desc: "We find the human truth inside your brand and shape it into narratives people want to share." },
  { n: "05", label: "Film", name: ["VIDEO", "PRODUCTION"], desc: "From concept to final cut, we direct, shoot, and edit films with a clear point of view and cinematic care." },
  { n: "06", label: "Digital", name: ["DIGITAL", "MARKETING"], desc: "Content, distribution, and audience touchpoints that keep a great idea moving long after launch." },
];

const PROCESS = [
  { n: "01", name: "INSIGHT", desc: "We start with the audience, the culture, and the business problem." },
  { n: "02", name: "IDEA", desc: "One sharp, ownable idea worth building everything around." },
  { n: "03", name: "EXECUTION", desc: "Strategy, creative, and media delivered as one coordinated push." },
  { n: "04", name: "IMPACT", desc: "Attention that turns into conversation, and conversation into momentum." },
];

const FRAMES = ["STRATEGY", "STORY", "CAMPAIGN", "FILM", "IMPACT"];
const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C6A66B]";
const SEC = "relative overflow-hidden px-5 py-24 sm:px-8 md:px-[4vw] md:py-32";

/* ---------- hero: extruded RARE in CSS 3D (decorative; real text is HTML) ---------- */

const DEPTH = 16;
const face = "rcs-display whitespace-nowrap text-[clamp(5rem,26vw,9rem)] leading-[0.8] md:text-[clamp(6rem,14vw,13rem)]";

function RareObject() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    let raf = 0, tx = -18, ty = 6, cx = -18, cy = 6;
    const step = () => {
      raf = 0;
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      el.style.transform = `rotateX(${cy}deg) rotateY(${cx}deg)`;
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf = requestAnimationFrame(step);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
    const onMove = (e) => { tx = (e.clientX / window.innerWidth - 0.5) * 34 - 8; ty = 6 - (e.clientY / window.innerHeight - 0.5) * 16; kick(); };
    const onScroll = () => { tx = Math.sin(window.scrollY / 260) * 20 - 10; ty = 6 + Math.cos(window.scrollY / 340) * 5; kick(); };
    const evt = fine ? "pointermove" : "scroll";
    const fn = fine ? onMove : onScroll;
    window.addEventListener(evt, fn, { passive: true });
    return () => { window.removeEventListener(evt, fn); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div aria-hidden="true" className="select-none [perspective:1000px]">
      <div ref={ref} className="relative [transform-style:preserve-3d]" style={{ transform: "rotateX(6deg) rotateY(-18deg)" }}>
        {Array.from({ length: DEPTH }, (_, i) => (
          <span key={i} className={`absolute left-0 top-0 ${face}`} style={{ transform: `translateZ(${-(DEPTH - i) * 0.02}em)`, color: `hsl(228 88% ${16 + (i / DEPTH) * 30}%)` }}>RARE</span>
        ))}
        <span className={`relative block text-[#F4F2EC] drop-shadow-[0_0_50px_rgba(82,113,255,0.45)] ${face}`}>RARE</span>
      </div>
    </div>
  );
}

/* ---------- scroll reveal ---------- */

function Reveal({ as: Tag = "div", className = "", from = "translate-y-8", delay = 0, children }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transition-all duration-700 ease-out ${on ? "opacity-100 !transform-none" : `opacity-0 ${from}`} ${className}`}>
      {children}
    </Tag>
  );
}

/* ---------- service artwork (CSS) ---------- */

const ART = [
  // 01 strategy: top-down hierarchy
  <div key="a" className="absolute inset-0">
    <span className="absolute left-[34%] top-[12%] h-[24%] w-[28%] bg-[#16249a] [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
    <span className="absolute left-[25%] top-[38%] h-[24%] w-[46%] bg-[#3a55e8] [clip-path:polygon(20%_0,80%_0,100%_100%,0_100%)]" />
    <span className="absolute left-[16%] top-[64%] h-[24%] w-[64%] bg-[#8da0ff] [clip-path:polygon(14%_0,86%_0,100%_100%,0_100%)]" />
    {["Strategy", "Tactics", "Execution"].map((t, k) => (
      <span key={t} className="absolute right-[5%] text-[8px] font-semibold uppercase tracking-[0.24em] text-[#C6A66B]" style={{ top: `${22 + k * 26}%` }}>{t}</span>
    ))}
  </div>,
  // 02 earned media: front page
  <div key="b" className="absolute inset-0 grid place-items-center">
    <div className="w-[62%] -rotate-3 bg-[#ECEBE7] p-4 text-[#050A14] shadow-2xl transition-transform duration-500 group-hover:rotate-0">
      <p className="border-b-4 border-[#050A14] pb-2 text-center text-[clamp(0.65rem,1.6vw,1rem)] font-black tracking-tighter">THE DAILY STORY</p>
      <div className="mt-3 grid grid-cols-3 gap-2"><span className="col-span-2 h-20 bg-[#3a55e8]" /><span className="h-20 bg-[#c9c8c3]" /></div>
      {["100%", "92%", "100%", "68%", "85%"].map((w, k) => <span key={k} className="mt-2 block h-1.5 bg-[#050A14]/80" style={{ width: w }} />)}
    </div>
  </div>,
  // 03 campaigns: tilted billboards
  <div key="c" className="absolute inset-0">
    <span className="absolute left-[6%] top-[14%] h-[72%] w-[34%] -rotate-6 bg-gradient-to-br from-[#5271FF] to-[#16249a] transition-transform duration-500 group-hover:-rotate-12" />
    <span className="rcs-display absolute left-[32%] top-[8%] grid h-[80%] w-[36%] rotate-3 place-items-center bg-[#ECEBE7] text-[clamp(0.9rem,2.2vw,1.7rem)] text-[#050A14] transition-transform duration-500 group-hover:rotate-0">Big idea</span>
    <span className="absolute right-[6%] top-[20%] h-[64%] w-[28%] rotate-12 bg-gradient-to-br from-[#C6A66B] to-[#7a6232] transition-transform duration-500 group-hover:rotate-[18deg]" />
  </div>,
  // 04 storytelling: widescreen frame
  <div key="d" className="absolute inset-0 grid place-items-center">
    <div className="relative aspect-[2.39/1] w-[88%] bg-[#02050c] ring-1 ring-white/15 transition-transform duration-500 group-hover:scale-[1.04]">
      <span className="absolute left-3 top-3 text-[8px] font-bold tracking-widest text-white/50">00:00:12:04</span>
      <span className="rcs-serif absolute inset-0 grid place-items-center text-[clamp(0.8rem,2.2vw,1.45rem)] italic text-[#C6A66B]">Chapter one.</span>
      <span className="absolute bottom-0 left-0 h-1.5 w-1/3 bg-[#5271FF] transition-all duration-700 group-hover:w-2/3" />
    </div>
  </div>,
  // 05 film: frames
  <div key="e" className="absolute inset-0 flex flex-col justify-center gap-2 p-5">
    <span className="block h-2 bg-[repeating-linear-gradient(90deg,#ECEBE7_0_10px,transparent_10px_22px)]" />
    <div className="grid grid-cols-4 gap-2">
      {["ROLL", "FRAME", "CUT", "WRAP"].map((w, k) => (
        <div key={w} className={`rcs-display grid aspect-[3/4] place-items-center text-[clamp(0.55rem,1.2vw,0.8rem)] transition-transform duration-500 group-hover:-translate-y-1 ${["bg-[#5271FF] text-white", "bg-[#ECEBE7] text-[#050A14]", "bg-[#C6A66B] text-[#050A14]", "border border-white/40 text-white"][k]}`}>{w}</div>
      ))}
    </div>
    <span className="block h-2 bg-[repeating-linear-gradient(90deg,#ECEBE7_0_10px,transparent_10px_22px)]" />
  </div>,
  // 06 digital: ripples
  <div key="f" className="absolute inset-0 grid place-items-center">
    <div className="relative aspect-square w-[72%]">
      {[0, 14, 28, 42].map((p, k) => <span key={p} className="absolute rounded-full border border-[#5271FF]/80 transition-transform duration-700 group-hover:scale-105" style={{ inset: `${p}%`, transitionDelay: `${k * 60}ms` }} />)}
      <span className="absolute inset-[44%] rounded-full bg-[#C6A66B] shadow-[0_0_30px_rgba(198,166,107,0.6)]" />
    </div>
  </div>,
];

function Row({ i, flip = false, light = false, bg = "bg-[#050A14]" }) {
  const s = SERVICES[i];
  return (
    <section aria-labelledby={`sv${i}`} className={`${SEC} ${light ? "bg-[#ECEBE7] text-[#050A14]" : `${bg} text-white`} border-t ${light ? "border-[#050A14]/10" : "border-white/10"}`}>
      <Reveal className="group mx-auto grid max-w-[1380px] items-center gap-12 md:grid-cols-12 md:gap-16">
        <div className={`md:col-span-6 ${flip ? "md:order-last" : ""}`}>
          <p className="mb-6 flex items-center gap-4 text-[8px] font-semibold uppercase tracking-[0.3em]">
            <span className={light ? "text-[#B28F4A]" : "text-[#C6A66B]"}>{s.n}</span>
            <span className={light ? "text-[#050A14]/60" : "text-white/55"}>{s.label}</span>
          </p>
          <h2 id={`sv${i}`} className="rcs-display text-[clamp(1.8rem,3.9vw,3.65rem)]">
            {s.name.map((l) => <span key={l} className="block">{l}</span>)}
          </h2>
          <p className={`mt-6 max-w-[42ch] text-[10.5px] leading-relaxed md:text-[11px] ${light ? "text-[#050A14]/70" : "text-white/65"}`}>{s.desc}</p>
        </div>
        <div aria-hidden="true" className="md:col-span-6">
          <div className={`relative aspect-[4/3] overflow-hidden border ${light ? "border-[#050A14]/15 bg-[#050A14]" : "border-white/10 bg-[radial-gradient(ellipse_at_70%_20%,#13255a_0%,#08122a_70%)]"}`}>
            {ART[i]}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- page ---------- */

export default function Services() {
  const toServices = () =>
    document.getElementById("services-start")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });

  return (
    <>
      <main className="rcs-body bg-[#050A14] text-white">
        <style>{`@keyframes rr-marq{to{transform:translateX(-50%)}}`}</style>

        {/* HERO */}
        <header className="relative isolate overflow-hidden px-5 pb-20 pt-32 sm:px-8 md:px-[4vw] md:pb-28 md:pt-44">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_30%,#13255a_0%,#050A14_62%)]" />
          <span aria-hidden="true" className="absolute -right-[18vw] top-24 -z-10 h-[70vw] w-[70vw] rounded-full bg-[#5271FF]/10 blur-3xl md:-right-[6vw] md:h-[42vw] md:w-[42vw]" />

          <div className="mx-auto grid max-w-[1380px] items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="mb-6 text-[8px] font-semibold uppercase tracking-[0.3em] text-[#C6A66B]">Our services</p>
              <h1 className="rcs-display text-[clamp(1.95rem,5.2vw,4.7rem)]">
                <span className="block">We make brands</span>
                <span className="block text-[#5271FF]">impossible</span>
                <span className="block">to ignore.</span>
              </h1>
              <p className="mt-7 max-w-[44ch] text-[10.5px] leading-relaxed text-white/70 md:text-[12px]">
                We combine strategy, storytelling, PR, and creative production to turn brands into conversations people want to be part of.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-9 gap-y-4">
                <button type="button" onClick={toServices} className={`group inline-flex min-h-12 items-center gap-3 rounded-[3px] bg-[#C6A66B] px-6 text-[8px] font-bold uppercase tracking-[0.16em] text-[#050A14] transition-colors hover:bg-[#DDC89D] ${focus}`}>
                  Explore our services
                  <ArrowDown size={15} strokeWidth={2} className="transition-transform group-hover:translate-y-0.5" />
                </button>
                <Link to="/contact" className={`group inline-flex min-h-12 items-center gap-3 text-[8px] font-semibold uppercase tracking-[0.18em] text-white ${focus}`}>
                  Let’s collaborate
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            <div className="flex justify-center md:col-span-5 md:justify-end">
              <RareObject />
            </div>
          </div>
        </header>

        {/* FILM STRIP */}
        <div aria-hidden="true" className="overflow-hidden border-y border-white/10 bg-[#03060D] py-2">
          <span className="block h-2 bg-[repeating-linear-gradient(90deg,#ffffff1f_0_10px,transparent_10px_22px)]" />
          <div className="my-2 flex w-max animate-[rr-marq_32s_linear_infinite] motion-reduce:animate-none">
            {[...FRAMES, ...FRAMES].map((t, i) => (
              <div key={i} className={`rcs-display mx-1.5 grid h-[clamp(4rem,10vw,6.5rem)] w-[clamp(8rem,22vw,14rem)] shrink-0 place-items-center text-[clamp(0.65rem,1.45vw,1rem)] ${i % 2 ? "border border-[#C6A66B]/50 text-[#C6A66B]" : "bg-[#5271FF] text-white"}`}>{t}</div>
            ))}
          </div>
          <span className="block h-2 bg-[repeating-linear-gradient(90deg,#ffffff1f_0_10px,transparent_10px_22px)]" />
        </div>

        {/* SERVICES */}
        <div id="services-start">
          <Row i={0} />
          <Row i={1} flip bg="bg-[#070E1D]" />
          <Row i={2} />
          <Row i={3} flip light />
          <Row i={4} />
          <Row i={5} flip bg="bg-[#070E1D]" />
        </div>

        {/* PROCESS */}
        <section aria-labelledby="proc" className={`${SEC} border-t border-white/10 bg-[#070E1D]`}>
          <div className="mx-auto max-w-[1380px]">
            <Reveal>
              <p className="mb-6 text-[8px] font-semibold uppercase tracking-[0.3em] text-[#C6A66B]">How we work</p>
              <h2 id="proc" className="rcs-display text-[clamp(1.8rem,3.9vw,3.65rem)]">Creative <span className="text-[#5271FF]">process</span></h2>
            </Reveal>
            <ol className="mt-16 md:grid md:grid-cols-4">
              {PROCESS.map((p, i) => (
                <Reveal as="li" key={p.n} delay={i * 150} from="translate-y-8 md:translate-y-0 md:translate-x-10" className="relative border-l border-white/20 pb-12 pl-7 md:border-l-0 md:border-t md:pb-0 md:pl-0 md:pr-8 md:pt-8">
                  <span aria-hidden="true" className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-[#C6A66B] md:-top-[5px] md:left-0" />
                  <p aria-hidden="true" className="rcs-display text-[clamp(1.95rem,3.5vw,3rem)] text-transparent [-webkit-text-stroke:1px_#5271FF]">{p.n}</p>
                  <h3 className="rcs-display mt-3 text-[1.05rem]">{p.name}</h3>
                  <p className="mt-3 max-w-[30ch] text-[10px] leading-relaxed text-white/60">{p.desc}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* FINAL CTA */}
        <section aria-labelledby="cta" className={`${SEC} isolate border-t border-white/10 bg-[#050A14]`}>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_110%,rgba(40,70,255,0.8),transparent_55%),radial-gradient(ellipse_at_20%_0%,rgba(0,35,102,0.8),transparent_55%)]" />
          <Reveal className="mx-auto flex max-w-[1380px] flex-col gap-12 md:flex-row md:items-end md:justify-between">
            <h2 id="cta" className="rcs-serif max-w-[16ch] text-[clamp(1.45rem,3.5vw,3rem)] uppercase leading-[1.05] text-[#C6A66B]">
              Got a big idea? Let’s make it rare.
            </h2>
            <Link to="/contact" className={`group inline-flex shrink-0 items-center gap-5 text-[8px] font-semibold uppercase tracking-[0.2em] ${focus}`}>
              <span className="grid h-16 w-16 place-items-center rounded-full border border-[#C6A66B]/80 text-[#C6A66B] transition-colors duration-300 group-hover:bg-[#C6A66B] group-hover:text-[#050A14]">
                <ArrowUpRight size={20} strokeWidth={1.6} />
              </span>
              Start a project
            </Link>
          </Reveal>
        </section>
      </main>
  
    </>
  );
}