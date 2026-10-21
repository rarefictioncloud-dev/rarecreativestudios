import { useEffect, useRef } from "react";

const CURSOR_CSS = `
  @media (hover: hover) and (pointer: fine) {
    html,
    body,
    body * {
      cursor: none !important;
    }

    .rcs-cursor {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 2147483647;
      width: 42px;
      height: 42px;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      will-change: transform;
      transition: opacity 180ms ease, visibility 180ms ease;
    }

    .rcs-cursor.is-visible {
      opacity: 1;
      visibility: visible;
    }

    /* Default RCS brand marker */
    .rcs-cursor__core {
      position: absolute;
      top: 0;
      left: 0;
      width: 12px;
      height: 12px;
      border: 1.5px solid #111111;
      border-radius: 50%;
      background: #124CCF;
      box-shadow: 0 0 0 3px rgba(245, 242, 234, 0.9);
      transform: translate(-50%, -50%);
      transition:
        width 240ms cubic-bezier(.2,.8,.2,1),
        height 240ms cubic-bezier(.2,.8,.2,1),
        background 200ms ease,
        border-radius 240ms ease,
        border-color 200ms ease;
    }

    /* Fine ivory center */
    .rcs-cursor__core::after {
      content: "";
      position: absolute;
      width: 3px;
      height: 3px;
      top: 50%;
      left: 50%;
      border-radius: 50%;
      background: #F5F2EA;
      transform: translate(-50%, -50%);
      transition: opacity 160ms ease;
    }

    /* Thin orbit ring */
    .rcs-cursor__orbit {
      position: absolute;
      top: 0;
      left: 0;
      width: 28px;
      height: 28px;
      border: 1px solid rgba(18, 76, 207, 0.45);
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(.65);
      opacity: 0;
      transition:
        transform 260ms cubic-bezier(.2,.8,.2,1),
        opacity 200ms ease;
    }

    /* Arrow label */
    .rcs-cursor__arrow {
      position: absolute;
      top: 0;
      left: 0;
      display: grid;
      width: 28px;
      height: 28px;
      place-items: center;
      color: #F5F2EA;
      font-family: Arial, sans-serif;
      font-size: 17px;
      line-height: 1;
      opacity: 0;
      transform: translate(-50%, -50%) scale(.6);
      transition:
        opacity 180ms ease,
        transform 220ms cubic-bezier(.2,.8,.2,1);
    }

    /* Editorial Explore label for creative work */
    .rcs-cursor__explore {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 10px 13px;
      border: 1px solid #124CCF;
      border-radius: 2px;
      background: #F5F2EA;
      color: #111111;
      font-family: "IBM Plex Mono", monospace;
      font-size: 9px;
      font-weight: 500;
      letter-spacing: .12em;
      white-space: nowrap;
      opacity: 0;
      transform: translate(12px, 12px) scale(.92);
      transition:
        opacity 180ms ease,
        transform 220ms cubic-bezier(.2,.8,.2,1);
    }

    .rcs-cursor__explore::after {
      content: "↗";
      color: #124CCF;
      font-family: Arial, sans-serif;
      font-size: 14px;
      letter-spacing: 0;
    }

    /* Interactive links and buttons */
    .rcs-cursor.is-link .rcs-cursor__core {
      width: 28px;
      height: 28px;
      border-color: #111111;
      background: #124CCF;
    }

    .rcs-cursor.is-link .rcs-cursor__core::after {
      opacity: 0;
    }

    .rcs-cursor.is-link .rcs-cursor__orbit {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    .rcs-cursor.is-link .rcs-cursor__arrow {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }

    /* Creative project / image hover */
    .rcs-cursor.is-explore .rcs-cursor__core,
    .rcs-cursor.is-explore .rcs-cursor__orbit,
    .rcs-cursor.is-explore .rcs-cursor__arrow {
      opacity: 0;
    }

    .rcs-cursor.is-explore .rcs-cursor__explore {
      opacity: 1;
      transform: translate(12px, 12px) scale(1);
    }

    /* Click response */
    .rcs-cursor.is-clicking .rcs-cursor__core {
      background: #111111;
      transform: translate(-50%, -50%) scale(.8);
    }

    .rcs-cursor.is-clicking .rcs-cursor__orbit {
      transform: translate(-50%, -50%) scale(1.35);
      opacity: 0;
    }

    .rcs-cursor.is-hidden {
      opacity: 0;
      visibility: hidden;
    }
  }

  @media (hover: none), (pointer: coarse) {
    .rcs-cursor {
      display: none !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .rcs-cursor,
    .rcs-cursor * {
      transition: none !important;
    }
  }
`;

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;

    if (!cursor) return;

    const pointerMedia = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    if (!pointerMedia.matches) return;

    let disposed = false;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const interactiveSelector = [
      "a",
      "button",
      "[role='button']",
      "summary",
      "[data-cursor='hover']",
    ].join(",");

    const exploreSelector = [
      "[data-cursor='explore']",
      ".project-card",
      ".work-card",
      ".portfolio-item",
    ].join(",");

    const textSelector = [
      "input",
      "textarea",
      "select",
      '[contenteditable="true"]',
    ].join(",");

    const render = () => {
      if (disposed) return;

      // Slightly smooth the cursor without creating a long trailing effect.
      currentX += (targetX - currentX) * 0.78;
      currentY += (targetY - currentY) * 0.78;

      cursor.style.transform =
        `translate3d(${currentX}px, ${currentY}px, 0)`;

      animationRef.current =
        window.requestAnimationFrame(render);
    };

    const handlePointerMove = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;

      cursor.classList.add("is-visible");
      cursor.classList.remove("is-hidden");

      const target = event.target;

      if (target.closest(textSelector)) {
        cursor.classList.add("is-hidden");
        return;
      }

      const exploreTarget = target.closest(exploreSelector);
      const linkTarget = target.closest(interactiveSelector);

      cursor.classList.toggle(
        "is-explore",
        Boolean(exploreTarget)
      );

      cursor.classList.toggle(
        "is-link",
        Boolean(linkTarget) && !exploreTarget
      );
    };

    const handlePointerDown = () => {
      cursor.classList.add("is-clicking");
    };

    const handlePointerUp = () => {
      cursor.classList.remove("is-clicking");
    };

    const handlePointerLeave = () => {
      cursor.classList.remove("is-visible");
    };

    const handlePointerEnter = () => {
      cursor.classList.add("is-visible");
    };

    const handleWindowBlur = () => {
      cursor.classList.remove("is-visible");
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cursor.classList.remove("is-visible");
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("blur", handleWindowBlur);

    document.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("pointerenter", handlePointerEnter);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    animationRef.current =
      window.requestAnimationFrame(render);

    return () => {
      disposed = true;

      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("blur", handleWindowBlur);

      document.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("pointerenter", handlePointerEnter);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  return (
    <>
      <style>{CURSOR_CSS}</style>

      <div
        ref={cursorRef}
        className="rcs-cursor"
        aria-hidden="true"
      >
        <div className="rcs-cursor__orbit" />
        <div className="rcs-cursor__core" />
        <div className="rcs-cursor__arrow">↗</div>
        <div className="rcs-cursor__explore">
          EXPLORE
        </div>
      </div>
    </>
  );
}