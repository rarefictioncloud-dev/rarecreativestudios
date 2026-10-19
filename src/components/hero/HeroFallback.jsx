/* CSS-only stand-in for the 3D sculpture: shown while the 3D chunk loads and whenever WebGL is
   unavailable. Same cast as the scene (cobalt monolith, chrome ring, white plinth, framed panel,
   yellow bead) in the brand palette. Decorative: the page's real content is HTML. */
const RING_BG = "conic-gradient(from 20deg, #f4f7ff, #8f9bb3, #ffffff, #75849B, #f4f7ff)";
const RING_MASK = "radial-gradient(ellipse farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))";
const ring = { background: RING_BG, WebkitMask: RING_MASK, mask: RING_MASK };

export default function HeroFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0C192D]" aria-hidden="true">
      <style>{`
        @keyframes rcs-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .rcs-float { animation: rcs-float 8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .rcs-float { animation: none; } }
      `}</style>

      {/* atmosphere */}
      <div className="absolute left-1/2 top-[34%] h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5271FF]/25 blur-[80px] md:left-[68%] md:top-[44%] md:blur-[110px]" />

      {/* sculpture: centred in the free band on portrait screens, on the right on landscape */}
      <div
        className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 md:left-[68%] md:top-[44%]"
        style={{ width: "min(76vw, 46vh)", height: "calc(min(76vw, 46vh) * 1.28)" }}
      >
        <div className="rcs-float relative h-full w-full">
          {/* suspended frame */}
          <div
            className="absolute left-[62%] top-[24%] h-[46%] w-[34%] rotate-[8deg] rounded-[3px] border-[5px] border-[#F4F1EA] shadow-[0_20px_50px_-20px_rgba(0,0,0,.8)]"
            style={{ background: "linear-gradient(160deg, #0C192D 0%, #4a5a78 55%, #c9d1de 100%)" }}
          >
            <span className="absolute inset-x-0 bottom-[22%] h-[3px] bg-[#5271FF]" />
          </div>

          {/* ring: back half (behind the monolith) */}
          <div className="absolute left-[2%] top-[40%] h-[24%] w-[96%] -rotate-[10deg] [clip-path:inset(0_0_50%_0)]" style={ring} />

          {/* cobalt monolith */}
          <div
            className="absolute left-[37%] top-[4%] h-[86%] w-[27%] rounded-[16%/5%] shadow-[0_0_80px_-10px_rgba(82,113,255,.7)] [transform:perspective(900px)_rotateY(-18deg)_rotateZ(2deg)]"
            style={{
              background:
                "linear-gradient(100deg, rgba(255,255,255,.32) 0%, rgba(255,255,255,0) 28%), linear-gradient(160deg, #8ea0ff 0%, #5271FF 42%, #002366 100%)",
            }}
          />

          {/* white plinth */}
          <div className="absolute left-[24%] top-[88%] h-[7%] w-[54%] rounded-[4px] bg-[#F4F1EA] shadow-[0_14px_30px_-12px_rgba(0,0,0,.8)]" />

          {/* ring: front half (in front of the monolith) */}
          <div className="absolute left-[2%] top-[40%] h-[24%] w-[96%] -rotate-[10deg] [clip-path:inset(50%_0_0_0)]" style={ring} />

          {/* the single yellow accent */}
          <div className="absolute left-[80%] top-[43%] h-[5%] w-[5%] rounded-full bg-[#C6A66B] shadow-[0_0_18px_rgba(198,166,107,.5)]" />
        </div>
      </div>
    </div>
  );
}