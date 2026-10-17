import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import HeroFallback from "../components/hero/HeroFallback";

gsap.registerPlugin(ScrollTrigger);

/* ---------- Lazy-load 3D scene ---------- */

const ChessWorld = lazy(() =>
  import("../components/hero/ChessWorld")
);

/* ---------- WebGL Detection ---------- */

const hasWebGL = () => {
  try {
    const canvas = document.createElement("canvas");

    const context =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl");

    if (context) {
      const extension = context.getExtension(
        "WEBGL_lose_context"
      );

      extension?.loseContext();
    }

    return Boolean(
      window.WebGLRenderingContext
    );
  } catch {
    return false;
  }
};

/* ---------- Error Boundary ---------- */

class GLBoundary extends Component {
  state = {
    failed: false,
  };

  static getDerivedStateFromError() {
    return {
      failed: true,
    };
  }

  componentDidCatch(err) {
    console.warn(
      "3D hero disabled, using fallback:",
      err
    );

    this.props.onFail?.();
  }

  render() {
    return this.state.failed
      ? this.props.fallback
      : this.props.children;
  }
}

/* ---------- Arrow Link ---------- */

function ArrowLink({
  href,
  children,
  className = "",
}) {
  return (
    <Link
      to={href}
      className={`group inline-flex items-center gap-4 rounded-full py-1 pr-1 text-base font-semibold tracking-[-0.01em] text-white outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:text-lg ${className}`}
    >
      <span className="relative">
        {children}

        <span className="absolute -bottom-1 left-0 h-px w-full origin-left bg-white/40 transition-colors duration-300 group-hover:bg-white" />
      </span>

      <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#1a73e8] to-[#0756BD] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_30px_-8px_rgba(7,86,189,0.9)] transition-transform duration-500 group-hover:rotate-45 group-hover:scale-110 md:h-14 md:w-14">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 -left-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent animate-[rcsGlint_4s_ease-in-out_infinite] motion-reduce:animate-none"
        />

        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="relative h-4 w-4"
          aria-hidden="true"
        >
          <path
            d="M4.5 11.5l7-7M5.5 4.5h6v6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}

/* ---------- Content Chapters ---------- */

function Chapter({
  side = "left",
  title,
  children,
}) {
  const right = side === "right";

  return (
    <section className="chapter relative flex min-h-[110svh] items-center px-5 sm:px-8 md:px-14">
      <div
        className={`relative mx-auto w-full max-w-[1470px] ${
          right ? "text-right" : ""
        }`}
      >
        <h2
          className={`reveal font-editorial drop-shadow-[0_6px_30px_rgba(0,0,0,0.6)] max-w-[13ch] text-[clamp(2.6rem,6.4vw,6.5rem)] leading-[0.98] ${
            right ? "ml-auto" : ""
          }`}
        >
          {title}
        </h2>

        <p
          className={`reveal mt-6 max-w-md text-base leading-relaxed text-white/80 drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)] md:text-lg ${
            right ? "ml-auto" : ""
          }`}
        >
          {children}
        </p>
      </div>
    </section>
  );
}

/* ---------- Homepage ---------- */

export default function Home() {
  const root = useRef(null);
  const curtain = useRef(null);
  const heroTl = useRef(null);

  // Shared scroll progress for the 3D camera.
  const scroll = useRef({
    p: 0,
  });

  // Shared pointer values for the 3D scene.
  const pointer = useRef({
    x: 0,
    y: 0,
    t: 0,
  });

  /*
   * Detect WebGL once.
   * Respect data-saving preferences.
   */
  const [gl] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const saveData = Boolean(
      navigator.connection?.saveData
    );

    return !saveData && hasWebGL();
  });

  /*
   * Mount the 3D scene after the initial render.
   */
  const [mount3D, setMount3D] = useState(false);

  /*
   * Keep the 3D camera animation synchronized
   * with page scrolling.
   */
  useEffect(() => {
    const onMove = (event) => {
      pointer.current.x =
        (event.clientX / window.innerWidth) * 2 - 1;

      pointer.current.y =
        -(
          (event.clientY / window.innerHeight) * 2 -
          1
        );

      pointer.current.t = performance.now();
    };

    window.addEventListener(
      "pointermove",
      onMove,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        onMove
      );
    };
  }, []);

  /*
   * Load 3D during browser idle time.
   */
  useEffect(() => {
    if (!gl) {
      return;
    }

    let idleId;
    let timerId;
    let cancelled = false;

    const start3D = () => {
      if (!cancelled) {
        setMount3D(true);
      }
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(
        start3D,
        {
          timeout: 2500,
        }
      );
    } else {
      timerId = window.setTimeout(
        start3D,
        1000
      );
    }

    return () => {
      cancelled = true;

      if (
        idleId !== undefined &&
        "cancelIdleCallback" in window
      ) {
        window.cancelIdleCallback(idleId);
      }

      if (timerId !== undefined) {
        window.clearTimeout(timerId);
      }
    };
  }, [gl]);

  /*
   * GSAP animations.
   * Original animations and scroll effects preserved.
   */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".hl", {
        yPercent: 110,
      });

      gsap.set(".hero-fade", {
        autoAlpha: 0,
        y: 24,
      });

      heroTl.current = gsap
        .timeline({
          paused: true,
          defaults: {
            ease: "power4.out",
          },
        })
        .to(
          ".hl",
          {
            yPercent: 0,
            duration: 1.6,
            stagger: 0.18,
          },
          0
        )
        .to(
          ".hero-fade",
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.15,
          },
          0.7
        );

      // Page progress controls the 3D camera.
      gsap.to(scroll.current, {
        p: 1,
        ease: "none",

        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });

      // Original hero-copy scroll effect.
      gsap.to(".hero-content", {
        yPercent: -18,
        autoAlpha: 0,
        ease: "none",

        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom 35%",
          scrub: true,
        },
      });

      // Original section reveal animations.
      gsap.utils
        .toArray(".chapter, .finale")
        .forEach((element) => {
          gsap.from(
            element.querySelectorAll(".reveal"),
            {
              y: 50,
              autoAlpha: 0,
              duration: 1.1,
              ease: "power3.out",
              stagger: 0.12,

              scrollTrigger: {
                trigger: element,
                start: "top 60%",
                toggleActions:
                  "play none none reverse",
              },
            }
          );
        });

      // Original scroll indicator animation.
      gsap.fromTo(
        ".scroll-dot",
        {
          y: 0,
        },
        {
          y: 36,
          duration: 1.6,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
        }
      );
    }, root);

    document.fonts?.ready.then(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
    };
  }, []);

  /*
   * Start the hero animation immediately.
   */
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const animationFrame = requestAnimationFrame(() => {
      if (curtain.current) {
        gsap.to(curtain.current, {
          autoAlpha: 0,
          duration: reduce ? 0 : 1.6,
          ease: "power2.inOut",
        });
      }

      if (reduce) {
        heroTl.current?.progress(1);
      } else {
        heroTl.current?.play();
      }
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <main
      ref={root}
      className="relative bg-black text-white"
    >
      <style>{`
        @keyframes rcsSheen {
          0% {
            background-position: 100% 0;
          }

          100% {
            background-position: -150% 0;
          }
        }

        @keyframes rcsGlint {
          0%, 55% {
            left: -100%;
          }

          100% {
            left: 200%;
          }
        }
      `}</style>

      {/* Original black curtain */}
      <div
        ref={curtain}
        className="pointer-events-none fixed inset-0 z-[45] bg-black"
        aria-hidden="true"
      />

      {/* Fixed 3D stage */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[100lvh]"
        aria-hidden="true"
      >
        <GLBoundary
          fallback={<HeroFallback />}
          onFail={() => {}}
        >
          {gl && mount3D ? (
            <Suspense
              fallback={<HeroFallback />}
            >
              <ChessWorld
                scroll={scroll}
                pointer={pointer}
                onReady={() => {}}
              />
            </Suspense>
          ) : (
            <HeroFallback />
          )}
        </GLBoundary>
      </div>

      <div className="relative z-10">
        {/* ---------------- Hero ---------------- */}

        <section className="hero relative flex min-h-[100svh] items-end px-5 pb-10 sm:px-8 md:px-14 md:pb-14">
          <div className="hero-content relative mx-auto w-full max-w-[1470px]">
            <h1>
              <span className="block overflow-hidden">
                <span className="hl font-condensed block text-[clamp(1.4rem,3.5vw,3.8rem)] font-extrabold uppercase leading-[0.88] tracking-[-0.01em] drop-shadow-[0_6px_30px_rgba(0,0,0,0.55)]">
                  We don't send press releases.
                </span>
              </span>

              <span className="block overflow-hidden pb-[0.12em]">
                <span className="hl font-editorial block bg-[linear-gradient(110deg,#8f99a8_0%,#ffffff_35%,#8f99a8_50%,#ffffff_70%,#8f99a8_100%)] bg-[length:250%_100%] animate-[rcsSheen_7s_linear_infinite] motion-reduce:animate-none bg-clip-text text-[clamp(1.8rem,4.2vw,4.5rem)] italic leading-[0.95] text-transparent drop-shadow-[0_6px_30px_rgba(0,0,0,0.55)]">
                  We create moments.
                </span>
              </span>
            </h1>

            <div className="mt-8 flex flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between">
              <p className="hero-fade font-editorial text-2xl text-white/85 drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)] md:text-3xl">
                Turning brands into conversations.
              </p>

              <div className="hero-fade">
                <ArrowLink href="/portfolio">
                  Explore our craft
                </ArrowLink>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            className="hero-fade absolute bottom-10 right-5 flex flex-col items-center gap-3 text-xs text-white/50 md:bottom-14 md:right-14"
            aria-hidden="true"
          >
            <span className="[writing-mode:vertical-rl]">
              Scroll
            </span>

            <span className="relative h-14 w-px bg-white/20">
              <span className="scroll-dot absolute -left-[1.5px] top-0 h-1.5 w-1.5 rounded-full bg-[#2f8bff]" />
            </span>
          </div>
        </section>

        {/* ---------------- Scroll Chapters ---------------- */}

        <Chapter title="Strategy before noise.">
          Every move starts with the position on the board:
          who is listening, what they trust, and what they
          will repeat.
        </Chapter>

        <Chapter
          side="right"
          title="Influence is a position, not a volume."
        >
          We place brands where conversations already happen,
          then give people a reason to keep going.
        </Chapter>

        <Chapter title="Authority is earned in public.">
          The strongest piece on the board rarely moves first.
          It moves when the moment is right, and everyone sees why.
        </Chapter>

        {/* ---------------- Finale ---------------- */}

        <section className="finale relative flex min-h-[100svh] flex-col items-center justify-end px-5 pb-14 text-center md:pb-20">
          <h2 className="reveal font-editorial relative drop-shadow-[0_6px_30px_rgba(0,0,0,0.55)] bg-[linear-gradient(110deg,#8f99a8_0%,#ffffff_35%,#8f99a8_50%,#ffffff_70%,#8f99a8_100%)] bg-[length:250%_100%] animate-[rcsSheen_7s_linear_infinite] motion-reduce:animate-none bg-clip-text text-[clamp(3.4rem,10.5vw,10.5rem)] italic leading-[0.9] text-transparent">
            Your move.
          </h2>

          <div className="reveal relative mt-8">
            <ArrowLink href="/contact">
              Start a conversation
            </ArrowLink>
          </div>
        </section>
      </div>
    </main>
  );
}