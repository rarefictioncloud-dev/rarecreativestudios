import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";

/* ------------------------------------------------------------------
   CONFIG (edit without touching the layout)
   - WHATSAPP_NUMBER: used by the default submit handler below.
   - EMAIL / SOCIALS: leave empty until you have real values; nothing is shown if empty.
------------------------------------------------------------------- */
const WHATSAPP_NUMBER = "917997658999"; // +91 7997658999
const EMAIL = "";
const SOCIALS = []; // [{ label: "Instagram", href: "https://..." }]

/* ------------------------------------------------------------------
   FORM SUBMISSION
   >>> REPLACE THIS FUNCTION with a real backend (API / Formspree / EmailJS / Firebase) <<<
   It must throw on failure and resolve with a message only when delivery is confirmed.
   The default opens WhatsApp with the enquiry prefilled. That delivers nothing until
   the visitor presses send there, so the success message says exactly that.
   Never put secret keys in this file.
------------------------------------------------------------------- */
async function submitContact(values) {
  const text = [
    "hi , i would like to enquire about rare creative studios",
    "",
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    values.company ? `Company: ${values.company}` : null,
    `Service: ${values.service}`,
    values.budget ? `Budget: ${values.budget}` : null,
    "",
    values.details,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const win = window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  if (!win) throw new Error("Your browser blocked the WhatsApp window. Allow pop-ups and try again.");
  return "WhatsApp opened with your message. Press send there to deliver it.";
}

const SERVICES = ["Brand Strategy", "PR & Media Relations", "Creative Campaigns", "Storytelling", "Video Production", "Digital Marketing", "Something Else"];
const RING = SERVICES.slice(0, 6); // the rotating 3D ring shows the six core services

// Optional for the visitor. Edit freely.
const BUDGETS = ["Under ₹1,00,000", "₹1,00,000 – ₹3,00,000", "₹3,00,000 – ₹10,00,000", "₹10,00,000+", "Not sure yet"];

const EMPTY = { name: "", email: "", company: "", service: "", budget: "", details: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = "Enter your name.";
  if (!v.email.trim()) e.email = "Enter your email address.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address, like name@company.com.";
  if (!v.service) e.service = "Choose the service you need.";
  if (!v.details.trim()) e.details = "Tell us a little about your project.";
  return e;
}

/* ------------------------------------------------------------------
   DESIGN TOKENS (same palette as the home page)
   ivory #F5F2EA / #f6f3ee   ink #111111   cobalt #0b3fd9
   navy #071C50   light cobalt #245DFF / #6f92ff   grey #c6cbd3
------------------------------------------------------------------- */
const COBALT = "#0b3fd9";

/* ------------------------------------------------------------------
   SCROLL-DRIVEN 3D (all CSS, no WebGL, so no fallback is needed)
   - Global value --p (0..1, whole page) drives the fixed "film-frame tunnel".
   - Every [data-sp] element gets its own --s (0..1: just entering the
     screen -> just leaving it). The cube, the service ring, the floating
     cubes, the frame stack and the tilting form card all read their --s.
   Both values are damped in one requestAnimationFrame loop.
------------------------------------------------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&family=Manrope:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

.lc-root { font-family: 'Manrope', 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; }
.lc-root ::selection { background: ${COBALT}; color: #fff; }
.lc-disp { font-family: 'Bebas Neue', 'Anton', 'Arial Narrow', Impact, sans-serif; font-weight: 400; letter-spacing: -0.005em; line-height: .92; text-transform: uppercase; }
.lc-disp em { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-weight: 700; letter-spacing: -0.055em; text-transform: uppercase; }
.lc-mono { font-family: 'IBM Plex Mono', 'Courier New', monospace; text-transform: uppercase; letter-spacing: .2em; }
.lc-grain { position: absolute; inset: 0; z-index: 30; pointer-events: none; opacity: .07; mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

/* ---- fixed tunnel of frames you fly through as you scroll ---- */
.lc-stage { perspective: 1200px; perspective-origin: 50% 46%; }
.lc-world { position: absolute; inset: 0; transform-style: preserve-3d;
  transform: rotateX(calc(var(--my, 0) * -3deg)) rotateY(calc(var(--mx, 0) * 4deg)); }
.lc-frame { position: absolute; left: 50%; top: 50%; width: min(70vw, 1100px); aspect-ratio: 16 / 9;
  --z: calc(var(--p, 0) * 3600 - var(--i) * 420 - 200);
  transform: translate(-50%, -50%) translateZ(calc(var(--z) * 1px));
  border: 1.5px solid rgba(11,63,217,.45); background: rgba(11,63,217,.025);
  opacity: clamp(0, calc((500 - var(--z)) / 250), 1); will-change: transform, opacity; }
.lc-frame.lc-ink { border-color: rgba(17,17,17,.5); }
@media (max-aspect-ratio: 1/1) { .lc-frame { width: 88vw; aspect-ratio: 3 / 4; } }

/* ---- generic cube: size comes from --sz ---- */
.lc-cubewrap { perspective: 900px; }
.lc-cube { position: relative; width: 100%; height: 100%; transform-style: preserve-3d;
  transform: rotateX(-24deg) rotateY(calc(35deg + var(--s, .5) * 900deg)); }
.lc-face { position: absolute; inset: 0; backface-visibility: hidden; box-shadow: inset 0 0 0 1px rgba(245,242,234,.22); }
.lc-f1 { background: #0b3fd9; transform: translateZ(calc(var(--sz) / 2)); }
.lc-f2 { background: #0a35b8; transform: rotateY(90deg) translateZ(calc(var(--sz) / 2)); }
.lc-f3 { background: #071C50; transform: rotateY(180deg) translateZ(calc(var(--sz) / 2)); }
.lc-f4 { background: #245DFF; transform: rotateY(-90deg) translateZ(calc(var(--sz) / 2)); }
.lc-f5 { background: #6f92ff; transform: rotateX(90deg) translateZ(calc(var(--sz) / 2)); }
.lc-f6 { background: #111111; transform: rotateX(-90deg) translateZ(calc(var(--sz) / 2)); }
.lc-q { container-type: inline-size; }

/* ---- the form card leans back as it enters and forward as it leaves ---- */
.lc-tilt { transform: perspective(1400px) rotateX(calc((.5 - var(--s, .5)) * 14deg)) rotateY(calc((var(--s, .5) - .5) * -7deg));
  transform-origin: 50% 60%; will-change: transform; }

/* ---- rotating service ring ---- */
.lc-ring-wrap { perspective: 1400px; font-size: clamp(1.15rem, 5vw, 3rem); }
.lc-ring { position: relative; width: 12em; height: 3em; margin: 2em auto; transform-style: preserve-3d;
  transform: translateZ(-10.4em) rotateY(calc(var(--s, .5) * -720deg)); }
.lc-ring > span { position: absolute; inset: 0; display: grid; place-items: center; padding: 0 .6em; text-align: center; backface-visibility: hidden;
  transform: rotateY(calc(var(--k) * 60deg)) translateZ(10.4em);
  border: 1px solid rgba(245,242,234,.4); background: rgba(7,28,80,.78);
  font-family: 'Bebas Neue', 'Anton', 'Arial Narrow', Impact, sans-serif; font-weight: 400; text-transform: uppercase; letter-spacing: .02em; line-height: 1; }

/* ---- stack of frames that swings as it scrolls past ---- */
.lc-stack { perspective: 1400px; }
.lc-stack-in { position: relative; width: 100%; height: 100%; transform-style: preserve-3d;
  transform: rotateX(16deg) rotateY(calc(-42deg + var(--s, .5) * 84deg)); }
.lc-stack-in > span { position: absolute; inset: 0; border: 1.5px solid rgba(245,242,234,.65);
  transform: translateZ(calc(var(--n) * -54px + 108px)); }

/* ---- reveal: tilt up from below ---- */
.lc-rv { opacity: 0; transform: perspective(1400px) rotateX(14deg) translateY(56px) translateZ(-80px); transform-origin: 50% 100%;
  transition: opacity .9s ease var(--d, 0ms), transform .9s cubic-bezier(.2,.7,.2,1) var(--d, 0ms); }
.lc-rv.lc-in { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  .lc-rv { opacity: 1; transform: none; transition: none; }
  .lc-tilt { transform: none; }
}`;

const outlineInk = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b3fd9]";
const outlineLight = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

const inputCls =
  "block w-full rounded-none border-0 border-b border-black/40 bg-transparent px-0 py-3 text-base text-[#111] placeholder:text-black/40 transition-colors duration-200 hover:border-black/70 focus:border-b-2 focus:border-[#0b3fd9] focus:bg-[#0b3fd9]/[0.04] focus:outline-none focus:ring-0 aria-[invalid=true]:border-b-2 aria-[invalid=true]:border-[#b3261e]";

const btnCobalt = `group inline-flex min-h-14 w-full touch-manipulation items-center justify-between gap-4 bg-[#0b3fd9] px-7 text-[12px] font-bold uppercase tracking-[0.16em] text-[#F5F2EA] transition-colors duration-300 hover:bg-[#071C50] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit sm:justify-start ${outlineInk}`;
const btnIvory = `group inline-flex min-h-14 w-full touch-manipulation items-center justify-between gap-4 bg-[#F5F2EA] px-7 text-[12px] font-bold uppercase tracking-[0.16em] text-[#071C50] transition-colors duration-300 hover:bg-white sm:w-fit sm:justify-start ${outlineLight}`;
const arrow = "transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5";

/* A cube whose rotation follows the scroll position of its wrapper (needs data-sp). */
function Cube({ size }) {
  return (
    <div className="lc-cubewrap" style={{ width: size, height: size, "--sz": size }}>
      <div className="lc-cube">
        <span className="lc-face lc-f1" />
        <span className="lc-face lc-f2" />
        <span className="lc-face lc-f3" />
        <span className="lc-face lc-f4" />
        <span className="lc-face lc-f5" />
        <span className="lc-face lc-f6" />
      </div>
    </div>
  );
}

/* The question mark is the idea; its dot is a physical cube that turns as you scroll. */
function IdeaMark() {
  return (
    <div data-sp className="lc-q relative mx-auto aspect-[2/3] w-full" aria-hidden="true">
      <span className="absolute left-[2%] top-[4%] block aspect-square w-[13%] rounded-full bg-[#111]" />
      <svg viewBox="0 0 200 300" className="absolute inset-0 h-full w-full" fill="none">
        <path d="M38 92 C38 14 162 14 162 90 C162 142 100 140 100 196" stroke={COBALT} strokeWidth="46" strokeLinecap="butt" />
      </svg>
      <div className="absolute left-1/2 top-[85%]" style={{ width: "24cqw", height: "24cqw", transform: "translate(-50%,-50%)" }}>
        <Cube size="24cqw" />
      </div>
    </div>
  );
}

function Field({ id, label, error, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className="lc-mono mb-1 block text-[10px] font-medium text-black/75">
        {label}
        {optional && <span className="text-black/50"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectWrap({ children }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown aria-hidden="true" size={18} strokeWidth={1.4} className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-black/60" />
    </div>
  );
}

export default function LetsConnect() {
  const rootRef = useRef(null);
  const [reduced, setReduced] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [message, setMessage] = useState("");
  const submitting = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  /* One loop drives everything: --p on the stage, --s on every [data-sp] element. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stage = root.querySelector("[data-stage]");
    const nodes = [...root.querySelectorAll("[data-sp]")].map((el) => ({ el, cur: 0.5, tgt: 0.5 }));
    const g = { cur: 0, tgt: 0 };
    const clamp = (n) => Math.min(1, Math.max(0, n));

    if (reduced) {
      stage?.style.setProperty("--p", "0.2"); // polished static composition
      nodes.forEach((n) => n.el.style.setProperty("--s", "0.5"));
      return;
    }

    const measure = () => {
      const vh = window.innerHeight;
      const r = root.getBoundingClientRect();
      const span = r.height - vh;
      g.tgt = span > 0 ? clamp(-r.top / span) : 0;
      nodes.forEach((n) => {
        const b = n.el.getBoundingClientRect();
        n.tgt = clamp((vh - b.top) / (vh + b.height));
      });
    };
    const paint = () => {
      stage?.style.setProperty("--p", g.cur.toFixed(4));
      nodes.forEach((n) => n.el.style.setProperty("--s", n.cur.toFixed(4)));
    };
    let raf = 0;
    const tick = () => {
      let busy = false;
      const ease = (o) => {
        o.cur += (o.tgt - o.cur) * 0.1;
        if (Math.abs(o.tgt - o.cur) < 0.0005) o.cur = o.tgt;
        else busy = true;
      };
      ease(g);
      nodes.forEach(ease);
      paint();
      raf = busy ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // start exactly where the page is (no spin-in on load)
    measure();
    g.cur = g.tgt;
    nodes.forEach((n) => { n.cur = n.tgt; });
    paint();

    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e) => {
      stage?.style.setProperty("--mx", (e.clientX / window.innerWidth - 0.5).toFixed(3));
      stage?.style.setProperty("--my", (e.clientY / window.innerHeight - 0.5).toFixed(3));
    };
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  /* Tilt-in reveal */
  useEffect(() => {
    const items = rootRef.current?.querySelectorAll(".lc-rv") ?? [];
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach((i) => i.classList.add("lc-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("lc-in"); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" }
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, [reduced]);

  const goToForm = (e) => {
    e.preventDefault();
    document.getElementById("contact-form")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("cf-name")?.focus({ preventScroll: true }), reduced ? 0 : 700);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    if (status === "success" || status === "error") setStatus("idle");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    const found = validate(values);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`cf-${first}`)?.focus();
      return;
    }
    submitting.current = true;
    setStatus("submitting");
    setMessage("");
    try {
      const msg = await submitContact(values);
      setMessage(msg || "Thank you. We’ll be in touch.");
      setStatus("success");
      setValues(EMPTY);
    } catch (err) {
      setMessage(err?.message || "Something went wrong. Please try again.");
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  };

  const describe = (k) => (errors[k] ? `cf-${k}-error` : undefined);

  return (
    /* clip-path keeps the FIXED 3D stage inside <main>, so a footer below is never painted over */
    <main ref={rootRef} className="lc-root relative isolate overflow-x-clip bg-[#F5F2EA] text-[#111111] [clip-path:inset(0)]">
      <style>{CSS}</style>
      <span aria-hidden="true" className="lc-grain" />

      {/* ============ SCROLL-DRIVEN 3D STAGE: fly through a tunnel of film frames ============ */}
      <div data-stage className="lc-stage pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_60%_at_50%_46%,rgba(255,255,255,.7),rgba(239,235,227,0)_75%)]" />
        <div className="lc-world">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={`lc-frame ${i % 4 === 0 ? "lc-ink" : ""}`} style={{ "--i": i }} />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {/* ================= 1. GOT A BIG IDEA? (one full screen) ================= */}
        <section
          aria-labelledby="idea-hero"
          className="relative flex min-h-[100svh] items-center pb-[max(4rem,env(safe-area-inset-bottom))] pt-32 md:pt-36 lg:pb-20"
        >
          <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-[max(1.25rem,env(safe-area-inset-left))] sm:px-10 md:px-16 lg:grid-cols-[1.35fr_.65fr] lg:items-center lg:gap-6">
            <div className="relative z-10">
              <p className="lc-mono flex items-center gap-3 text-[11px] text-black/75">
                <span aria-hidden="true" className="block h-2.5 w-2.5 rounded-full bg-[#0b3fd9]" />
                Let’s connect
              </p>
              <h1 id="idea-hero" className="lc-disp mt-5 break-words text-black">
                <span className="block text-[clamp(3.6rem,17vw,10.5rem)]">Got a big</span>
                <span className="block text-[clamp(3.6rem,17vw,10.5rem)]">idea<em style={{ color: COBALT }}>?</em></span>
              </h1>
              <p className="lc-disp mt-4 text-[clamp(2rem,8vw,4.6rem)] text-black sm:mt-6">
                Let’s make it <em style={{ color: COBALT }}>rare.</em>
              </p>
              <span aria-hidden="true" className="mt-7 block h-px w-14 bg-black/60" />
              <p className="mt-6 max-w-[40ch] text-[15px] leading-relaxed text-black/80 sm:text-base md:text-lg">
                Big ambitions. Unusual ideas. Interesting challenges.
                <br />
                Tell us what you’re thinking.
              </p>
              <div className="mt-9">
                <a href="#contact-form" onClick={goToForm} className={btnCobalt}>
                  Let’s start something
                  <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" className={arrow} />
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-[min(48vw,240px)] lg:w-[min(28vw,400px)] lg:justify-self-end">
              <IdeaMark />
            </div>
          </div>
        </section>

        {/* ================= 2. MAKE YOUR MOVE ================= */}
        <section id="contact-form" aria-labelledby="form-heading" className="scroll-mt-4 px-[max(1.25rem,env(safe-area-inset-left))] py-20 sm:px-10 md:px-16 md:py-32">
          <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
            <div className="lc-rv lg:flex lg:flex-col lg:justify-between lg:py-4">
              <div>
                <p className="lc-mono text-[11px] text-black/75">01 / Make your move</p>
                <h2 id="form-heading" className="lc-disp mt-5 text-[clamp(3rem,11vw,6.6rem)] text-black">
                  Every good idea starts <em style={{ color: COBALT }}>somewhere.</em>
                </h2>
              </div>
              <div className="mt-10 lg:mt-16">
                <p className="max-w-[44ch] text-[15px] leading-relaxed text-black/80 sm:text-base md:text-lg">
                  Rare Creative Studios welcomes project enquiries and collaborations. Whether you’re launching a brand, shaping a story, or exploring a partnership, tell us what you’re working on.
                </p>
                {(EMAIL || SOCIALS.length > 0) && (
                  <ul className="mt-6 space-y-1">
                    {EMAIL && (
                      <li>
                        <a href={`mailto:${EMAIL}`} className={`inline-block py-1.5 underline decoration-[#0b3fd9] underline-offset-4 ${outlineInk}`}>{EMAIL}</a>
                      </li>
                    )}
                    {SOCIALS.map((s) => (
                      <li key={s.href}>
                        <a href={s.href} target="_blank" rel="noopener noreferrer" className={`inline-block py-1.5 underline decoration-[#0b3fd9] underline-offset-4 ${outlineInk}`}>{s.label}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* wrapper measures scroll (data-sp); the card inside leans in 3D */}
            <div data-sp>
              <div className="lc-rv">
                <div className="lc-tilt relative border border-black/10 bg-[#fbf9f4] px-5 py-10 shadow-[0_40px_80px_-40px_rgba(7,28,80,.45)] sm:px-10 md:px-12 md:py-14">
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0b3fd9] via-[#245DFF] to-[#071C50]" />
                  <p aria-hidden="true" className="lc-mono mb-8 text-[10px] text-black/55">Project enquiry</p>
                  <form onSubmit={onSubmit} noValidate aria-label="Contact form" className="grid gap-7">
                    <div className="grid gap-7 md:grid-cols-2">
                      <Field id="cf-name" label="Name" error={errors.name}>
                        <input id="cf-name" name="name" type="text" autoComplete="name" required value={values.name} onChange={onChange} aria-invalid={Boolean(errors.name)} aria-describedby={describe("name")} className={inputCls} />
                      </Field>
                      <Field id="cf-email" label="Email" error={errors.email}>
                        <input id="cf-email" name="email" type="email" inputMode="email" autoComplete="email" required value={values.email} onChange={onChange} aria-invalid={Boolean(errors.email)} aria-describedby={describe("email")} className={inputCls} />
                      </Field>
                    </div>

                    <Field id="cf-company" label="Company / Brand" optional>
                      <input id="cf-company" name="company" type="text" autoComplete="organization" value={values.company} onChange={onChange} className={inputCls} />
                    </Field>

                    <div className="grid gap-7 md:grid-cols-2">
                      <Field id="cf-service" label="Service required" error={errors.service}>
                        <SelectWrap>
                          <select id="cf-service" name="service" required value={values.service} onChange={onChange} aria-invalid={Boolean(errors.service)} aria-describedby={describe("service")} className={`${inputCls} appearance-none pr-7`}>
                            <option value="">Select a service</option>
                            {SERVICES.map((s) => (<option key={s} value={s}>{s}</option>))}
                          </select>
                        </SelectWrap>
                      </Field>
                      <Field id="cf-budget" label="Estimated budget" optional>
                        <SelectWrap>
                          <select id="cf-budget" name="budget" value={values.budget} onChange={onChange} className={`${inputCls} appearance-none pr-7`}>
                            <option value="">Select a range</option>
                            {BUDGETS.map((b) => (<option key={b} value={b}>{b}</option>))}
                          </select>
                        </SelectWrap>
                      </Field>
                    </div>

                    <Field id="cf-details" label="Project details" error={errors.details}>
                      <textarea id="cf-details" name="details" rows={5} required value={values.details} onChange={onChange} aria-invalid={Boolean(errors.details)} aria-describedby={describe("details")} className={`${inputCls} resize-y`} />
                    </Field>

                    <div className="flex flex-col gap-5">
                      <button type="submit" disabled={status === "submitting"} aria-busy={status === "submitting"} className={btnCobalt}>
                        {status === "submitting" ? "Sending…" : "Send us your idea"}
                        {status !== "submitting" && <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" className={arrow} />}
                      </button>
                      <div aria-live="polite" role="status" className="min-h-[1.5rem] text-sm font-medium">
                        {status === "success" && <p className="text-[#0b3fd9]">{message}</p>}
                        {status === "error" && <p className="text-[#b3261e]">{message}</p>}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. LET'S MAKE SOMETHING THAT MATTERS (3D service ring) ================= */}
        <section aria-labelledby="matters" className="relative overflow-hidden bg-[#071C50] px-[max(1.25rem,env(safe-area-inset-left))] py-24 text-[#F5F2EA] sm:px-10 md:px-16 md:py-36">
          {/* two cubes that spin with the scroll */}
          <div data-sp aria-hidden="true" className="pointer-events-none absolute right-[7%] top-[10%] hidden sm:block">
            <Cube size="clamp(70px, 9vw, 130px)" />
          </div>
          <div data-sp aria-hidden="true" className="pointer-events-none absolute bottom-[8%] left-[5%] hidden sm:block">
            <Cube size="clamp(44px, 5vw, 76px)" />
          </div>

          <div className="relative mx-auto max-w-[1440px]">
            <p className="lc-mono text-[11px] text-[#F5F2EA]/70">02 / What we make</p>
            <h2 id="matters" className="lc-rv lc-disp mt-5 break-words text-[clamp(3rem,12vw,8rem)]">
              Let’s make something <em className="text-[#6f92ff]">that matters.</em>
            </h2>

            <ul className="sr-only">{RING.map((s) => (<li key={s}>{s}</li>))}</ul>
            <div data-sp aria-hidden="true" className="lc-ring-wrap mt-14 md:mt-20">
              <div className="lc-ring">
                {RING.map((s, k) => (
                  <span key={s} style={{ "--k": k, color: k % 3 === 2 ? "#6f92ff" : "#F5F2EA" }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= 4. FINAL CTA ================= */}
        <section aria-labelledby="closing" className="relative isolate overflow-hidden bg-[#0b3fd9] px-[max(1.25rem,env(safe-area-inset-left))] pb-[max(6rem,env(safe-area-inset-bottom))] pt-24 text-[#F5F2EA] sm:px-10 md:px-16 md:pb-36 md:pt-32">
          {/* frame stack that swings as you scroll past */}
          <div data-sp aria-hidden="true" className="lc-stack pointer-events-none absolute -right-[14%] top-1/2 -z-10 aspect-[4/3] w-[72vw] max-w-[560px] -translate-y-1/2 opacity-60 sm:right-[4%] sm:opacity-90 lg:right-[8%]">
            <div className="lc-stack-in">
              {[0, 1, 2, 3].map((n) => (
                <span key={n} style={{ "--n": n, background: `rgba(245,242,234,${0.03 + n * 0.015})` }} />
              ))}
            </div>
          </div>

          <div className="lc-rv mx-auto max-w-[1440px]">
            <p className="lc-mono text-[11px] text-[#F5F2EA]/75">03 / Start</p>
            <h2 id="closing" className="lc-disp mt-5 break-words text-[clamp(3.1rem,13vw,8.4rem)]">
              Your idea.<br />Our imagination.<br />Something <em>rare.</em>
            </h2>
            <span aria-hidden="true" className="mt-9 block h-px w-16 bg-[#F5F2EA]/70" />
            <div className="mt-9">
              <a href="#contact-form" onClick={goToForm} className={btnIvory}>
                Start a project
                <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" className={arrow} />
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}