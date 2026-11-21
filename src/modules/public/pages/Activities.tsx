/* src/modules/public/pages/Activities.tsx */
import PublicLayout from '../components/layout/PublicLayout';
import { Wallet, TrendingUp, ShieldCheck, Users, BookOpen, HeartPulse, GraduationCap, Home } from 'lucide-react';

interface ActivityItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  details: string[];
  color: string;
  bg: string;
  ring: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    icon: <Wallet className="w-6 h-6" />,
    title: 'হিনা ঋণ',
    desc: 'সুদমুক্ত ছোট ঋণ পরিকল্পনা — ব্যবসা সম্প্রসারণ, জরুরি খরচ ও সামাজিক চাহিদা পূরণে সহায়তা।',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-200',
    details: [
      'ছোট ও ক্ষুদ্র ব্যবসার জন্য হিনা ভিত্তিক ঋণ',
      'কোনো সুদ নেই — শুধুমাত্র মুনাফা ভাগাভাগি',
      'নমনীয় পরিশোধ সময়সীমা',
      'উচ্চ স্বচ্ছতা ও নিম্ন অপারেটিং খরচ',
    ],
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'সঞ্চয় যোজনা',
    desc: 'নিরাপদ ও লাভজনক সঞ্চয় পদ্ধতি — সদস্যরা নিয়মিত ভাউচার জমা দিয়ে ভবিষ্যতের জন্য প্রস্তুত থাকে।',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    ring: 'ring-blue-200',
    details: [
      'নিয়মিত সঞ্চয় খাতা (সাপ্তাহিক / মাসিক)',
      'লাভের একটি অংশ সঞ্চয়কারীদের মধ্যে বিভাজন',
      'আন্‌লাইন ও মোবাইল থেকে সঞ্চয় দেখা যায়',
      'জরুরি অবস্থায় আংশিক তোলা যায়',
    ],
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'আরথিক শিক্ষা',
    desc: 'ব্যবস্থাপনা, হিসাবরক্ষণ, লেনদেন বিষয়ক প্রশিক্ষণ — সদস্যদের সক্ষম করি।',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    ring: 'ring-amber-200',
    details: [
      'ব্যবসায়িক পরিকল্পনা ও হিসাব রক্ষণ',
      'ঋণ ব্যবস্থাপনা ও ঝুঁকি মূল্যায়ন',
      'নারী উদ্যোক্তা বিশেষ প্রশিক্ষণ',
      'শরিয়াহ-সম্মত আর্থিক নীতিমালা বুঝতে সাহায্য',
    ],
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'শিক্ষা সহায়তা',
    desc: 'সদস্যদের সন্তানদের শিক্ষা খরচ কমানো ও মেধাবী শিক্ষার্থীদের সাহায্য।',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    ring: 'ring-purple-200',
    details: [
      'প্রাথমিক ও মাধ্যমিক শিক্ষার্থীদের ফি সহায়তা',
      'মেধাবী ছাত্র-ছাত্রীদের বৃত্তি প্রদান',
      'টেক্সটবুক ও পড়াশোনার সরঞ্জাম সাহায্য',
    ],
  },
  {
    icon: <HeartPulse className="w-6 h-6" />,
    title: 'স্বাস্থ্য সচেতনতা',
    desc: 'সামাজিক স্বাস্থ্য ও চিকিৎসা সচেতনতামূলক কর্মকাণ্ড পরিচালনা।',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    ring: 'ring-rose-200',
    details: [
      'মৌলিক স্বাস্থ্য শিবির ও সচেতনতামূলক সভা',
      'মাতৃস্বাস্থ্য ও শিশুদের টীকাকরণ তথ্য',
      'দরিদ্র সদস্যদের চিকিৎসা খরচে সাহায্য',
    ],
  },
  {
    icon: <Home className="w-6 h-6" />,
    title: 'বাসস্থান উন্নয়ন',
    desc: 'দরিদ্র ও মধ্যবিত্ত পরিবারের জন্য বাসস্থান উন্নয়নে আর্থিক ও পরামর্শ সহায়তা।',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    ring: 'ring-teal-200',
    details: [
      'বাড়ি সংস্কার ও সম্প্রসারণে ঋণ সহায়তা',
      'নিরাপদ পানি ও আবাসন পরামর্শ',
      'টেকসই বাসস্থান নির্মাণে শ্রেণিক্ষেত্র সহায়তা',
    ],
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'সামাজিক উন্নয়ন',
    desc: 'সাম্প্রদায়িক কল্যাণ, নারী সক্ষমকরণ ও যুব উন্নয়ন কর্মকাণ্ড।',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    ring: 'ring-indigo-200',
    details: [
      'নারী উদ্যোক্তা তহবিল ও নেটওয়ার্কিং',
      'যুব প্রশিক্ষণ ও দক্ষতা বিকাশ',
      'সামাজিক সচেতনতামূলক অভিযান',
      'দুর্যোগকালীন ত্রাণ ও পুনর্বাসন',
    ],
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'বীমা ও ঝুঁকি সুরক্ষা',
    desc: 'সদস্যদের জীবন ও স্বাস্থ্য সুরক্ষায় শরিয়াহ-সম্মত বীমা ব্যবস্থা।',
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    ring: 'ring-slate-200',
    details: [
      'সীমিত জীবন বীমা সহায়তা (তাওয়ায্জু ভিত্তিক)',
      'অপরিহার্য দুর্ঘটনায় আর্থিক সহায়তা',
      'ঝুঁকি মূল্যায়ন ও সচেতনতা কর্মসূচি',
    ],
  },
];

export default function ActivitiesPage() {
  return (
    <PublicLayout>

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-[hsl(160,84%,9%)] to-emerald-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-300 mb-2 block">
            কায়ক্রম সমূহ
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">আমাদের সব কায়ক্রম</h1>
          <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
            আল আমিন সমিতির সকল কায়ক্রম শরিয়াহ-সম্মত নীতিমালা অনুযায়ী পরিচালিত হয়।
            আপনি আপনার প্রয়োজন অনুযায়ী যেকোনো সেবা নিতে পারবেন।
          </p>
        </div>
      </div>

      {/* Activities list */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ACTIVITIES.map(a => (
              <div
                key={a.title}
                className={`bg-white rounded-2xl p-7 border border-slate-100 hover:shadow-lg
                            transition-all duration-300 hover:-translate-y-0.5`}
              >
                <div className={`w-12 h-12 rounded-xl ${a.bg} ${a.color} flex items-center justify-center mb-5`}>
                  {a.icon}
                </div>
                <h2 className="text-base font-bold text-slate-800 mb-2">{a.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-5">{a.desc}</p>
                <ul className="space-y-2">
                  {a.details.map(d => (
                    <li key={d} className="flex items-start gap-2 text-xs text-slate-600">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">যেকোনো কায়ক্রমে যোগ দিতে চান?</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            আমাদের যোগাযোগ বিভাগের সাথে কথা বলুন অথবা অনলাইন ফর্ম পাঠান।
            আমরা আপনার প্রয়োজনীয় কায়ক্রম বাছুতে সাহায্য করব।
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl
                       bg-[hsl(160,84%,19%)] text-white font-semibold text-sm
                       hover:bg-[hsl(160,84%,16%)] transition-colors shadow-md"
          >
            যোগাযোগ করুন
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>

    </PublicLayout>
  );
}
