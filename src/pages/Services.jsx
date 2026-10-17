import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/layout/Footer";

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

/* ---------- 3D RARE object (CSS 3D) ---------- */

const DEPTH = 16;
const face = "whitespace-nowrap text-[clamp(4.5rem,22vw,8rem)] font-black leading-[0.8] tracking-tighter md:text-[clamp(5rem,12.5vw,13rem)]";

// Extruded "RARE": stacked text layers in CSS 3D. Decorative only; the page's real text is HTML.
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
          <span key={i} className={`absolute left-0 top-0 ${face}`} style={{ transform: `translateZ(${-(DEPTH - i) * 3}px)`, color: `hsl(213 92% ${22 + (i / DEPTH) * 16}%)` }}>RARE</span>
        ))}
        <span className={`relative block text-[#090909] ${face}`}>RARE</span>
      </div>
    </div>
  );
}

/* ---------- page ---------- */
const CSS = `@keyframes rr-marq{to{transform:translateX(-50%)}}`;
const SEC = "relative overflow-hidden px-[clamp(1.25rem,5vw,4rem)] py-20 md:py-32";
const T = "break-words text-[clamp(1.8rem,8.5vw,7rem)] font-black uppercase leading-[0.9] tracking-tighter";
const btn = "inline-block px-7 py-4 text-center text-sm font-bold tracking-[0.16em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0756BD]";
const dark = `${btn} bg-[#090909] text-[#F5F3EE] hover:bg-[#0756BD]`;
const line = `${btn} border-2 border-[#090909] text-[#090909] hover:bg-[#090909] hover:text-[#F5F3EE]`;

// Scroll-triggered entrance; shows immediately if IntersectionObserver is missing or motion is reduced.
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

const Meta = ({ i, d }) => (
  <p className="mb-4 flex items-center gap-3 text-xs font-bold tracking-[0.18em]">
    <span className={d ? "text-[#F5F3EE]" : "text-[#0756BD]"}>{SERVICES[i].n}</span>
    <span className={d ? "text-[#D8D8D4]" : "text-[#090909]/70"}>{SERVICES[i].label.toUpperCase()}</span>
  </p>
);
const Title = ({ i, cls = "" }) => (
  <h2 id={`sv${i}`} className={`${T} ${cls}`}>
    {SERVICES[i].name.map((l) => <span key={l} className="block">{l}{" "}</span>)}
  </h2>
);
const Desc = ({ i, d }) => (
  <p className={`mt-5 max-w-[42ch] text-base leading-relaxed md:text-lg ${d ? "text-[#D8D8D4]" : "text-[#090909]/75"}`}>{SERVICES[i].desc}</p>
);

const FRAMES = ["STRATEGY", "STORY", "CAMPAIGN", "FILM", "IMPACT"];
const Sprockets = () => <span className="block h-2 bg-[repeating-linear-gradient(90deg,#F5F3EE_0_10px,transparent_10px_22px)]" />;

