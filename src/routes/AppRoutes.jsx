import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Services from "../pages/Services";
import LetsConnect from "../pages/LetsConnect";
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/about" element={<About />} />

      <Route path="/services" element={<Services />} />

      <Route path="/contact" element={<Contact />} />

      <Route path="/letsconnect" element={<LetsConnect />} />
    </Routes>
  );
}