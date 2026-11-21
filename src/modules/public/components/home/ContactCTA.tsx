/* src/modules/public/components/home/ContactCTA.tsx */
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const CONTACT_METHODS = [
  { icon: <Phone className="w-5 h-5" />, label: '+880-1XXX-XXXXXX', desc: 'সকাল ৯টা - সন্ধ্যা ৬টা' },
  { icon: <Mail className="w-5 h-5" />, label: 'info@alaminsomity.org', desc: 'ইমেইলে জানতে পারেন' },
  { icon: <MapPin className="w-5 h-5" />, label: 'এলাকা / ইউনিট অফিস', desc: 'যোগাযোগ করুন' },
];

export default function ContactCTA() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: text */}
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-emerald-400 mb-3">
              যোগাযোগ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mb-5 leading-tight">
              আপনার কোনো প্রশ্ন আছে?<br />
              <span className="text-emerald-400">আমাদের সাথে কথা বলুন</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              আল আমিন সমিতির সদস্য হতে চাইলে, কোনো ধার নেওয়ার নিয়ম-কানুন জানতে চাইলে,
              বা অন্য কোনো বিষয়ে জানতে চাইলে—আপনি যেকোনো সময় আমাদের সাথে যোগাযোগ করতে পারেন।
              আমরা সবসময় আপনাদের সেবায় প্রস্তুত।
            </p>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl
                         bg-[hsl(160,84%,19%)] text-white font-semibold text-sm
                         hover:bg-[hsl(160,84%,16%)] transition-all shadow-lg shadow-green-900/40
                         hover:-translate-y-0.5"
            >
              ইন্টারনেটে ফর্ম পাঠান
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Right: contact methods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONTACT_METHODS.map(c => (
              <div
                key={c.label}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center
                                text-emerald-400 mb-4">
                  {c.icon}
                </div>
                <div className="text-sm font-semibold text-white mb-1">{c.label}</div>
                <div className="text-[11px] text-slate-400">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
