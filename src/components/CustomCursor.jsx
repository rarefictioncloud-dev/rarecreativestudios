import { useEffect, useRef } from "react";

const CURSOR_CSS = `
  .rcs-cursor-dot,
  .rcs-cursor-ring {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 9998;
    pointer-events: none;
    opacity: 0;
    will-change: transform, width, height, opacity;
  }

  .rcs-cursor-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #124CCF;
    z-index: 10000;
  }

  .rcs-cursor-ring {
    width: 38px;
    height: 38px;
    border: 1px solid rgba(18, 76, 207, 0.65);
    border-radius: 50%;
    background: rgba(245, 242, 234, 0.08);
    display: grid;
    place-items: center;
    transition:
      width 260ms cubic-bezier(.2,.8,.2,1),
      height 260ms cubic-bezier(.2,.8,.2,1),
      background 260ms ease,
      border-color 260ms ease;
  }

  .rcs-cursor-arrow {
    width: 14px;
    height: 14px;
    color: #124CCF;
    opacity: 0;
    transform: scale(.6) rotate(-45deg);
    transition:
      opacity 180ms ease,
      transform 260ms ease;
  }

  .rcs-cursor-ring.is-hovering {
    width: 62px;
    height: 62px;
    background: rgba(18, 76, 207, 0.06);
    border-color: #124CCF;
  }

  .rcs-cursor-ring.is-hovering .rcs-cursor-arrow {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  .rcs-cursor-ring.is-pressed {
    width: 30px;
    height: 30px;
    background: rgba(18, 76, 207, 0.12);
  }

  @media (pointer: coarse), (hover: none) {
    .rcs-cursor-dot,
    .rcs-cursor-ring {
      display: none !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .rcs-cursor-dot,
    .rcs-cursor-ring {
      display: none !important;
    }
  }
`;

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!dot || !ring) return;

    const finePointer = window.matchMedia(
      "(pointer: fine) and (hover: hover)"
    ).matches;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!finePointer || reducedMotion) return;

    let mouseX = -100;
    let mouseY = -100;

    let ringX = -100;
    let ringY = -100;

    let rafId = 0;
    let visible = false;

    const animate = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      dot.style.transform = `
        translate3d(
          ${mouseX - 3.5}px,
          ${mouseY - 3.5}px,
          0
        )
      `;

      ring.style.transform = `
        translate3d(
          ${ringX - ring.offsetWidth / 2}px,
          ${ringY - ring.offsetHeight / 2}px,
          0
        )
      `;

      rafId = requestAnimationFrame(animate);
    };

    const handlePointerMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }

      if (!rafId) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const handlePointerOver = (event) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const interactive = target.closest(
        [
          "a",
          "button",
          "[role='button']",
          "input",
          "select",
          "textarea",
          "[data-cursor='hover']",
        ].join(",")
      );

      ring.classList.toggle("is-hovering", Boolean(interactive));
    };

    const handlePointerDown = () => {
      ring.classList.add("is-pressed");
    };

    const handlePointerUp = () => {
      ring.classList.remove("is-pressed");
    };

    const handlePointerLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const handlePointerEnter = () => {
      if (mouseX >= 0 && mouseY >= 0) {
        visible = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
    };

    document.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    document.addEventListener("pointerover", handlePointerOver);

    document.addEventListener("pointerdown", handlePointerDown);

    document.addEventListener("pointerup", handlePointerUp);

    document.addEventListener("pointerleave", handlePointerLeave);

    document.addEventListener("pointerenter", handlePointerEnter);

    // Start the animation loop only after the first pointer movement.
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);

      document.removeEventListener("pointerover", handlePointerOver);

      document.removeEventListener("pointerdown", handlePointerDown);

      document.removeEventListener("pointerup", handlePointerUp);

      document.removeEventListener("pointerleave", handlePointerLeave);

      document.removeEventListener("pointerenter", handlePointerEnter);

      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <>
      <style>{CURSOR_CSS}</style>

      <div
        ref={ringRef}
        aria-hidden="true"
        className="rcs-cursor-ring"
      >
        <svg
          className="rcs-cursor-arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 17 17 7" />
          <path d="M7 7h10v10" />
        </svg>
      </div>

      <div
        ref={dotRef}
        aria-hidden="true"
        className="rcs-cursor-dot"
      />
    </>
  );
}