/* src/modules/public/components/home/AboutPreview.tsx */
import { Link } from 'react-router-dom';
import { UserCheck, Building2, Heart } from 'lucide-react';

const VALUES = [
  { icon: <UserCheck className="w-5 h-5" />, title: 'সদস্যকেন্দ্রিক', desc: 'প্রতিনিয়ত সদস্যের স্বার্থে কাজ করি' },
  { icon: <Building2 className="w-5 h-5" />, title: 'স্বচ্ছ পরিচালনা', desc: 'খোলা খাতাপত্র ও নিয়মিত হিসাব রক্ষা' },
  { icon: <Heart className="w-5 h-5" />, title: 'সামাজিক দায়বদ্ধতা', desc: 'দরিদ্র কুটির শিল্প ও ক্ষুদ্র ব্যবসায়ের উন্নয়ন' },
];

export default function AboutPreview() {
  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: text */}
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[hsl(160,84%,19%)] mb-3">
              আমাদের সম্পর্কে
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-5 leading-tight">
              আল আমিন সমিতি —<br />
              <span className="text-[hsl(160,84%,19%)]">বিশ্বস্ততার নাম</span>
            </h2>
            <p className="text-slate-600 text-base leading-relaxed mb-6">
              আল আমিন সমিতি একটি শরিয়ত-সম্মত মাইক্রোফাইন্যান্স সহযোগিতামূলক প্রতিষ্ঠান,
              যা বাংলাদেশের গ্রামীণ ও শহুরে অংশে কাজ করে যাচ্ছে। আমাদের প্রধান লক্ষ্য হলো
              আর্থিকভাবে দুর্বল মানুষকে সুদমুক্ত ঋণ, সঞ্চয় সেবা এবং সামাজিক নিরাপত্তা
              নিশ্চিত করা — যাতে তারা তাদের জীবনমান উন্নত করতে পারে।
            </p>
            <p className="text-slate-600 text-base leading-relaxed mb-8">
              আজকের দিনে আমরা hundreds of সদস্যদের সাথে কাজ করছি, তাদের ক্ষুদ্র ব্যবসা
              বা চাহিদা পূরণে সহায়তা করছি। আমাদের সব কার্যকলাপ ইসলামী শরিয়তের
              নীতিমালা অনুসারে পরিচালিত হয়।
            </p>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-semibold
                         text-[hsl(160,84%,19%)] hover:text-emerald-700 transition-colors
                         border-b-2 border-[hsl(160,84%,19%)] pb-0.5"
            >
              বিস্তারিত জানুন
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Right: value cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map(v => (
              <div
                key={v.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100
                           hover:shadow-md hover:border-emerald-200 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center
                                text-[hsl(160,84%,19%)] mb-4">
                  {v.icon}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1.5">{v.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
            {/* Stats card */}
            <div className="col-span-1 sm:col-span-2 bg-[hsl(160,84%,19%)] rounded-2xl p-6 text-white">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">XXX+</div>
                  <div className="text-[11px] text-emerald-200 mt-1">সদস্য</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">২০১৮</div>
                  <div className="text-[11px] text-emerald-200 mt-1">সন্দৰ্ভ</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">১০০%</div>
                  <div className="text-[11px] text-emerald-200 mt-1">শরিয়ত-সম্মত</div>
                </div>
              </div>
              <p className="text-[11px] text-emerald-300 mt-4 text-center italic">
                * তথ্য আপডেটের জন্য যোগাযাগ করুন
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
