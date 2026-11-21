/* src/modules/public/pages/FAQ.tsx */
import { useState } from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
  category: 'সাধারণ' | 'ঋণ' | 'সঞ্চয়' | 'সদস্য' | 'প্রযুক্তি';
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'সাধারণ',
    q: 'আল আমিন সমিতি কী?',
    a: 'আল আমিন সমিতি বাংলাদেশের একটি শরীয়ত-সম্মত মাইক্রোফাইন্যান্স সহযোগিতামূলক প্রতিষ্ঠান। এটি সুদমুক্ত হিনা ভিত্তিতে ঋণ প্রদান ও সঞ্চয় সেবা দিয়ে সাধারণ মানুষকে আর্থিকভাবে সক্ষম করতে কাজ করে। প্রতিটি লেনদেন ইসলামী শরীয়তের নীতিমালা অনুযায়ী পরিচালিত হয়।',
  },
  {
    category: 'সাধারণ',
    q: 'এটা কি সুদমুক্ত?',
    a: 'হ্যাঁ। আল আমিন সমিতির সকল ঋণ ও লেনদেন সম্পূর্ণ সুদমুক্ত। আমরা মুনাফা ভাগাভাগি (মুদারাবাহ) ও হিনা বিক্রয় (বাই আল হিনা) পদ্ধতিতে কাজ করি, যা ইসলামী শরীয়তে বৈধ। কোনো অবস্থাতেই সুদ বাribat কোনো ফার্ক গ্রহণ করা হয় না।',
  },
  {
    category: 'সাধারণ',
    q: 'সমিতির কার্যপদ্ধতি কেমন?',
    a: 'আমরা গ্রুপ মেথড বা দলগত পদ্ধতিতে কাজ করি। প্রতিটি সদস্য একটি গ্রুপে যুক্ত থাকেন এবং গ্রুপ মিট করে ঋণ পরিশোধ নিশ্চিত করেন। সকল সিদ্ধান্ত গ্রুপ সম্মতিক্রমে নেওয়া হয়। অগ্রিম প্রশিক্ষণ ও পরবর্তী মূল্যায়নের মাধ্যমে সদস্যদের সক্ষমতা বাড়ানো হয়।',
  },
  {
    category: 'সদস্য',
    q: 'কীভাবে সদস্য হতে পারব?',
    a: 'সদস্য হওয়ার জন্য আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে এবং স্থায়ী ঠিকানা থাকা জরুরি। নিকটস্থ ইউনিট অফিসে গিয়ে আবেদন ফর্ম পূরণ করুন, পরিচয়পত্র (জাতীয় পরিচয়পত্র / ইউনিয়ন পরিষদ পরিচয়পত্র) এবং দুই জন গ্যারান্টর প্রয়োজন। আবেদন পাওয়ার ৭-১৪ দিনের মধ্যে সিদ্ধান্ত জানানো হয়।',
  },
  {
    category: 'সদস্য',
    q: 'সদস্য হওয়ার নির্দিষ্ট যোগ্যতা কী?',
    a: '১) বয়স ১৮-৬০ বছরের মধ্যে, ২) স্থায়ী ঠিকানা, ৩) ছোট উদ্যোক্তা বা ব্যবসা-প্রতিবন্ধকতা রয়েছে, ৪) দুই জন বিশ্বস্ত গ্যারান্টর, ৫) ইচ্ছা ও শিখনোর মানসিকতা। বিশেষভাবে নারী, কৃষক ও দরিদ্র পরিবারকে প্রাধান্য দেওয়া হয়।',
  },
  {
    category: 'সদস্য',
    q: 'সদস্যতার কোনো সদস্যশুল্ক আছে কি?',
    a: 'হ্যাঁ, সদস্য হতে একটি মাত্রিক সদস্যশুল্ক ও সঞ্চয় খাতা তৈরির টাকা লাগে। এটি এককালীন এবং প্রতিটি সদস্যকে ন্যূনতম মাসিক সঞ্চয় করতে হয়। সঠিক পরিমাণ জানতে নিকটস্থ ইউনিটে যোগাযোগ করুন — এটি সময়ের সাথে পরিবর্তন হতে পারে।',
  },
  {
    category: 'ঋণ',
    q: 'কী ধরনের ঋণ পাওয়া যায়?',
    a: 'আমরা প্রধানত তিন প্রকার ঋণ দিই: ১) ব্যাপারি ঋণ — ছোট দোকান, খামার, পশুপালন ইত্যাদির জন্য, ২) জরুরি ঋণ — চিকিৎসা, শিক্ষা, আবাসন ইত্যাদির জন্য, ৩) উন্নয়ন ঋণ — স্থায়ী অবকাঠামো বা বড় বিনিয়োগের জন্য। সকল ঋণ সুদমুক্ত ও শরীয়ত-সম্মত।',
  },
  {
    category: 'ঋণ',
    q: 'ঋণ পাওয়ার শর্ত কী?',
    a: 'প্রথমে সদস্য হয়ে ন্যূনতম ৩-৬ মাস সঞ্চয় করতে হবে। তারপর গ্রুপের সদস্যরা গ্যারান্টি দেবেন। ঋণের পরিমাণ সঞ্চয়ের পরিমাণ ও পরিশোধ ক্ষমতার ওপর ভিত্তি করে নির্ধারণ করা হয়। প্রথমবারের ঋণ সাধারণত সীমিত থাকে এবং ধীরে ধীরে বাড়ানো হয়।',
  },
  {
    category: 'ঋণ',
    q: 'ঋণ পরিশোধের মেয়াদ কত?',
    a: 'ঋণের ধরন অনুযায়ী মেয়াদ ৩ মাস থেকে ১২ মাস পর্যন্ত হতে পারে। কৃষি ঋণের ক্ষেত্রে ফসল কাটার পরেও সময় দেওয়া হয়। প্রতিটি ঋণের জন্য মাসিক বা সাপ্তাহিক কিস্তিতে পরিশোধ করতে হয়। আগে থেকে পরিশোধ করলে কোনো অতিরিক্ত ফি লাগে না।',
  },
  {
    category: 'সঞ্চয়',
    q: 'সঞ্চয় করে কীভাবে উপকার পেতে পারি?',
    a: 'নিয়মিত সঞ্চয় করার মাধ্যমে আপনাদের সঞ্চয় খাতা বাড়ে এবং ঋণ পাওয়ার যোগ্যতা অর্জন করে। প্রতি বছর সঞ্চয়কৃত টাকার একটি অংশ মুনাফা হিসাবে সদস্যদের মধ্যে বন্টন করা হয়। তাছাড়া সঞ্চয়ই হলো ঋণের মূল ভিত্তি — যত বেশি সঞ্চয়, তত বেশি ঋণ পাওয়ার সুযোগ।',
  },
  {
    category: 'প্রযুক্তি',
    q: 'অ্যাপ বা অনলাইনে কিভাবে ব্যবহার করব?',
    a: 'আমাদের মোবাইল অ্যাপ্লিকেশন (PWA) রয়েছে যেখানে আপনি আপনার সঞ্চয় ও ঋণের তথ্য দেখতে পারবেন। লগইন করতে আপনার সদস্য আইডি ও পাসওয়ার্ড প্রয়োজন। অ্যাপ ডাউনলোডের জন্য নিকটস্থ ইউনিটে যোগাযোগ করুন অথবা ./welcome পৃষ্ঠা দেখুন।',
  },
  {
    category: 'প্রযুক্তি',
    q: 'আমার পাসওয়ার্ড ভুলে গেলে কী করব?',
    a: 'লগইন পেজে "পাসওয়ার্ড ভুলে গেছেন?" লিঙ্কে ক্লিক করুন। আপনার রেজিস্টার্ড মোবাইল নম্বর বা ইমেল আইডি-তে পাসওয়ার্ড রিসেটের সংযোগ পাঠানো হবে। যদি সমস্যা হয় তবে সরাসরি ইউনিট অফিসে যোগাযোগ করুন — তারা আপনার পরিচয় যাচাই করে নতুন পাসওয়ার্ড দিতে পারবেন।',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('সব');

  const categories = ['সব', 'সাধারণ', 'ঋণ', 'সঞ্চয়', 'সদস্য', 'প্রযুক্তি'];

  const filtered = FAQ_DATA.filter(f => {
    const matchCat = filter === 'সব' || f.category === filter;
    const matchSearch = !search || f.q.includes(search) || f.a.includes(search);
    return matchCat && matchSearch;
  });

  return (
    <PublicLayout>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[hsl(160,84%,9%)] to-emerald-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-300 mb-2 block">
            প্রশ্নোত্তর
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">সচরাচর জিজ্ঞাসিত প্রশ্নাবলি</h1>
          <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
            আমাদের সম্পর্কে আপনারা যে সব প্রশ্ন করেন, তার উত্তর এখানে পাবেন।
            যদি এখনও প্রশ্ন থাকে, তবে যোগাযোগ করুন।
          </p>
        </div>
      </div>

      <section className="py-12 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="প্রশ্ন খুঁজুন..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-sm
                        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                        bg-white shadow-sm"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  filter === cat
                    ? 'bg-[hsl(160,84%,19%)] text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ items */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400 text-sm">
                কোনো ফলাফল পাওয়া যায়নি
              </div>
            )}
            {filtered.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-xl border transition-all duration-200 ${
                    isOpen ? 'border-emerald-300 shadow-md' : 'border-slate-100 shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex-1 pr-4">
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 ${
                        faq.category === 'সাধারণ' ? 'bg-blue-100 text-blue-700' :
                        faq.category === 'ঋণ' ? 'bg-emerald-100 text-emerald-700' :
                        faq.category === 'সঞ্চয়' ? 'bg-amber-100 text-amber-700' :
                        faq.category === 'সদস্য' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {faq.category}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{faq.q}</span>
                    </div>
                    <div className="flex-shrink-0 text-emerald-600">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Still have questions */}
          <div className="mt-12 bg-emerald-50 rounded-2xl p-8 border border-emerald-100 text-center">
            <h3 className="text-base font-bold text-slate-800 mb-2">আরও প্রশ্ন আছে?</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              এই তালিকায় আপনার প্রশ্নের উত্তর না পেলে সরাসরি আমাদের যোগাযোগ করুন।
              আমরা সন্তুষ্ট উত্তর দিতে সাহায্য করব।
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                         bg-[hsl(160,84%,19%)] text-white font-semibold text-sm
                         hover:bg-[hsl(160,84%,16%)] transition-colors shadow-md"
            >
              যোগাযোগ করুন
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

        </div>
      </section>

    </PublicLayout>
  );
}
