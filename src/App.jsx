import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main>
        <AppRoutes />
      </main>

      <Footer />
    </div>
  );
}