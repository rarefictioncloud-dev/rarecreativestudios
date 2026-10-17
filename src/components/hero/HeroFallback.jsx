/* Lightweight CSS-only stand-in, shown when WebGL is missing or the 3D scene fails. */
export default function HeroFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black" aria-hidden="true">
      <style>{`
        @keyframes rcs-float { 0%,100% { transform: perspective(900px) rotateX(62deg) rotateZ(-18deg) translateY(0) }
                               50%     { transform: perspective(900px) rotateX(62deg) rotateZ(-14deg) translateY(-12px) } }
        @media (prefers-reduced-motion: reduce) { .rcs-board { animation: none !important } }
      `}</style>

      <div className="absolute left-1/2 top-[30%] h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0756BD]/25 blur-[100px]" />

      <div
        className="rcs-board absolute left-1/2 top-[32%] h-[72vmin] w-[72vmin] -translate-x-1/2 -translate-y-1/2 rounded-sm shadow-[0_0_120px_-10px_rgba(7,86,189,0.7)] ring-1 ring-[#0756BD]/60"
        style={{
          backgroundImage: "repeating-conic-gradient(#040406 0% 25%, #0a2c66 0% 50%)",
          backgroundSize: "25% 25%",
          animation: "rcs-float 9s ease-in-out infinite",
          transform: "perspective(900px) rotateX(62deg) rotateZ(-18deg)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 55%, transparent 78%)",
          maskImage: "radial-gradient(circle at 50% 50%, #000 55%, transparent 78%)",
        }}
      />
    </div>
  );
}