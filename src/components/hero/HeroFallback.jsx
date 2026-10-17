export default function HeroFallback() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-black"
      aria-hidden="true"
    >
      <style>{`
        @keyframes rcs-board-float {
          0%, 100% {
            transform:
              translate(-50%, -50%)
              perspective(900px)
              rotateX(62deg)
              rotateZ(-18deg)
              translateY(0);
          }

          50% {
            transform:
              translate(-50%, -50%)
              perspective(900px)
              rotateX(62deg)
              rotateZ(-14deg)
              translateY(-10px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rcs-board {
            animation: none !important;
          }
        }
      `}</style>

      {/* Subtle blue atmospheric glow */}
      <div className="absolute left-1/2 top-[38%] h-[65vmin] w-[65vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0756BD]/20 blur-[70px] md:blur-[100px]" />

      {/* CSS-only chessboard */}
      <div
        className="rcs-board absolute left-1/2 top-[38%] h-[min(78vw,78vh)] w-[min(78vw,78vh)] rounded-sm ring-1 ring-[#0756BD]/50"
        style={{
          backgroundImage:
            "repeating-conic-gradient(#050609 0% 25%, #0a2c66 0% 50%)",

          backgroundSize: "25% 25%",

          animation:
            "rcs-board-float 10s ease-in-out infinite",

          boxShadow:
            "0 0 90px -25px rgba(7,86,189,.65)",

          WebkitMaskImage:
            "radial-gradient(circle at center, #000 48%, transparent 77%)",

          maskImage:
            "radial-gradient(circle at center, #000 48%, transparent 77%)",
        }}
      />

      {/* Dark cinematic gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-black/25" />
    </div>
  );
}