import { useEffect, useRef, useState } from "react";

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

const font = '"Helvetica Now Display","Helvetica Now Text","Helvetica Neue",Helvetica,Arial,sans-serif';

/* All 3D is CSS: a fixed "film-frame tunnel" you fly through, a rotating service ring and a cube,
   all driven by one damped scroll value (--p, 0..1). No WebGL, so no fallback is needed. */
const CSS = `
.rcs-stage { perspective: 1200px; perspective-origin: 50% 46%; }
.rcs-world { position: absolute; inset: 0; transform-style: preserve-3d;
  transform: rotateX(calc(var(--my, 0) * -3deg)) rotateY(calc(var(--mx, 0) * 4deg)); }
.rcs-frame { position: absolute; left: 50%; top: 50%; width: min(70vw, 1100px); aspect-ratio: 16 / 9;
  --z: calc(var(--p, 0) * 3600 - var(--i) * 420 - 200);
  transform: translate(-50%, -50%) translateZ(calc(var(--z) * 1px));
  border: 2px solid rgba(82,113,255,.6); background: rgba(0,35,102,.07);
  opacity: clamp(0, calc((500 - var(--z)) / 250), 1); will-change: transform, opacity; }
.rcs-frame.rcs-y { border-color: rgba(250,212,48,.85); }
@media (max-aspect-ratio: 1/1) { .rcs-frame { width: 88vw; aspect-ratio: 3 / 4; } }

.rcs-q { container-type: inline-size; }
.rcs-cube { position: relative; width: 100%; height: 100%; transform-style: preserve-3d;
  transform: rotateX(-24deg) rotateY(calc(35deg + var(--p, 0) * 1080deg)); }
.rcs-face { position: absolute; inset: 0; backface-visibility: hidden; }
.rcs-f1 { background: #5271FF; transform: translateZ(12cqw); }
.rcs-f2 { background: #3F58D6; transform: rotateY(90deg) translateZ(12cqw); }
.rcs-f3 { background: #2A3C9C; transform: rotateY(180deg) translateZ(12cqw); }
.rcs-f4 { background: #6A86FF; transform: rotateY(-90deg) translateZ(12cqw); }
.rcs-f5 { background: #93A8FF; transform: rotateX(90deg) translateZ(12cqw); }
.rcs-f6 { background: #1B2870; transform: rotateX(-90deg) translateZ(12cqw); }

.rcs-ring-wrap { perspective: 1400px; font-size: clamp(.85rem, 3.4vw, 2.4rem); }
.rcs-ring { position: relative; width: 12em; height: 4em; margin: 2em auto; transform-style: preserve-3d;
  transform: translateZ(-10.4em) rotateY(calc(var(--p, 0) * -720deg)); }
.rcs-ring > span { position: absolute; inset: 0; display: grid; place-items: center; padding: 0 .6em; text-align: center;
  backface-visibility: hidden; transform: rotateY(calc(var(--k) * 60deg)) translateZ(10.4em);
  border: 1px solid rgba(82,113,255,.7); background: rgba(0,0,0,.82); font-weight: 700; text-transform: uppercase;
  letter-spacing: -.03em; line-height: 1; }

.rcs-rv { opacity: 0; transform: perspective(1400px) rotateX(14deg) translateY(56px) translateZ(-80px); transform-origin: 50% 100%;
  transition: opacity .9s ease, transform .9s cubic-bezier(.2,.7,.2,1); }
.rcs-rv.rcs-in { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  .rcs-rv { opacity: 1; transform: none; transition: none; }
}`;

const outline = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

const inputCls =
  "block w-full rounded-none border border-[#75849B]/70 bg-white/[0.04] px-4 py-3.5 text-base text-white placeholder:text-[#75849B] transition-colors duration-200 hover:border-[#75849B] focus:border-[#5271FF] focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-[#5271FF] aria-[invalid=true]:border-[#FF8A80]";

const btnBlue = `group inline-flex min-h-[56px] w-full touch-manipulation items-center justify-between gap-4 bg-[#5271FF] px-7 text-sm font-bold tracking-[.08em] text-white transition-colors duration-300 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit sm:justify-start ${outline}`;
const arrow = "inline-block transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5";

