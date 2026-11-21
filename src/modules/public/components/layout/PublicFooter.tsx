/* src/modules/public/components/layout/PublicFooter.tsx */
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'হোম',         href: '/' },
  { label: 'আমাদের সম্পর্কে', href: '/about' },
  { label: 'কার্যক্রম',   href: '/activities' },
  { label: 'প্রশ্নোত্তর', href: '/faq' },
  { label: 'যোগাযোগ',   href: '/contact' },
  { label: 'গোপনীয়তা ও শর্তাবলি', href: '/privacy-terms' },
];

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">

      {/* CTA strip */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                আল আমিন সমিতির সাথে যুক্ত হোন
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                শরিয়ত-সম্মত সুদমুক্ত আর্থিক সেবা — সদীগ্‌ সদস্যদের কল্যাণ ও সমৃদ্ধিতায় নিয়োজিত।
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <a
                href="tel:+8801XXXXXXXXX"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg
                           text-sm font-semibold bg-[hsl(160,84%,19%)] text-white
                           hover:bg-[hsl(160,84%,16%)] transition-colors shadow-lg shadow-green-900/30"
              >
                <Phone className="w-4 h-4" />
                যোগাযোগ করুন
              </a>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg
                           text-sm font-semibold border border-slate-600 text-slate-200
                           hover:border-[hsl(160,84%,19%)] hover:text-white transition-colors"
              >
                লগইন করুন
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[hsl(160,84%,19%)] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-base">আল আমিন সমিতি</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              বাংলাদেশের একটি শরিয়ত-সম্মত মাইক্রোফাইন্যান্স সহযোগিতামূলক প্রতিষ্ঠান।
              সদস্যদের স্বাবলম্বী করতে কাজ করে যাচ্ছি।
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">পেজসমূহ</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-xs text-slate-400 hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">যোগাযোগ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-xs text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>ইউনিট / অফিস ঠিকানা</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-slate-400">
                <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>+880-1XXX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-slate-400">
                <Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>info@alaminsomity.org</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">আইনগত</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/privacy-terms" className="text-xs text-slate-400 hover:text-emerald-400 transition-colors">
                  গোপনীয়তা নীতিমালা
                </Link>
              </li>
              <li>
                <Link to="/privacy-terms#terms" className="text-xs text-slate-400 hover:text-emerald-400 transition-colors">
                  ব্যবহারের শর্তাবলি
                </Link>
              </li>
            </ul>
            <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
              সমিতি বাংলাদেশের সংশ্লিষ্ট আইন অনুযায়ী নিবন্ধিত। সকল কার্যক্রম শরিয়ত-পরিশোধিত।
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} আল আমিন সমিতি — সকল অধিকার সংরক্ষিত
          </p>
          <p className="text-[11px] text-slate-600">
            শরিয়ত-সম্মত সুদমুক্ত আর্থিক সহযোগিতা
          </p>
        </div>
      </div>
    </footer>
  );
}
