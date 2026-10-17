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

  const win = window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
    "_blank",
    "noopener,noreferrer"
  );
  if (!win) throw new Error("Your browser blocked the WhatsApp window. Allow pop-ups and try again.");
  return "WhatsApp opened with your message. Press send there to deliver it.";
}

const SERVICES = [
  "Brand Strategy",
  "PR & Media Relations",
  "Creative Campaigns",
  "Storytelling",
  "Video Production",
  "Digital Marketing",
  "Something Else",
];

// Optional for the visitor. Edit freely.
const BUDGETS = [
  "Under ₹1,00,000",
  "₹1,00,000 – ₹3,00,000",
  "₹3,00,000 – ₹10,00,000",
  "₹10,00,000+",
  "Not sure yet",
];

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

/* All motion is CSS only. No WebGL, so there is nothing to fall back from. */
const CSS = `
.rcs-q { container-type: inline-size; }
.rcs-cube { position: relative; width: 100%; height: 100%; transform-style: preserve-3d;
  transform: rotateX(-24deg) rotateY(35deg); animation: rcs-cube 18s linear infinite; }
.rcs-face { position: absolute; inset: 0; backface-visibility: hidden; }
.rcs-f1 { background: #5271FF; transform: translateZ(12cqw); }
.rcs-f2 { background: #3F58D6; transform: rotateY(90deg) translateZ(12cqw); }
.rcs-f3 { background: #2A3C9C; transform: rotateY(180deg) translateZ(12cqw); }
.rcs-f4 { background: #6A86FF; transform: rotateY(-90deg) translateZ(12cqw); }
.rcs-f5 { background: #93A8FF; transform: rotateX(90deg) translateZ(12cqw); }
.rcs-f6 { background: #1B2870; transform: rotateX(-90deg) translateZ(12cqw); }
@keyframes rcs-cube { from { transform: rotateX(-24deg) rotateY(0deg); } to { transform: rotateX(-24deg) rotateY(360deg); } }
.rcs-track { container-type: inline-size; }
.rcs-slide { animation: rcs-slide 9s ease-in-out infinite alternate; }
.rcs-slide-r { animation: rcs-slide 9s ease-in-out infinite alternate-reverse; }
@keyframes rcs-slide { to { transform: translateX(calc(100cqw - 3.5rem)); } }
@media (prefers-reduced-motion: reduce) {
  .rcs-cube { animation: none; }
  .rcs-slide, .rcs-slide-r { animation: none; }
  .rcs-slide-r { transform: translateX(calc(100cqw - 3.5rem)); }
}`;

const outline = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

const inputCls =
  "block w-full rounded-none border border-[#75849B]/70 bg-white/[0.04] px-4 py-3.5 text-base text-white placeholder:text-[#75849B] transition-colors duration-200 hover:border-[#75849B] focus:border-[#5271FF] focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-[#5271FF] aria-[invalid=true]:border-[#FF8A80]";

const btnBlue = `inline-flex min-h-[56px] w-full touch-manipulation items-center justify-between gap-4 bg-[#5271FF] px-7 text-sm font-bold tracking-[.08em] text-white transition-colors duration-300 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit sm:justify-start ${outline}`;

