import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";
import LoadingScreen from "./components/LoadingScreen";
import CustomCursor from "./components/CustomCursor";
import ScrollToTop from "./components/ScrollToTop";

/* ---------------------------------------------------------------------
   DESKTOP ZOOM-OUT
   On computer screens (>= DESKTOP_MIN px wide) the whole site is rendered
   at DESKTOP_ZOOM (0.75 = zoomed out by 25%). Below that width (phones,
   small tablets) nothing changes at all.

   - CustomCursor and LoadingScreen sit OUTSIDE the zoomed wrapper, so the
     cursor still follows the real pointer position and the loader still
     covers the full screen.
   - Viewport-height units (vh / svh) get scaled by CSS zoom in some
     browsers, which would make "full screen" sections too short. A tiny
     probe measures this once and sets --rcs-vh-comp so that min-height and
     the Home page's full-screen scroll scene stay exactly full-screen.
   --------------------------------------------------------------------- */
const DESKTOP_ZOOM = 0.75;
const DESKTOP_MIN = 1024;
const DESKTOP_QUERY = `(min-width: ${DESKTOP_MIN}px)`;

const ZOOM_CSS = `
  .rcs-app-zoom { min-height: 100vh; }

  @media ${DESKTOP_QUERY} {
    .rcs-app-zoom {
      zoom: ${DESKTOP_ZOOM};
      min-height: calc(100vh * var(--rcs-vh-comp, 1));
    }

    /* Home page: keep the pinned 3D scene full-screen and its scroll length
       identical to before, even though the page is zoomed out. */
    .rcs-app-zoom .rcs-cine {
      height: calc(1100vh * var(--rcs-vh-comp, 1)) !important;
    }
    .rcs-app-zoom .rcs-cine > .sticky {
      height: calc(100svh * var(--rcs-vh-comp, 1)) !important;
    }

    /* Home sets its own pixel width + centring margin from the viewport width.
       Under zoom that pixel width gets scaled down a second time (the narrow
       box in the middle), so let it simply fill the zoomed page instead. */
    .rcs-app-zoom .rcs-cine {
      width: 100% !important;
      margin-left: 0 !important;
    }

    /* The WebGL canvas measures its own size in real screen pixels, so it must
       not be zoomed twice: cancel the wrapper zoom for the canvas holder only.
       (The holder is the first child of the pinned sticky scene.) */
    .rcs-app-zoom .rcs-cine > .sticky > div:first-child {
      zoom: ${1 / DESKTOP_ZOOM};
    }
  }
`;

export default function App() {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [pageKey, setPageKey] = useState(0);

  const isFirstRender = useRef(true);
  const navigationTimer = useRef(null);
  const zoomRef = useRef(null);

  /* Measure whether this browser scales vh units under CSS zoom, and
     compensate so full-screen sections still fill the screen. */
  useLayoutEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);

    const apply = () => {
      const el = zoomRef.current;
      if (!el) return;

      if (!mq.matches) {
        el.style.removeProperty("--rcs-vh-comp");
        return;
      }

      const probe = document.createElement("div");
      probe.setAttribute("aria-hidden", "true");
      probe.style.cssText = `position:fixed;left:-9999px;top:0;width:10px;height:100vh;zoom:${DESKTOP_ZOOM};visibility:hidden;pointer-events:none;`;
      document.body.appendChild(probe);
      const ratio = probe.getBoundingClientRect().height / window.innerHeight;
      document.body.removeChild(probe);

      // ratio is ~0.75 when vh is scaled by zoom, ~1 when it is not.
      const comp =
        ratio > 0.5 && ratio < 0.95 ? Math.min(1.5, 1 / ratio) : 1;

      el.style.setProperty("--rcs-vh-comp", String(comp));

      // let ScrollTrigger / the 3D canvas re-measure
      window.dispatchEvent(new Event("resize"));
    };

    apply();

    if (mq.addEventListener) {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }

    mq.addListener(apply);
    return () => mq.removeListener(apply);
  }, []);

  useEffect(() => {
    // Initial website load.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      window.scrollTo(0, 0);
      return;
    }

    // Cancel any previous timer.
    if (navigationTimer.current) {
      window.clearTimeout(navigationTimer.current);
    }

    // Immediately reset scroll when the route changes.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    // Show the loader for the new page.
    setPageKey((previousKey) => previousKey + 1);
    setLoading(true);

    navigationTimer.current = window.setTimeout(() => {
      setLoading(false);
      navigationTimer.current = null;
    }, 1000);

    return () => {
      if (navigationTimer.current) {
        window.clearTimeout(navigationTimer.current);
      }
    };
  }, [location.pathname, location.search, location.hash]);

  return (
    <>
      <style>{ZOOM_CSS}</style>

      {/* Zoomed on desktop only. Everything that is part of the page lives here. */}
      <div
        ref={zoomRef}
        className="rcs-app-zoom bg-[#F5F2EA] text-[#111111]"
      >
        <ScrollToTop />

        <Navbar />

        <main>
          <AppRoutes />
        </main>

        <Footer />
      </div>

      {/* Overlays stay at 100% so pointer tracking and full-screen cover are exact. */}
      <div className="text-[#111111]">
        <CustomCursor />

        {loading && (
          <LoadingScreen
            key={pageKey}
            onComplete={() => setLoading(false)}
          />
        )}
      </div>
    </>
  );
}