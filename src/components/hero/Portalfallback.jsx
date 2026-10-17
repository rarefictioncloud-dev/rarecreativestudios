import { useEffect, useRef } from "react";

/* Fallback for no WebGL, while the 3D chunk loads, or reduced motion. */
export default function PortalFallback() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--p", 0.2);
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
      <div className="absolute left-1/2 top-[34%] h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0756BD]/25 blur-[60px] md:top-[42%] md:blur-[100px]" />

      {/* ribbon band passing through both rings */}
      <div
        className="absolute left-1/2 top-[34%] h-[10vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-[#0756BD] to-transparent shadow-[0_0_50px_rgba(7,86,189,.6)] md:top-[42%]"
        style={{ transform: "translate(-50%,-50%) rotate(calc(-14deg + var(--p) * 20deg))" }}
      />
      {/* chrome rings */}
      <div
        className="absolute left-[28%] top-[34%] h-[34vmin] w-[34vmin] -translate-y-1/2 rounded-full border-[clamp(4px,.7vmin,8px)] border-[#e6ebf5] shadow-[0_0_30px_rgba(199,205,214,.25)] md:top-[42%]"
        style={{ transform: "translateY(-50%) rotateY(calc(var(--p) * 40deg))" }}
      />
      <div
        className="absolute right-[26%] top-[34%] h-[27vmin] w-[27vmin] -translate-y-1/2 rounded-full border-[clamp(4px,.6vmin,7px)] border-[#c7cdd6] shadow-[0_0_30px_rgba(199,205,214,.2)] md:top-[42%]"
        style={{ transform: "translateY(-50%) rotateY(calc(var(--p) * -40deg))" }}
      />
    </div>
  );
}