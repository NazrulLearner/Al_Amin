/* src/modules/public/components/layout/PublicHeader.tsx */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../constants/nav';
import { ShieldCheck, Menu, X } from 'lucide-react';

export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navActive = (href: string) =>
    location.pathname === href
      ? 'text-[hsl(160,84%,19%)] font-semibold'
      : 'text-slate-500 hover:text-[hsl(160,84%,19%)] transition-colors';

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[hsl(160,84%,19%)] flex items-center justify-center shadow-md shadow-green-900/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-800 tracking-tight block leading-none">
                আল আমিন সমিতি
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase leading-none">
                Islamic Microfinance
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${navActive(item.href)}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Login button */}
          <div className="hidden md:block">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
                         bg-[hsl(160,84%,19%)] text-white
                         hover:bg-[hsl(160,84%,16%)] transition-all duration-200
                         shadow-md shadow-green-900/20 hover:shadow-lg hover:-translate-y-0.5"
            >
              লগইন
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {open
              ? <X className="w-5 h-5" />
              : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white shadow-lg">
          <nav className="px-4 py-3 space-y-0.5">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm transition-colors ${navActive(item.href)}`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block mt-3 mx-4 px-4 py-3 rounded-lg text-sm font-semibold text-center
                         bg-[hsl(160,84%,19%)] text-white hover:bg-[hsl(160,84%,16%)] transition-colors"
            >
              লগইন
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
