import { useEffect, useRef } from "react";

/* Static-ish CSS version of the chess scene: no WebGL, while loading, or reduced motion. */
export default function ChessMoveFallback() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--p", 0.15);
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
    <div
      ref={ref}
      className="absolute inset-0 overflow-hidden bg-[#07080b]"
      aria-hidden="true"
      style={{ "--p": 0, perspective: "1000px" }}
    >
      <div className="absolute left-1/2 top-[36%] h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0756BD]/20 blur-[60px] md:top-[44%] md:blur-[100px]" />

      {/* floating board */}
      <div
        className="absolute left-1/2 top-[38%] h-[78vmin] w-[78vmin] shadow-[0_40px_90px_rgba(0,0,0,.7)] md:top-[48%]"
        style={{
          transform: "translate(-50%,-50%) rotateX(62deg) rotateZ(calc(-28deg + var(--p) * 34deg))",
          background:
            "repeating-conic-gradient(#F5F5F2 0% 25%, #0b0c10 0% 50%) 0 0 / 25% 25%",
          outline: "6px solid #0d0f14",
        }}
      >
        {/* cobalt route */}
        <span className="absolute bottom-[6%] left-[6%] h-[3%] w-[70%] origin-left -rotate-[38deg] bg-[#2a6bff] shadow-[0_0_30px_#2a6bff]" style={{ opacity: "calc(.25 + var(--p) * .75)" }} />
      </div>

      {/* chrome king silhouette */}
      <div
        className="absolute left-[56%] top-[10%] h-[40vmin] w-[16vmin] md:top-[14%]"
        style={{
          transform: "translateY(calc(var(--p) * 4vmin))",
          clipPath:
            "polygon(44% 0,56% 0,56% 5%,66% 5%,66% 12%,56% 12%,56% 18%,68% 30%,60% 40%,58% 70%,78% 86%,84% 100%,16% 100%,22% 86%,42% 70%,40% 40%,32% 30%,44% 18%,44% 12%,34% 12%,34% 5%,44% 5%)",
          background:
            "linear-gradient(100deg,#6b7482 0%,#f2f5fa 28%,#8b95a5 48%,#e6ebf5 70%,#5d6674 100%)",
          filter: "drop-shadow(0 20px 30px rgba(0,0,0,.6))",
        }}
      />
    </div>
  );
}