/* src/modules/public/components/home/ActivitiesPreview.tsx */
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, ShieldCheck, Users } from 'lucide-react';

const ACTIVITIES = [
  {
    icon: <Wallet className="w-6 h-6" />,
    title: 'হিনা ঋণ প্রদান',
    desc: 'কোনো সুদ ছাড়াই ছোট ঋণ দিয়ে ব্যবসা সম্প্রসারণ ও জরুরি চাহিদা পূরণে সহায়তা',
    color: 'emerald',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'সঞ্চয় যোজনা',
    desc: 'নিরাপদ ও সুবিধাজনক সঞ্চয় সেবা — সদস্যরা নিয়মিত ভাউচার জমিয়ে ভবিষ্যৎয়ের জন্য তৈরি থাকে',
    color: 'blue',
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'আর্থিক শিক্ষা',
    desc: 'ব্যবস্থাপনা, হিসাবরক্ষণ ও লেনদেন বিষয়ক প্রশিক্ষণ দিয়ে সদস্যদের সক্ষম করি',
    color: 'amber',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'সাম্প্রদায়িক উন্নয়ন',
    desc: 'সামাজিক সচেতনতা, স্বাস্থ্য ও শিক্ষা বিষয়ক কর্মকাণ্ডে সদস্যদের সক্রিয় অংশগ্রহণ নিশ্চিত',
    color: 'purple',
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  blue:    { bg: 'bg-blue-50',     text: 'text-blue-700',     ring: 'ring-blue-200' },
  amber:   { bg: 'bg-amber-50',    text: 'text-amber-700',    ring: 'ring-amber-200' },
  purple:  { bg: 'bg-purple-50',   text: 'text-purple-700',   ring: 'ring-purple-200' },
};

export default function ActivitiesPreview() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[hsl(160,84%,19%)] mb-3">
            কার্যক্রম সমূহ
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            আমরা কি কি করে থাকি
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            আল আমিন সমিতির সকল কার্যক্রম শরিয়ত-সম্মত নীতিমালা অনুযায়ী পরিচালিত হয়।
            আমরা সদস্যদের আর্থিকভাবে স্বাবলম্বী করতে বিভিন্ন সেবা প্রদান করি।
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACTIVITIES.map(a => {
            const c = COLOR_MAP[a.color];
            return (
              <div
                key={a.title}
                className={`group relative bg-white rounded-2xl p-6 border border-slate-100
                            shadow-sm hover:shadow-lg transition-all duration-300
                            hover:-translate-y-1 ${c.ring} hover:ring-2`}
              >
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center
                                 ${c.text} mb-5 group-hover:scale-110 transition-transform`}>
                  {a.icon}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-2">{a.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{a.desc}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            to="/activities"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
                       bg-slate-50 text-slate-700 border border-slate-200
                       hover:bg-[hsl(160,84%,19%)] hover:text-white hover:border-[hsl(160,84%,19%)]
                       transition-all duration-200"
          >
            সকল কার্যক্রম দেখুন
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
