import { useEffect, useRef } from "react";

const DEPTH = 16;
const face = "whitespace-nowrap text-[clamp(4.5rem,22vw,8rem)] font-black leading-[0.8] tracking-tighter md:text-[clamp(5rem,12.5vw,13rem)]";

// Extruded "RARE": stacked text layers in CSS 3D. Decorative only; the page's real text is HTML.
export default function RareObject() {
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