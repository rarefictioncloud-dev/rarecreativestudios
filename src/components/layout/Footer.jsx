import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-6 py-8 text-white">
      <div className="mx-auto flex max-w-[1470px] flex-col items-center justify-between gap-4 sm:flex-row">
        <Link to="/" className="text-lg font-black tracking-tight">
          <span className="text-white"></span>
          <span className="text-[#0756BD]"> </span>
        </Link>

        <p className="text-center text-sm text-white/45">
          © {new Date().getFullYear()} 
        </p>
      </div>
    </footer>
  );
}