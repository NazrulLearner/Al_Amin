/* src/modules/public/components/home/HeroSection.tsx */
import { Link } from 'react-router-dom';
import { ArrowRight, Users, HandHeart, Scale } from 'lucide-react';

const FEATURES = [
  {
    icon: <Users className="w-5 h-5" />,
    title: 'সদস্বত্‌ব্যবস্র',
    desc: 'পরস্পর সন্ধা ও সহযোগিতামূলক সদস্যত্‌ব্যবস্থাত মজবুত ভিত্তি',
  },
  {
    icon: <HandHeart className="w-5 h-5" />,
    title: 'হিনা যৌগ',
    desc: 'কোনো সুদ নাই — হিনা ভিতিতে আরও কুলনীয় ঋণ সেবাত লভযোগী',
  },
  {
    icon: <Scale className="w-5 h-5" />,
    title: 'সুফলভাগী কর',
    desc: 'বাংলাদেশের আন্তর্জাতিক মানের প্রমাণীকরণ ও স্বচ্ছ হিসাব-নিকাশ',
  },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(160,84%,9%)] via-[hsl(160,84%,14%)] to-emerald-900 text-white">

      {/* Decorative shapes */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
      </div>

      {/* Islamic pattern overlay (subtle) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Text content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-emerald-100 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              বাংলাদেশের বিশ্বস্ত শরিয়ত-সম্মত সমিতি
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              আল আমিন
              <span className="block text-emerald-300">আর্থিক সহযােগিতা</span>
              <span className="block text-lg sm:text-xl font-medium text-slate-300 mt-2">
                সুদমুক্ত · স্বচ্ছ · সদস্যাঞ্চলের কল্যাণে
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              আল আমিন সমিতি একটি শরিয়ত-সম্মত মাইক্রোফাইন্যান্স প্রতিষ্ঠান।
              আমরা সাধারণ মানুষকে ছোট ঝুঁকিতে বড় স্বপ্ন পূরণ করতে সাহায্য করি —
              কোনো সুদ ছাড়াই, পরস্পরের উপর নির্ভরশীল হয়ে।
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl
                           bg-accent text-slate-900 font-semibold text-sm
                           hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/30
                           hover:-translate-y-0.5"
              >
                এখনই যোগ দিন
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl
                           border border-white/25 text-white font-semibold text-sm
                           hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                আরও জানুন
              </Link>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="group bg-white/10 backdrop-blur-md border border-white/15
                           rounded-2xl p-5 hover:bg-white/15 transition-all duration-300
                           hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center
                                text-emerald-300 mb-4 group-hover:bg-accent group-hover:text-slate-900 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 50C840 60 960 70 1080 65C1200 60 1320 40 1380 30L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
