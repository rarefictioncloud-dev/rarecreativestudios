import { useEffect, useState } from "react";

const LOADER_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

.rcs-loader {
  font-family: 'DM Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.rcs-loader-word {
  font-family: 'Anton', sans-serif;
  font-size: clamp(5rem, 21vw, 19rem);
  line-height: 0.85;
  letter-spacing: -0.055em;
  color: #111111;
  position: relative;
  display: inline-block;
  transform-style: preserve-3d;
  animation: rcs-word-enter 650ms cubic-bezier(.2,.8,.2,1) both;
}

.rcs-loader-word::before {
  content: "RARE";
  position: absolute;
  inset: 0;
  color: #124CCF;
  transform: translate(0.035em, 0.035em);
  z-index: -1;
}

.rcs-loader-word::after {
  content: "RARE";
  position: absolute;
  inset: 0;
  color: #D2D0C8;
  transform: translate(0.07em, 0.07em);
  z-index: -2;
}

.rcs-loader-ring {
  position: absolute;
  width: clamp(200px, 36vw, 450px);
  aspect-ratio: 1;
  border: 1px solid rgba(18, 76, 207, 0.22);
  border-radius: 50%;
  animation: rcs-ring-rotate 5s linear infinite;
}

.rcs-loader-ring::before {
  content: "";
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #124CCF;
  top: 15%;
  left: 15%;
}

.rcs-loader-ring-two {
  width: clamp(160px, 28vw, 350px);
  border-color: rgba(17, 17, 17, 0.12);
  animation-direction: reverse;
  animation-duration: 8s;
}

.rcs-loader-shape {
  position: absolute;
  width: 38px;
  height: 38px;
  background: #124CCF;
  transform: rotate(45deg);
  animation: rcs-shape-float 1.5s ease-in-out infinite alternate;
}

.rcs-loader-progress {
  transform-origin: left;
  animation: rcs-progress 800ms cubic-bezier(.4,0,.2,1) forwards;
}

.rcs-loader-exit {
  transform: translateY(-100%);
  visibility: hidden;
  pointer-events: none;
}

@keyframes rcs-word-enter {
  from {
    opacity: 0;
    transform: translateY(35px) rotateX(-15deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

@keyframes rcs-ring-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes rcs-shape-float {
  from {
    transform: translateY(-8px) rotate(45deg);
  }
  to {
    transform: translateY(8px) rotate(135deg);
  }
}

@keyframes rcs-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .rcs-loader *,
  .rcs-loader *::before,
  .rcs-loader *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
`;

export default function LoadingScreen({ onComplete }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Begin the upward exit after 800ms.
    const exitTimer = window.setTimeout(() => {
      setExiting(true);
    }, 800);

    // Finish the complete loading sequence at approximately 1 second.
    const completeTimer = window.setTimeout(() => {
      onComplete?.();
    }, 500);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <>
      <style>{LOADER_CSS}</style>

      <div
        className={`
          rcs-loader
          fixed inset-0 z-[99999]
          flex flex-col
          overflow-hidden
          bg-[#F5F2EA]
          text-[#111111]
          transition-transform duration-200 ease-in
          ${exiting ? "rcs-loader-exit" : "translate-y-0"}
        `}
        aria-label="Loading Rare Creative Studios"
        role="status"
        aria-live="polite"
      >
        {/* Background details */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-black/[0.06]" />

          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full border border-black/[0.06]" />

          <div className="absolute -bottom-40 -right-32 h-[450px] w-[450px] rounded-full border border-black/[0.06]" />

          <div className="absolute right-[12%] top-[18%] h-2 w-2 rounded-full bg-[#124CCF]" />

          <div className="absolute bottom-[22%] left-[12%] h-1.5 w-1.5 rounded-full bg-black/30" />
        </div>

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-10 sm:py-7 lg:px-14">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-[#124CCF] text-sm font-bold text-white">
              R
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] sm:text-xs">
                Rare Creative Studios
              </p>

              <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-black/45 sm:text-[9px]">
                An independent creative company
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/50 sm:text-[10px]">
              RCS®
            </p>

            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider">
              Loading
            </p>
          </div>
        </header>

        {/* Main wordmark */}
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4">
          <div className="relative flex items-center justify-center">
            {/* Orbit graphics */}
            <div className="rcs-loader-ring" />
            <div className="rcs-loader-ring rcs-loader-ring-two" />

            {/* Floating geometric shape */}
            <div className="rcs-loader-shape -right-9 -top-7 hidden sm:block" />

            {/* 3D wordmark */}
            <div className="relative z-10 py-8">
              <h1 className="rcs-loader-word select-none" aria-label="RARE">
                RARE
              </h1>
            </div>
          </div>

          <div className="mt-8 text-center sm:mt-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] sm:text-xs">
              Ideas into impact.
            </p>

            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-black/45 sm:text-[10px]">
              Strategy / Story / Culture
            </p>
          </div>
        </main>

        {/* Bottom progress section */}
        <footer className="relative z-10 px-5 pb-6 sm:px-10 sm:pb-8 lg:px-14">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-black/45 sm:text-[10px]">
              Hyderabad · India
            </span>

            <span className="font-mono text-[9px] uppercase tracking-[0.14em] sm:text-[10px]">
              001 — RCS
            </span>
          </div>

          <div className="h-[2px] w-full overflow-hidden bg-black/10">
            <div className="rcs-loader-progress h-full w-full bg-[#124CCF]" />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-black/40">
              Preparing experience
            </span>

            <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-black/40">
              Please wait
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}