export default function Services() {
  const toServices = () =>
    document.getElementById("services-start")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });

  return (
    <>
    <main className="bg-[#F5F3EE] text-[#090909]">
      <style>{CSS}</style>

      {/* HERO */}
      <header className="relative overflow-hidden px-[clamp(1.25rem,5vw,4rem)] pb-14 pt-28 md:pb-20 md:pt-36">
        <span aria-hidden="true" className="absolute -right-[18vw] top-16 h-[70vw] w-[70vw] rounded-full bg-[#D8D8D4] md:-right-[6vw] md:top-10 md:h-[42vw] md:w-[42vw]" />
        <div className="relative grid items-center gap-8 md:grid-cols-12">
          <div className="flex justify-center md:order-last md:col-span-4 md:justify-end">
            <RareObject />
          </div>
          <div className="md:col-span-8">
            <h1 className="break-words text-[clamp(2.1rem,10vw,8.5rem)] font-black uppercase leading-[0.88] tracking-tighter">
              {["WE MAKE", "BRANDS", "IMPOSSIBLE", "TO IGNORE."].map((l) => <span key={l} className="block">{l}{" "}</span>)}
            </h1>
            <p className="mt-6 max-w-[44ch] text-base leading-relaxed md:text-lg">
              We combine strategy, storytelling, PR, and creative production to turn brands into conversations people want to be part of.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={toServices} className={dark}>EXPLORE OUR SERVICES</button>
              <Link to="/contact" className={line}>LET'S COLLABORATE</Link>
            </div>
          </div>
        </div>
      </header>

      {/* FILM STRIP */}
      <div aria-hidden="true" className="overflow-hidden bg-[#090909] py-2">
        <Sprockets />
        <div className="my-2 flex w-max animate-[rr-marq_32s_linear_infinite] motion-reduce:animate-none">
          {[...FRAMES, ...FRAMES].map((t, i) => (
            <div key={i} className={`mx-1.5 grid h-[clamp(4rem,12vw,7rem)] w-[clamp(7rem,22vw,13rem)] shrink-0 place-items-center text-[clamp(0.9rem,2.4vw,1.5rem)] font-black tracking-tight ${i % 2 ? "bg-[#F5F3EE] text-[#090909]" : "bg-[#0756BD] text-[#F5F3EE]"}`}>{t}</div>
          ))}
        </div>
        <Sprockets />
      </div>

      {/* 01 BRAND STRATEGY: giant outlined number */}
      <section id="services-start" aria-labelledby="sv0" className={SEC}>
        <Reveal className="group grid items-end gap-6 md:grid-cols-12">
          <p aria-hidden="true" className="select-none text-[clamp(7rem,34vw,20rem)] font-black leading-[0.75] text-transparent transition-all duration-500 [-webkit-text-stroke:2px_#090909] group-hover:translate-x-3 group-hover:[-webkit-text-stroke-color:#0756BD] md:col-span-5">01</p>
          <div className="md:col-span-7"><Meta i={0} /><Title i={0} /><Desc i={0} /></div>
        </Reveal>
      </section>

      {/* 02 PR: front-page poster */}
      <section aria-labelledby="sv1" className={`${SEC} pt-0 md:pt-0`}>
        <Reveal className="group grid items-center gap-10 md:grid-cols-12">
          <div aria-hidden="true" className="mx-auto w-full max-w-sm -rotate-3 border-2 border-[#090909] bg-[#F5F3EE] p-4 transition-transform duration-500 group-hover:rotate-0 md:col-span-5">
            <p className="border-b-4 border-[#090909] pb-2 text-center text-[clamp(1.4rem,6vw,2.2rem)] font-black tracking-tighter">THE DAILY STORY</p>
            <div className="mt-3 grid grid-cols-3 gap-2"><span className="col-span-2 h-24 bg-[#0756BD]" /><span className="h-24 bg-[#D8D8D4]" /></div>
            {["100%", "92%", "100%", "68%", "85%"].map((w, k) => <span key={k} className="mt-2 block h-1.5 bg-[#090909]/80" style={{ width: w }} />)}
          </div>
          <div className="md:col-span-6 md:col-start-7"><Meta i={1} /><Title i={1} /><Desc i={1} /></div>
        </Reveal>
      </section>

      {/* 03 CAMPAIGNS: full-width black, tilted billboard panels */}
      <section aria-labelledby="sv2" className={`${SEC} bg-[#090909] text-[#F5F3EE]`}>
        <Reveal className="group">
          <div className="md:flex md:items-end md:justify-between md:gap-12">
            <div><Meta i={2} d /><Title i={2} cls="text-[clamp(2rem,11vw,9rem)]" /></div>
            <Desc i={2} d />
          </div>
          <div aria-hidden="true" className="relative mt-12 h-[clamp(11rem,36vw,22rem)]">
            <span className="absolute left-[4%] top-4 h-[80%] w-[34%] -rotate-6 bg-[#0756BD] transition-transform duration-500 group-hover:-rotate-12" />
            <span className="absolute left-[31%] top-0 grid h-[92%] w-[36%] rotate-3 place-items-center bg-[#F5F3EE] text-[clamp(1.5rem,7vw,5rem)] font-black text-[#090909] transition-transform duration-500 group-hover:rotate-0">BIG IDEA</span>
            <span className="absolute right-[4%] top-8 h-[75%] w-[30%] rotate-12 bg-[#D8D8D4] transition-transform duration-500 group-hover:rotate-[18deg]" />
          </div>
        </Reveal>
      </section>

      {/* 04 STORYTELLING: widescreen frame */}
      <section aria-labelledby="sv3" className={`${SEC} bg-[#D8D8D4]`}>
        <Reveal className="group grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-5"><Meta i={3} /><Title i={3} cls="font-serif italic font-semibold" /><Desc i={3} /></div>
          <div aria-hidden="true" className="relative aspect-[2.39/1] bg-[#090909] transition-transform duration-500 group-hover:scale-[1.03] md:col-span-7 md:-mr-12">
            <span className="absolute left-3 top-3 text-[10px] font-bold tracking-widest text-[#D8D8D4]">00:00:12:04</span>
            <span className="absolute inset-0 grid place-items-center font-serif text-[clamp(1.6rem,6vw,4rem)] italic text-[#F5F3EE]">Chapter one.</span>
            <span className="absolute bottom-0 left-0 h-1.5 w-1/3 bg-[#0756BD] transition-all duration-700 group-hover:w-2/3" />
          </div>
        </Reveal>
      </section>

      {/* 05 VIDEO: film strip frames */}
      <section aria-labelledby="sv4" className={`${SEC} bg-[#090909] text-[#F5F3EE]`}>
        <Reveal className="group">
          <Meta i={4} d /><Title i={4} cls="text-[clamp(2rem,11vw,9rem)]" /><Desc i={4} d />
          <div aria-hidden="true" className="mt-12">
            <Sprockets />
            <div className="my-2 grid grid-cols-2 gap-2 md:grid-cols-4">
              {["ROLL", "FRAME", "CUT", "WRAP"].map((w, k) => (
                <div key={w} className={`grid aspect-[4/3] place-items-center text-[clamp(1rem,3vw,2rem)] font-black transition-transform duration-500 group-hover:-translate-y-1 ${["bg-[#0756BD] text-[#F5F3EE]", "bg-[#F5F3EE] text-[#090909]", "bg-[#D8D8D4] text-[#090909]", "border-2 border-[#F5F3EE]"][k]}`}>{w}</div>
              ))}
            </div>
            <Sprockets />
          </div>
        </Reveal>
      </section>

      {/* 06 DIGITAL: ripples */}
      <section aria-labelledby="sv5" className={SEC}>
        <Reveal className="group grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-6"><Meta i={5} /><Title i={5} /><Desc i={5} /></div>
          <div aria-hidden="true" className="relative mx-auto aspect-square w-[min(80vw,26rem)] md:col-span-6">
            {[0, 14, 28, 42].map((p, k) => <span key={p} className="absolute rounded-full border-2 border-[#0756BD] transition-transform duration-700 group-hover:scale-105" style={{ inset: `${p}%`, transitionDelay: `${k * 60}ms` }} />)}
            <span className="absolute inset-[44%] rounded-full bg-[#0756BD]" />
          </div>
        </Reveal>
      </section>

      {/* If your current Services page has an FAQ, paste your existing FAQ component here unchanged. */}

      {/* PROCESS: horizontal on desktop, vertical on mobile */}
      <section aria-labelledby="proc" className={`${SEC} bg-[#D8D8D4]`}>
        <Reveal><h2 id="proc" className={T}>CREATIVE PROCESS</h2></Reveal>
        <ol className="mt-14 md:grid md:grid-cols-4">
          {PROCESS.map((p, i) => (
            <Reveal as="li" key={p.n} delay={i * 150} from="translate-y-8 md:translate-y-0 md:translate-x-10" className="relative border-l-2 border-[#090909] pb-10 pl-6 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pr-6 md:pt-6">
              <span aria-hidden="true" className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-[#0756BD] md:-top-[7px] md:left-0" />
              <p className="text-[clamp(3rem,7vw,5.5rem)] font-black leading-none text-[#0756BD]">{p.n}</p>
              <h3 className="mt-2 text-xl font-black tracking-tight md:text-2xl">{p.name}</h3>
              <p className="mt-2 max-w-[30ch] text-base text-[#090909]/80">{p.desc}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* FINAL CTA */}
      <section aria-labelledby="cta" className={`${SEC} bg-[#0756BD] text-[#F5F3EE]`}>
        <Reveal>
          <h2 id="cta" className="break-words text-[clamp(2rem,9vw,8.5rem)] font-black uppercase leading-[0.9] tracking-tighter">GOT A BIG IDEA? LET'S MAKE IT RARE.</h2>
          <Link to="/contact" className={`${btn} mt-10 bg-[#F5F3EE] text-[#0756BD] hover:bg-[#090909] hover:text-[#F5F3EE] focus-visible:outline-[#F5F3EE]`}>START A PROJECT</Link>
        </Reveal>
      </section>
    </main>
    <Footer />
    </>
  );
}