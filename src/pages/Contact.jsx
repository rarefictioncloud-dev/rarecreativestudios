import { lazy, Suspense, useEffect, useRef, useState } from "react";
import PortalFallback from "../components/hero/Portalfallback";

// Three.js loads on demand; the form and copy never wait for it.
const PortalWorld = lazy(() => import("../components/hero/Portalworld"));

const WHATSAPP_NUMBER = "917997658999"; // +91 7997658999, used by the default submit handler

/* ------------------------------------------------------------------
   FORM SUBMISSION
   >>> REPLACE THIS FUNCTION with your existing submission logic <<<
   (API / Formspree / EmailJS / Firebase etc.). It must throw on
   failure and resolve with a success message only when the backend
   confirms. Until then it opens WhatsApp with the enquiry prefilled,
   which delivers nothing until the visitor presses send there.
------------------------------------------------------------------- */
async function submitContact(values) {
  const text = [
    "hi , i would like to enquire about rare creative studios",
    "",
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    values.company ? `Company: ${values.company}` : null,
    values.topic ? `Topic: ${values.topic}` : null,
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

const TOPICS = [
  "Brand positioning",
  "Media strategy & PR",
  "Story development",
  "Campaign execution",
  "Digital amplification",
  "Film & creative production",
  "Something else",
];

const STEPS = ["Tell us what you’re building.", "We listen, then shape the strategy.", "Together, we make the next move."];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = "Enter your full name.";
  if (!v.email.trim()) e.email = "Enter your work email.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address, like name@company.com.";
  if (!v.details.trim()) e.details = "Tell us a little about what you have in mind.";
  return e;
}

const inputCls =
  "block w-full border-0 border-b border-black/30 bg-transparent px-0 py-3 text-base text-[#07080B] placeholder:text-black/40 outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#B28F4A] focus:shadow-[0_1px_0_0_#B28F4A]";

function Field({ id, label, error, optional, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[#07080B]">
        {label}
        {optional && <span className="font-normal text-black/50"> (optional)</span>}
      </label>
      <div className={`mt-1 ${error ? "[&_*]:border-[#b3261e]" : ""}`}>{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Contact() {
  const rootRef = useRef(null);
  const [webgl, setWebgl] = useState(false);
  const [reduced, setReduced] = useState(false);

  const [values, setValues] = useState({ name: "", email: "", company: "", topic: "", details: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [message, setMessage] = useState("");
  const submitting = useRef(false); // blocks duplicate submits

  /* WebGL support, reduced motion, data saver */
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

  /* Reveal on enter */
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

  const goToForm = (e) => {
    e.preventDefault();
    document.getElementById("contact-form")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("cf-name")?.focus({ preventScroll: true }), reduced ? 0 : 700);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
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
      setValues({ name: "", email: "", company: "", topic: "", details: "" });
    } catch (err) {
      setMessage(err?.message || "Something went wrong. Please try again.");
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  };

  const ctaCls =
    "inline-flex min-h-[56px] w-full items-center justify-between gap-5 rounded-full bg-[#C6A66B] px-7 text-xs font-bold uppercase tracking-[.14em] text-[#07080B] shadow-[0_10px_40px_rgba(198,166,107,.25)] transition hover:bg-[#DDC89D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#DDC89D] sm:w-fit sm:justify-start";

  return (
    /* clip-path keeps the FIXED 3D layer inside <main>, so the footer below is never painted over */
    <main ref={rootRef} className="relative isolate overflow-x-clip bg-[#07080B] text-[#F5F5F2] [clip-path:inset(0)]">
      <style>{`
        .rcs-reveal { opacity: 0; transform: translateY(22px);
          transition: opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1); }
        .rcs-reveal.rcs-in { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) {
          .rcs-reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

      {/* ============ SHARED 3D LAYER (unchanged behaviour) ============ */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        {webgl ? (
          <Suspense fallback={<PortalFallback />}>
            <PortalWorld />
          </Suspense>
        ) : (
          <PortalFallback />
        )}
        <div className="absolute inset-0 bg-[#07080B]/30 md:bg-[#07080B]/15" />
      </div>

      <div className="relative z-10">
        {/* ================= 1. HERO ================= */}
        <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden px-5 pb-[max(3rem,env(safe-area-inset-bottom))] pt-32 sm:px-8 md:px-14 md:pb-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(4,5,8,0)_0%,rgba(4,5,8,.25)_45%,rgba(7,8,11,.92)_100%)]" />
          <div className="relative mx-auto w-full max-w-[1440px]">
            <p className="mb-5 flex items-center gap-4 text-[11px] font-bold uppercase tracking-[.4em] text-[#C6A66B]"><span aria-hidden="true" className="h-px w-12 bg-[#C6A66B]" />The next move</p>
            <h1 className="max-w-[1100px] text-[clamp(1.6rem,6.3vw,4.5rem)] font-black uppercase leading-[.9] tracking-[-.06em] sm:leading-[.86]">
              Let’s make
              <br />
              <span className="font-editorial font-normal normal-case italic tracking-[-.04em] text-[#C6A66B]">something matter.</span>
            </h1>
            <div className="mt-7 grid max-w-5xl gap-7 border-t border-[#C6A66B]/40 pt-6 md:grid-cols-[1fr_auto] md:items-end">
              <p className="max-w-xl text-[15px] leading-7 text-white/85 sm:text-base sm:leading-8">
                Every meaningful collaboration begins with a conversation. Tell us what you’re building, where you want to go, and what you want the world to remember.
              </p>
              <a href="#contact-form" onClick={goToForm} className={ctaCls}>
                Start a conversation <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </section>

        {/* ================= 2. CONVERSATION + FORM (one split section) ================= */}
        <section id="contact-form" className="relative scroll-mt-24 px-4 py-16 sm:px-8 sm:py-24 md:px-14 md:py-28">
          <div className="mx-auto grid max-w-[1280px] gap-6 lg:grid-cols-12 lg:gap-8">
            <div data-reveal className="rcs-reveal border border-white/10 border-t-2 border-t-[#C6A66B] bg-[#07080B] p-7 sm:p-10 lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
              <h2 className="text-[clamp(1.5rem,3.6vw,3rem)] font-black uppercase leading-[.92] tracking-[-.05em]">
                Good work starts with a
                <span className="mt-1 block font-editorial font-normal normal-case italic text-[#C6A66B]">good conversation.</span>
              </h2>
              <p className="mt-6 text-[15px] leading-7 text-white/75 sm:text-base sm:leading-8">
                We work with ambitious brands, founders, and teams who understand that meaningful visibility begins with a clear point of view.
              </p>
              <p className="mt-4 text-[15px] leading-7 text-white/75 sm:text-base sm:leading-8">
                Whether you are shaping a brand narrative, planning a PR campaign, developing a film, or exploring a larger creative partnership, we want to understand the ambition behind it.
              </p>
              <ol className="mt-8 space-y-3 border-t border-[#C6A66B]/30 pt-6">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex gap-4 text-sm text-white/85">
                    <span className="font-bold tracking-[.14em] text-[#C6A66B]">0{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>

            <div data-reveal className="rcs-reveal relative overflow-hidden bg-[#F5F5F2] px-5 py-10 text-[#07080B] shadow-[0_40px_120px_rgba(0,0,0,.55)] ring-1 ring-[#C6A66B]/50 sm:px-10 sm:py-14 lg:col-span-7 lg:px-14">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#B28F4A] via-[#DDC89D] to-[#B28F4A]" />
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[.3em] text-[#8A6A2B]">The brief</p>
              <h2 className="text-[clamp(1.35rem,3.2vw,2.4rem)] font-black uppercase leading-[.95] tracking-[-.05em]">Tell us about it.</h2>

              <form onSubmit={onSubmit} noValidate className="mt-10 grid gap-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <Field id="cf-name" label="Full name" error={errors.name}>
                    <input id="cf-name" name="name" type="text" autoComplete="name" required value={values.name} onChange={onChange} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "cf-name-error" : undefined} className={inputCls} />
                  </Field>
                  <Field id="cf-email" label="Work email" error={errors.email}>
                    <input id="cf-email" name="email" type="email" inputMode="email" autoComplete="email" required value={values.email} onChange={onChange} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "cf-email-error" : undefined} className={inputCls} />
                  </Field>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <Field id="cf-company" label="Company or brand" optional>
                    <input id="cf-company" name="company" type="text" autoComplete="organization" value={values.company} onChange={onChange} className={inputCls} />
                  </Field>
                  <Field id="cf-topic" label="What would you like to discuss?" optional>
                    <select id="cf-topic" name="topic" value={values.topic} onChange={onChange} className={inputCls}>
                      <option value="">Select a topic</option>
                      {TOPICS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field id="cf-details" label="Project details" error={errors.details}>
                  <textarea id="cf-details" name="details" rows={5} required value={values.details} onChange={onChange} aria-invalid={Boolean(errors.details)} aria-describedby={errors.details ? "cf-details-error" : undefined} className={`${inputCls} resize-y`} />
                </Field>

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-[#07080B] px-8 text-xs font-bold uppercase tracking-[.14em] text-[#C6A66B] ring-1 ring-[#C6A66B] transition hover:bg-[#C6A66B] hover:text-[#07080B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8A6A2B] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
                  >
                    {status === "submitting" ? "Sending…" : "Let’s start something"}
                  </button>
                  <div aria-live="polite" role="status" className="min-h-[1.5rem] text-sm font-medium">
                    {status === "success" && <p className="text-[#7A5C1E]">{message}</p>}
                    {status === "error" && <p className="text-[#b3261e]">{message}</p>}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* ================= 3. CLOSING (solid black, hands over to the footer) ================= */}
        <section className="relative overflow-hidden bg-black px-5 py-24 text-center sm:px-8 sm:py-32 md:px-14 md:py-40">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C6A66B] to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[min(92vw,1100px)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#C6A66B]/35" />
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[96%] w-[min(70vw,820px)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-[#C6A66B]/15" />
          <div data-reveal className="rcs-reveal relative mx-auto max-w-[1440px]">
            <p className="text-[11px] font-bold uppercase tracking-[.4em] text-[#C6A66B]">The next chapter</p>
            <h2 className="mt-6 text-[clamp(1.5rem,6.3vw,5.85rem)] font-black uppercase leading-[.86] tracking-[-.06em] text-white">
              Make something
              <br />
              <span className="bg-gradient-to-r from-[#B28F4A] via-[#DDC89D] to-[#B28F4A] bg-clip-text text-transparent">Rare.</span>
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-[15px] leading-7 text-white/70 sm:text-lg sm:leading-8">
              Strategy. Story. Production. Digital. Let’s build the next chapter of your brand.
            </p>
            <a
              href="#contact-form"
              onClick={goToForm}
              className="mt-10 inline-flex min-h-[56px] items-center justify-center gap-4 rounded-full bg-[#C6A66B] px-8 text-sm font-extrabold uppercase tracking-[.14em] text-[#07080B] shadow-[0_10px_50px_rgba(198,166,107,.3)] transition hover:bg-[#DDC89D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#DDC89D] sm:min-h-[64px] sm:px-10"
            >
              Start a conversation <span aria-hidden="true">↑</span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}