/* The question mark is the idea; its dot is a physical blue cube that turns as you scroll. */
function IdeaMark() {
  return (
    <div className="rcs-q relative mx-auto aspect-[2/3] w-full" aria-hidden="true">
      <span className="absolute left-[2%] top-[4%] block aspect-square w-[13%] rounded-full bg-[#FAD430]" />
      <svg viewBox="0 0 200 300" className="absolute inset-0 h-full w-full" fill="none">
        <path d="M38 92 C38 14 162 14 162 90 C162 142 100 140 100 196" stroke="#5271FF" strokeWidth="46" strokeLinecap="butt" />
      </svg>
      <div className="absolute left-1/2 top-[85%]" style={{ width: "24cqw", height: "24cqw", transform: "translate(-50%,-50%)", perspective: "900px" }}>
        <div className="rcs-cube" data-p>
          <span className="rcs-face rcs-f1" />
          <span className="rcs-face rcs-f2" />
          <span className="rcs-face rcs-f3" />
          <span className="rcs-face rcs-f4" />
          <span className="rcs-face rcs-f5" />
          <span className="rcs-face rcs-f6" />
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, error, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-white">
        {label}
        {optional && <span className="font-normal text-white/60"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-[#FF8A80]">
          {error}
        </p>
      )}
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

  /* One damped scroll value drives every 3D element (writes --p only on [data-p] nodes). */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = [...root.querySelectorAll("[data-p]")];
    const apply = (p) => els.forEach((el) => el.style.setProperty("--p", p.toFixed(4)));
    if (reduced) { apply(0.2); return; } // polished static composition
    let cur = 0, tgt = 0, raf = 0;
    const read = () => {
      const max = root.offsetHeight - window.innerHeight;
      tgt = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    const tick = () => {
      cur += (tgt - cur) * 0.1;
      if (Math.abs(tgt - cur) < 0.0004) { cur = tgt; raf = 0; } else raf = requestAnimationFrame(tick);
      apply(cur);
    };
    const kick = () => { read(); if (!raf) raf = requestAnimationFrame(tick); };
    const stage = root.querySelector("[data-stage]");
    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e) => {
      stage?.style.setProperty("--mx", (e.clientX / window.innerWidth - 0.5).toFixed(3));
      stage?.style.setProperty("--my", (e.clientY / window.innerHeight - 0.5).toFixed(3));
    };
    kick();
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
    const items = rootRef.current?.querySelectorAll(".rcs-rv") ?? [];
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach((i) => i.classList.add("rcs-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("rcs-in"); io.unobserve(e.target); } }),
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
    <main ref={rootRef} style={{ fontFamily: font }} className="relative isolate overflow-x-clip bg-black text-white [clip-path:inset(0)]">
      <style>{CSS}</style>

      {/* ============ SCROLL-DRIVEN 3D STAGE: fly through a tunnel of film frames ============ */}
      <div data-stage data-p className="rcs-stage pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_46%,rgba(0,35,102,.55),transparent_75%)]" />
        <div className="rcs-world">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={`rcs-frame ${i % 4 === 0 ? "rcs-y" : ""}`} style={{ "--i": i }} />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {/* ================= 1. GOT A BIG IDEA? ================= */}
        <section
          aria-labelledby="idea-hero"
          className="relative isolate overflow-hidden pb-[max(4rem,env(safe-area-inset-bottom))] pt-36 md:pt-40 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-24"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/20 to-black/60 lg:bg-gradient-to-r lg:from-black/75 lg:via-black/25 lg:to-transparent" />
          <div className="relative mx-auto grid w-full max-w-[1440px] gap-10 px-[max(1.25rem,env(safe-area-inset-left))] sm:px-10 md:px-16 lg:grid-cols-[1.3fr_.7fr] lg:items-center lg:gap-6">
            <div className="relative z-10">
              <p className="mb-6 flex items-center gap-3 text-sm font-bold tracking-[.14em] text-white">
                <span aria-hidden="true" className="block h-2.5 w-2.5 rounded-full bg-[#FAD430]" />
                LET’S CONNECT
              </p>
              <h1 id="idea-hero" className="break-words text-[clamp(1.58rem,5.55vw,5.1rem)] font-bold uppercase leading-[.86] tracking-[-.05em]">
                <span className="block">Got a big</span>
                <span className="block">idea?</span>
              </h1>
              <p className="mt-6 text-[clamp(0.9rem,2.4vw,1.95rem)] font-bold uppercase leading-[.95] tracking-[-.04em] text-[#5271FF]">Let’s make it rare.</p>
              <span aria-hidden="true" className="mt-5 block h-1.5 w-14 bg-[#FAD430]" />
              <p className="mt-6 max-w-[40ch] text-base leading-relaxed text-white/85 md:text-lg">
                Big ambitions. Unusual ideas. Interesting challenges.
                <br />
                Tell us what you’re thinking.
              </p>
              <div className="mt-9">
                <a href="#contact-form" onClick={goToForm} className={btnBlue}>
                  LET’S START SOMETHING <span aria-hidden="true" className={arrow}>↗</span>
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-[min(48vw,240px)] lg:w-[min(30vw,420px)] lg:justify-self-end">
              <IdeaMark />
            </div>
          </div>
        </section>

        {/* ================= 2. MAKE YOUR MOVE ================= */}
        <section id="contact-form" aria-labelledby="form-heading" className="scroll-mt-24 px-[max(1.25rem,env(safe-area-inset-left))] py-16 sm:px-10 md:px-16 md:py-28">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
            <div className="rcs-rv lg:flex lg:flex-col lg:justify-between lg:py-4">
              <div>
                <span aria-hidden="true" className="mb-8 block h-1.5 w-16 bg-[#FAD430]" />
                <h2 id="form-heading" className="break-words text-[clamp(1.28rem,3.38vw,3.38rem)] font-bold uppercase leading-[.88] tracking-[-.045em] text-[#5271FF]">
                  <span className="block">Every good</span>
                  <span className="block">idea starts</span>
                  <span className="block">somewhere<span className="text-[#FAD430]">.</span></span>
                </h2>
              </div>
              <div className="mt-10 lg:mt-16">
                <p className="max-w-[44ch] text-base leading-relaxed text-white/85 md:text-lg">
                  Rare Creative Studios welcomes project enquiries and collaborations. Whether you’re launching a brand, shaping a story, or exploring a partnership, tell us what you’re working on.
                </p>
                {(EMAIL || SOCIALS.length > 0) && (
                  <ul className="mt-6 space-y-1 text-white">
                    {EMAIL && (
                      <li>
                        <a href={`mailto:${EMAIL}`} className={`inline-block py-1.5 underline decoration-[#5271FF] underline-offset-4 ${outline}`}>{EMAIL}</a>
                      </li>
                    )}
                    {SOCIALS.map((s) => (
                      <li key={s.href}>
                        <a href={s.href} target="_blank" rel="noopener noreferrer" className={`inline-block py-1.5 underline decoration-[#5271FF] underline-offset-4 ${outline}`}>{s.label}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="rcs-rv relative border border-[#5271FF]/40 bg-black px-5 py-12 shadow-[0_0_90px_rgba(82,113,255,.18)] sm:px-10 md:px-12 md:py-14">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#5271FF] via-[#5271FF] to-[#FAD430]" />
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
                    <select id="cf-service" name="service" required value={values.service} onChange={onChange} aria-invalid={Boolean(errors.service)} aria-describedby={describe("service")} className={inputCls}>
                      <option value="" className="bg-black">Select a service</option>
                      {SERVICES.map((s) => (<option key={s} value={s} className="bg-black">{s}</option>))}
                    </select>
                  </Field>
                  <Field id="cf-budget" label="Estimated budget" optional>
                    <select id="cf-budget" name="budget" value={values.budget} onChange={onChange} className={inputCls}>
                      <option value="" className="bg-black">Select a range</option>
                      {BUDGETS.map((b) => (<option key={b} value={b} className="bg-black">{b}</option>))}
                    </select>
                  </Field>
                </div>

                <Field id="cf-details" label="Project details" error={errors.details}>
                  <textarea id="cf-details" name="details" rows={6} required value={values.details} onChange={onChange} aria-invalid={Boolean(errors.details)} aria-describedby={describe("details")} className={`${inputCls} resize-y`} />
                </Field>

                <div className="flex flex-col gap-5">
                  <button type="submit" disabled={status === "submitting"} aria-busy={status === "submitting"} className={btnBlue}>
                    {status === "submitting" ? "SENDING…" : "SEND US YOUR IDEA"}
                    {status !== "submitting" && <span aria-hidden="true" className={arrow}>↗</span>}
                  </button>
                  <div aria-live="polite" role="status" className="min-h-[1.5rem] text-sm font-medium">
                    {status === "success" && <p className="text-[#FAD430]">{message}</p>}
                    {status === "error" && <p className="text-[#FF8A80]">{message}</p>}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* ================= 3. LET'S MAKE SOMETHING THAT MATTERS (3D service ring) ================= */}
        <section aria-labelledby="matters" className="overflow-hidden px-[max(1.25rem,env(safe-area-inset-left))] py-24 sm:px-10 md:px-16 md:py-36">
          <div className="mx-auto max-w-[1440px]">
            <h2 id="matters" className="rcs-rv break-words text-[clamp(1.13rem,4.8vw,4.5rem)] font-bold uppercase leading-[.88] tracking-[-.05em] text-white">
              <span className="block">Let’s make</span>
              <span className="block">something</span>
              <span className="block text-[#5271FF]">that matters<span className="text-[#FAD430]">.</span></span>
            </h2>

            <ul className="sr-only">{RING.map((s) => (<li key={s}>{s}</li>))}</ul>
            <div aria-hidden="true" className="rcs-ring-wrap mt-14 md:mt-20">
              <div className="rcs-ring" data-p>
                {RING.map((s, k) => (
                  <span key={s} style={{ "--k": k, color: k % 3 === 2 ? "#FAD430" : "#fff" }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= 4. FINAL CTA ================= */}
        <section aria-labelledby="closing" className="px-[max(1.25rem,env(safe-area-inset-left))] pb-[max(6rem,env(safe-area-inset-bottom))] pt-24 sm:px-10 md:px-16 md:pb-36 md:pt-28">
          <div className="rcs-rv mx-auto max-w-[1440px]">
            <h2 id="closing" className="break-words text-[clamp(0.94rem,4.2vw,3.9rem)] font-bold uppercase leading-[.9] tracking-[-.045em]">
              <span className="block">Your idea.</span>
              <span className="block">Our imagination.</span>
              <span className="block text-[#5271FF]">Something rare<span className="text-[#FAD430]">.</span></span>
            </h2>
            <span aria-hidden="true" className="mt-10 block h-1.5 w-20 bg-[#FAD430]" />
            <div className="mt-10">
              <a href="#contact-form" onClick={goToForm} className={btnBlue}>
                START A PROJECT <span aria-hidden="true" className={arrow}>↗</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}