import { Link } from "react-router-dom";
import { useEffect } from "react";

export default function Landing() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 text-gray-800 font-sans">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center flex-wrap">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-700 to-green-500 flex items-center justify-center shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="0 0 24 24"
                className="w-6 h-6"
              >
                <path d="M12 2L2 7v3c0 6 4 10 10 12 6-2 10-6 10-12V7l-10-5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-green-800">
                Al-Amin Somity
              </h1>
              <p className="text-sm text-green-600">
                Islamic Microfinance Cooperative
              </p>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex gap-3 mt-3 sm:mt-0">
            <Link
              to="/login"
              className="border-2 border-green-600 text-green-700 px-5 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
            >
              Member Login
            </Link>
            <Link
              to="/CreateAdmin"
              className="bg-gradient-to-br from-green-600 to-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow hover:scale-[1.02] transition"
            >
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-green-800 mb-4 leading-tight">
          Empowering Communities Through <br /> Islamic Finance
        </h2>
        <p className="text-lg md:text-xl text-green-700 max-w-2xl mx-auto mb-10">
          Shariah-compliant cooperative financial services for economic growth
          and social welfare in your community.
        </p>

        <button className="bg-white/70 backdrop-blur-md border border-green-300 text-green-800 px-6 py-3 rounded-lg font-medium shadow hover:bg-white hover:shadow-lg transition">
          📱 Install App
        </button>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/40 hover:-translate-y-1 transition">
            <div className="w-16 h-16 mx-auto bg-green-50 text-green-700 rounded-full flex items-center justify-center text-3xl mb-4">
              🕌
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Islamic Principles
            </h3>
            <p className="text-gray-600">
              All financial services follow Islamic Shariah — ethical and
              interest-free.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/40 hover:-translate-y-1 transition">
            <div className="w-16 h-16 mx-auto bg-green-50 text-green-700 rounded-full flex items-center justify-center text-3xl mb-4">
              🤝
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Community Focus
            </h3>
            <p className="text-gray-600">
              We promote growth and unity by supporting every member equally.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/40 hover:-translate-y-1 transition">
            <div className="w-16 h-16 mx-auto bg-green-50 text-green-700 rounded-full flex items-center justify-center text-3xl mb-4">
              📈
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Growth & Prosperity
            </h3>
            <p className="text-gray-600">
              Shared profit model that ensures collective success of all
              members.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-green-800 to-green-900 text-white mt-16">
        <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-green-200">
              About Somity
            </h3>
            <p className="text-green-100 text-sm leading-relaxed">
              Al-Amin Somity provides Islamic microfinance solutions to empower
              local communities through interest-free, ethical financial
              services.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-green-200">
              Quick Links
            </h3>
            <ul className="space-y-2 text-green-100 text-sm">
              <li>Membership Application</li>
              <li>Loan Calculator</li>
              <li>Financial Education</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-green-200">
              Contact Us
            </h3>
            <ul className="space-y-2 text-green-100 text-sm">
              <li>📍 Dhaka, Bangladesh</li>
              <li>📞 +880-1234-567890</li>
              <li>✉️ info@alaminsomity.org</li>
            </ul>
          </div>
        </div>
        <div className="text-center py-4 text-green-300 text-sm border-t border-green-700/60">
          © {new Date().getFullYear()} Al-Amin Somity — Shariah Compliant |
          All Rights Reserved
        </div>
      </footer>
    </div>
  );
}