/* The question mark is the idea; its dot is a physical blue cube. */
function IdeaMark() {
  return (
    <div className="rcs-q relative mx-auto aspect-[2/3] w-full" aria-hidden="true">
      <span className="absolute left-[2%] top-[4%] block aspect-square w-[13%] rounded-full bg-[#FAD430]" />
      <svg viewBox="0 0 200 300" className="absolute inset-0 h-full w-full" fill="none">
        <path
          d="M38 92 C38 14 162 14 162 90 C162 142 100 140 100 196"
          stroke="#5271FF"
          strokeWidth="46"
          strokeLinecap="butt"
        />
      </svg>
      <div
        className="absolute left-1/2 top-[85%]"
        style={{ width: "24cqw", height: "24cqw", transform: "translate(-50%,-50%)", perspective: "900px" }}
      >
        <div className="rcs-cube">
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
    <main style={{ fontFamily: font }} className="relative overflow-x-clip bg-black text-white">
      <style>{CSS}</style>

      {/* ================= 1. GOT A BIG IDEA? ================= */}
      <section
        aria-labelledby="idea-hero"
        className="relative isolate overflow-hidden bg-black pb-[max(4rem,env(safe-area-inset-bottom))] pt-36 md:pt-40 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-24"
      >
        {/* one restrained blue glow behind the question mark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_65%_at_80%_45%,rgba(82,113,255,.22),transparent_70%)]"
        />
        {/* anchors the lower-left corner on larger screens */}
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-[18vw] -left-[10vw] -z-10 hidden h-[36vw] w-[36vw] rounded-full bg-[#002366] md:block" />

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
            <p className="mt-6 text-[clamp(0.9rem,2.4vw,1.95rem)] font-bold uppercase leading-[.95] tracking-[-.04em] text-[#5271FF]">
              Let’s make it rare.
            </p>
            <span aria-hidden="true" className="mt-5 block h-1.5 w-14 bg-[#FAD430]" />
            <p className="mt-6 max-w-[40ch] text-base leading-relaxed text-white/85 md:text-lg">
              Big ambitions. Unusual ideas. Interesting challenges.
              <br />
              Tell us what you’re thinking.
            </p>
            <div className="mt-9">
              <a href="#contact-form" onClick={goToForm} className={btnBlue}>
                LET’S START SOMETHING <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          {/* On phones this sits under the copy at a smaller scale */}
          <div className="relative mx-auto w-[min(48vw,240px)] lg:w-[min(30vw,420px)] lg:justify-self-end">
            <IdeaMark />
          </div>
        </div>
      </section>

      {/* ================= 2. MAKE YOUR MOVE ================= */}
      <section id="contact-form" aria-labelledby="form-heading" className="scroll-mt-24 border-t border-white/10 lg:grid lg:grid-cols-2">
        <div className="bg-black px-[max(1.25rem,env(safe-area-inset-left))] py-20 sm:px-10 md:px-16 md:py-28 lg:flex lg:flex-col lg:justify-between">
          <span aria-hidden="true" className="mb-8 block h-1.5 w-16 bg-[#FAD430]" />
          <h2
            id="form-heading"
            className="break-words text-[clamp(1.28rem,3.38vw,3.38rem)] font-bold uppercase leading-[.88] tracking-[-.045em] text-[#5271FF]"
          >
            <span className="block">Every good</span>
            <span className="block">idea starts</span>
            <span className="block">somewhere<span className="text-[#FAD430]">.</span></span>
          </h2>
          <div className="mt-10 lg:mt-16">
            <p className="max-w-[44ch] text-base leading-relaxed text-white/85 md:text-lg">
              Rare Creative Studios welcomes project enquiries and collaborations. Whether you’re launching a brand,
              shaping a story, or exploring a partnership, tell us what you’re working on.
            </p>
            {(EMAIL || SOCIALS.length > 0) && (
              <ul className="mt-6 space-y-1 text-white">
                {EMAIL && (
                  <li>
                    <a href={`mailto:${EMAIL}`} className={`inline-block py-1.5 underline decoration-[#5271FF] underline-offset-4 ${outline}`}>
                      {EMAIL}
                    </a>
                  </li>
                )}
                {SOCIALS.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className={`inline-block py-1.5 underline decoration-[#5271FF] underline-offset-4 ${outline}`}>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t border-[#5271FF]/40 bg-black px-[max(1.25rem,env(safe-area-inset-left))] py-16 sm:px-10 md:px-16 md:py-28 lg:border-l lg:border-t-0">
          <form onSubmit={onSubmit} noValidate aria-label="Contact form" className="mx-auto grid max-w-[640px] gap-7">
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
                  {SERVICES.map((s) => (
                    <option key={s} value={s} className="bg-black">{s}</option>
                  ))}
                </select>
              </Field>
              <Field id="cf-budget" label="Estimated budget" optional>
                <select id="cf-budget" name="budget" value={values.budget} onChange={onChange} className={inputCls}>
                  <option value="" className="bg-black">Select a range</option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b} className="bg-black">{b}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field id="cf-details" label="Project details" error={errors.details}>
              <textarea id="cf-details" name="details" rows={6} required value={values.details} onChange={onChange} aria-invalid={Boolean(errors.details)} aria-describedby={describe("details")} className={`${inputCls} resize-y`} />
            </Field>

            <div className="flex flex-col gap-5">
              <button
                type="submit"
                disabled={status === "submitting"}
                aria-busy={status === "submitting"}
                className={btnBlue}
              >
                {status === "submitting" ? "SENDING…" : "SEND US YOUR IDEA"}
                {status !== "submitting" && <span aria-hidden="true">↗</span>}
              </button>

              <div aria-live="polite" role="status" className="min-h-[1.5rem] text-sm font-medium">
                {status === "success" && <p className="text-[#FAD430]">{message}</p>}
                {status === "error" && <p className="text-[#FF8A80]">{message}</p>}
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ================= 3. LET'S MAKE SOMETHING THAT MATTERS ================= */}
      <section aria-labelledby="matters" className="overflow-hidden border-t border-white/10 bg-black px-[max(1.25rem,env(safe-area-inset-left))] py-24 sm:px-10 md:px-16 md:py-36">
        <div className="mx-auto max-w-[1440px]">
          <h2 id="matters" className="break-words text-[clamp(1.13rem,4.8vw,4.5rem)] font-bold uppercase leading-[.88] tracking-[-.05em] text-white">
            <span className="block">Let’s make</span>
            <span className="block">something</span>
            <span className="block text-[#5271FF]">that matters<span className="text-[#FAD430]">.</span></span>
          </h2>

          {/* purely decorative: sits beside the type, never over it */}
          <div aria-hidden="true" className="rcs-track mt-12 space-y-3 md:mt-16">
            <div className="relative h-14 border-t-2 border-[#5271FF]/50">
              <span className="rcs-slide absolute left-0 top-2 block h-14 w-14 rounded-full bg-[#5271FF]" />
            </div>
            <div className="relative h-8">
              <span className="rcs-slide-r absolute left-0 top-0 block h-8 w-14 rounded-t-full bg-[#FAD430]" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. FINAL CTA ================= */}
      <section aria-labelledby="closing" className="border-t border-white/10 bg-black px-[max(1.25rem,env(safe-area-inset-left))] pb-[max(6rem,env(safe-area-inset-bottom))] pt-24 sm:px-10 md:px-16 md:py-36">
        <div className="mx-auto max-w-[1440px]">
          <h2 id="closing" className="break-words text-[clamp(0.94rem,4.2vw,3.9rem)] font-bold uppercase leading-[.9] tracking-[-.045em]">
            <span className="block">Your idea.</span>
            <span className="block">Our imagination.</span>
            <span className="block text-[#5271FF]">Something rare<span className="text-[#FAD430]">.</span></span>
          </h2>
          <span aria-hidden="true" className="mt-10 block h-1.5 w-20 bg-[#FAD430]" />
          <div className="mt-10">
            <a href="#contact-form" onClick={goToForm} className={btnBlue}>
              START A PROJECT <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}