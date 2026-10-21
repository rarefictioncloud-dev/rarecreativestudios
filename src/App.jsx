import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";
import LoadingScreen from "./components/LoadingScreen";
import CustomCursor from "./components/CustomCursor";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [pageKey, setPageKey] = useState(0);

  const isFirstRender = useRef(true);
  const navigationTimer = useRef(null);

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
    <div className="min-h-screen bg-[#F5F2EA] text-[#111111]">
      <ScrollToTop />

      <Navbar />

      <main>
        <AppRoutes />
      </main>

      <Footer />

      <CustomCursor />

      {loading && (
        <LoadingScreen
          key={pageKey}
          onComplete={() => setLoading(false)}
        />
      )}
    </div>
  );
}