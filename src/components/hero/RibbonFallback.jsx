import { useEffect, useRef } from "react";

/*
  Fallback when WebGL is unavailable, while the 3D chunk loads, or when the
  visitor prefers reduced motion. Fills its parent. Parallax is paused for
  reduced motion, which leaves a static composition.
*/
export default function RibbonFallback() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--p", 0.35);
      return;
    }
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        el.style.setProperty("--p", max > 0 ? window.scrollY / max : 0);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-[#07080b]" aria-hidden="true" style={{ "--p": 0 }}>
      <div className="absolute left-1/2 top-[40%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0756BD]/25 blur-[60px] md:blur-[100px]" />

      <div
        className="absolute right-[-6%] top-[18%] h-[52vmin] w-[38vmin] border border-white/10 bg-[#cfd0d3] shadow-[0_30px_90px_rgba(0,0,0,.5)] md:left-[8%] md:right-auto"
        style={{ transform: "translateY(calc(var(--p) * -60vh)) rotate(-11deg)" }}
      />
      <div
        className="absolute right-[2%] top-[52%] h-[56vmin] w-[40vmin] border border-white/10 bg-[#cfd0d3] shadow-[0_30px_90px_rgba(0,0,0,.5)] md:right-[6%]"
        style={{ transform: "translateY(calc(var(--p) * -90vh)) rotate(12deg)" }}
      />

      <div
        className="absolute left-[58%] top-[22%] h-[64vmin] w-[16vmin] rounded-[50%] border-[clamp(14px,2.4vw,34px)] border-[#0756BD] shadow-[0_0_60px_rgba(7,86,189,.55),inset_0_0_24px_rgba(255,255,255,.35)] md:left-[30%]"
        style={{ transform: "translateY(calc(var(--p) * -70vh)) rotate(calc(-28deg + var(--p) * 70deg))" }}
      />
      <div
        className="absolute left-[56%] top-[70%] h-[10vmin] w-[10vmin] rounded-full border-[3px] border-[#d8dee9]"
        style={{ transform: "translateY(calc(var(--p) * -110vh))" }}
      />
    </div>
  );
}