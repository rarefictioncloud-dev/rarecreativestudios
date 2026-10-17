import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";

const NAV_LINKS = [

  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Contact", path: "/contact" }

];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-5 sm:px-6 md:pt-7">
      <nav
        className="
          relative mx-auto flex h-[58px] max-w-[1080px]
          items-center justify-between
          rounded-full border border-white/[0.12]
          bg-[#090909]/90 px-4
          shadow-[0_8px_35px_rgba(0,0,0,0.35)]
          backdrop-blur-2xl
          transition-all duration-300
          sm:px-6 md:h-[64px] md:px-7
        "
      >
        {/* BRAND LOGO */}
        <Link
          to="/"
          onClick={closeMenu}
          aria-label="Rare Creative Studios home"
          className="group flex shrink-0 items-center"
        >
          <span className="text-[14px] font-black uppercase tracking-[-0.075em] sm:text-[16px]">
            <span className="text-white">RARE</span>
            <span className="text-[#0756BD]"> CREATIVE STUDIOS</span>
            <span className="text-[#0756BD]">.</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="ml-auto hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative rounded-full px-3.5 py-2
                  text-[13px] font-medium
                  transition-all duration-300
                  lg:px-4 lg:text-sm
                  ${
                    active
                      ? "bg-white/[0.09] text-white"
                      : "text-white/60 hover:bg-white/[0.05] hover:text-white"
                  }
                `}
              >
                {item.label}

                {active && (
                  <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#0756BD]" />
                )}
              </Link>
            );
          })}

          {/* CONTACT CTA */}
          <Link
            to="/letsconnect"
            className="
              group ml-3 flex items-center gap-2
              rounded-full bg-[#0756BD]
              px-4 py-2.5 text-[13px] font-semibold
              text-white
              transition-all duration-300
              hover:bg-white hover:text-black
              active:scale-95
              lg:ml-4 lg:px-5 lg:text-sm
            "
          >
            Let's connect

            <ArrowUpRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          className="
            flex h-9 w-9 items-center justify-center
            rounded-full border border-white/10
            bg-white/[0.04] text-white
            transition-colors duration-300
            hover:bg-[#0756BD] md:hidden
          "
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </nav>

      {/* MOBILE NAVIGATION */}
      <div
        className={`
          mx-auto mt-2 max-w-[1080px] overflow-hidden
          rounded-[24px] border border-white/10
          bg-[#090909]/95 shadow-2xl backdrop-blur-2xl
          transition-all duration-300 ease-out md:hidden
          ${
            open
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-2 opacity-0"
          }
        `}
        style={{
          maxHeight: open ? "400px" : "0px",
        }}
      >
        <div className="p-3">
          {NAV_LINKS.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`
                  flex min-h-12 items-center justify-between
                  rounded-xl px-4 text-sm font-medium
                  transition-colors duration-200
                  ${
                    active
                      ? "bg-[#0756BD]/10 text-white"
                      : "text-white/65 hover:bg-white/[0.04] hover:text-white"
                  }
                `}
              >
                {item.label}

                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0756BD]" />
                )}
              </Link>
            );
          })}

          <Link
            to="/letsconnect"
            onClick={closeMenu}
            className="
              mt-2 flex h-11 items-center justify-center gap-2
              rounded-full bg-[#0756BD]
              text-sm font-semibold text-white
              transition-colors duration-300
              hover:bg-white hover:text-black
            "
          >
            Let's connect
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}