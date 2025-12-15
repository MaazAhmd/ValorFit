import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import LandingPage from "./pages/Landing/LandingPage";

export default function App() {
  return (
    <BrowserRouter>
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight">T-Shirt Studio</Link>
        <nav className="flex gap-2">
          <Link to="/auth/login" className="px-4 py-1.5 rounded-full border text-sm font-medium">Login</Link>
          <Link to="/auth/register" className="px-4 py-1.5 rounded-full border text-sm font-medium">Sign up</Link>
        </nav>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
