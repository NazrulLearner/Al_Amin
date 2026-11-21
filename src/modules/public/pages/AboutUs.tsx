/* src/modules/public/pages/AboutUs.tsx */
import PublicLayout from '../components/layout/PublicLayout';
import { ShieldCheck, Users, Scale, HandHeart, Star, Award } from 'lucide-react';

const TEAM_VALUES = [
  { icon: <ShieldCheck className="w-5 h-5" />, title: 'স্বচ্ছতা', desc: 'প্রতিটি লেনদেন ও সিদ্ধান্তে সম্পূর্ণ স্বচ্ছতা বজায় রাখি' },
  { icon: <Scale className="w-5 h-5" />, title: 'ন্যায়বিচার', desc: 'সদস্যদের প্রতি সমান আচরণ ও সুযোগ নিশ্চিত করি' },
  { icon: <HandHeart className="w-5 h-5" />, title: 'সহযোগিতা', desc: 'একসাথে এগিয়ে যাওয়ার মনোভাবই আমাদের শক্তি' },
  { icon: <Award className="w-5 h-5" />, title: 'মান নির্ভর', desc: 'আন্তর্জাতিক মানের সেবা দিতে প্রতিশ্রুতিবদ্ধ' },
];

const MILESTONES = [
  { year: '২০১৮', event: 'প্রতিষ্ঠা' },
  { year: '২০১৯', event: 'প্রথম ইউনিট শুরু' },
  { year: '২০২০', event: 'ডিজিটাল প্ল্যাটফর্ম চালু' },
  { year: '২০২২', event: 'আঞ্চলিক সম্প্রসারণ' },
  { year: '২০২৪', event: 'XXX+ সদস্যে পৌঁছানো' },
];

export default function AboutUsPage() {
  return (
    <PublicLayout>

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-[hsl(160,84%,9%)] to-emerald-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-300 mb-2 block">
            আমাদের সম্পর্কে
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">আল আমিন সমিতি</h1>
          <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
            ইসলামী শরিয়ত-সম্মত অর্থ সহায়তা — সদস্যদের সচ্ছন্দ ও সমৃদ্ধিতে নিয়োজিত।
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
              <h2 className="text-lg font-bold text-[hsl(160,84%,19%)] mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" /> আমাদের লক্ষ্য
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                আল আমিন সমিতির প্রধান লক্ষ্য হলো বাংলাদেশের গ্রামীণ ও শহুরে অঞ্চলে
                সুদমুক্ত আর্থিক সেবা পৌঁছে দেওয়া। আমরা বিশ্বাস করি যে প্রতিেক মানুষ
                ন্যায় ও স্বচ্ছ পদ্ধতিতে ঋণগ্রহণ ও সঞ্চয় করার অধিকার রাখে।
                আমাদের মাধ্যমে ছোট ব্যবসা, শিক্ষা, স্বাস্থ্য ও সামাজিক উন্নয়নে
                সদস্যদের সক্ষম করতে চাই।
              </p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-8 border border-orange-100">
              <h2 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
                <HandHeart className="w-5 h-5" /> আমাদের ভিশন
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                একটা সমৃদ্ধ সমাজ গঠন করা যেখানে প্রতিেক পরিবার
                আর্থিক নিরাপত্তা সহকারে বাঁচে, যুবকদের উদ্যোক্তা হতে সক্ষম হয়,
                এবং নারী-পুরুষ ভেদে সকলে সমান সুযোগ পায়। আমরা শরিয়ত-সম্মত
                আদর্শ নিয়ে কাজ করি — সুদমুক্ত, ন্যায়বিচার ও পারস্পরিক সহযোগিতামূলক।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[hsl(160,84%,19%)] mb-3">
              মূলনীতি
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">আমাদের মূল্যবোধ</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM_VALUES.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[hsl(160,84%,19%)] mb-4">
                  {v.icon}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-2">{v.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline / Milestones */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[hsl(160,84%,19%)] mb-3">
              যাত্রাপথ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">আমাদের ইতিহাস</h2>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-6 left-0 right-0 h-0.5 bg-emerald-100" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {MILESTONES.map(m => (
                <div key={m.year} className="relative text-center">
                  <div className="w-12 h-12 rounded-full bg-[hsl(160,84%,19%)] text-white font-bold text-sm flex items-center justify-center mx-auto mb-4 relative z-10 shadow-md">
                    {m.year}
                  </div>
                  <p className="text-sm font-medium text-slate-700">{m.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership note */}
      <section className="py-16 bg-emerald-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="w-10 h-10 text-emerald-400 mx-auto mb-5" />
          <blockquote className="text-lg italic leading-relaxed text-emerald-100 mb-6">
            "আমাদের সমিতির প্রতিটি পদক্ষেপ সদস্যদের কল্যাণ ও সমাজের উন্নয়নের
            মধ্যে দিয়েই পরিমাপ করা হয়। আমরা কেবল অর্থ দেই না — আমরা বিশ্বাস
            তৈরি করি।"
          </blockquote>
          <p className="text-sm text-emerald-300 font-medium">— পরিচালনা কমিটি, আল আমিন সমিতি</p>
        </div>
      </section>

    </PublicLayout>
  );
}
