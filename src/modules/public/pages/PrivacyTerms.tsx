/* src/modules/public/pages/PrivacyTerms.tsx */
import PublicLayout from '../components/layout/PublicLayout';

const SECTIONS = [
  {
    id: 'privacy-intro',
    title: 'গোপনীয়তা নীতিমালা — ভূমিকা',
    content: `আমরা আপনার গোপনীয়তাকে সম্মান করি। এই গোপনীয়তা নীতিমালা বলে দেয় যে আল আমিন সমিতি কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার ও সংরক্ষণ করে। আমাদের PWA অ্যাপ্লিকেশন এবং অনলাইন সেবাগুলো ব্যবহার করার মাধ্যমে আপনি এই নীতিমালা মেনে নেন।`,
  },
  {
    id: 'privacy-data-collect',
    title: 'আমরা কোন তথ্য সংগ্রহ করি',
    content: `আমরা নিচের প্রকারের তথ্য সংগ্রহ করতে পারি:
• পরিচয় তথ্য: নাম, ফোন নম্বর, ইমেইল, জাতীয় পরিচয়পত্র নম্বর
• ঠিকানা তথ্য: বর্তমান ও স্থায়ী ঠিকানা, ইউনিয়ন, উপজেলা, জেলা
• আর্থিক তথ্য: সঞ্চয় খাতা বিবরণী, ঋণ ইতিহাস, পরিশোধের রেকর্ড
• লেনদেন তথ্য: প্রতিটি লেনদেনের সময়, পরিমাণ, উদ্দেশ্য
• প্রযুক্তিগত তথ্য: ডিভাইসের ধরণ, IP ঠিকানা, ব্রাউজার তথ্য
আমরা এই তথ্য শুধুমাত্র আমাদের সেবা প্রদানের জন্য ব্যবহার করি।`,
  },
  {
    id: 'privacy-use',
    title: 'তথ্য ব্যবহারের উদ্দেশ্য',
    content: `আপনার তথ্য ব্যবহার করা হয়:
১) সদস্য হিসেবে স্বীকৃতি ও পরিচয় নিশ্চিত করতে
২) ঋণ ও সঞ্চয় সেবা প্রদানে
৩) আইনি ও কর্তৃপক্ষ অনুযায়ী প্রতিবেদন তৈরি করতে
৪) নিরাপত্তা ও fraud প্রতিরোধে
৫) সেবা উন্নয়ন ও সদস্যদের অভিজ্ঞতা বাড়াতে
৬) প্রয়োজনে legal compliance জন্য
আমরা আপনার তথ্য বিক্রি, ভাড়া দেওয়া বা অন্য কোনোভাবে third-party-কে providing করি না — সেখানে যেখানে আইন দ্বারা আবশ্যক।`,
  },
  {
    id: 'privacy-security',
    title: 'তথ্য সুরক্ষা',
    content: `আমরা আপনার তথ্য সুরক্ষিত রাখতে নিম্নলিখিত পদক্ষেপ গ্রহণ করেছি:
• সকল ডেটা encrypted connection (HTTPS) এর মাধ্যমে transfer হয়
• Firestore database secure rules দ্বারা সুরক্ষিত
• authentication required for any data access
• regular security audit করা হয়
• কর্মচারীদের মধ্যে তথ্য গোপনীয়তা নিয়ে প্রশিক্ষণ দেওয়া হয়
তবে Internet এর মাধ্যমে transfer হওয়া কোনো তথ্য 100% secure নয় বলা যায় না। সন্তুষ্ট ব্যবহারকারীদের strong password এবং regular monitoring এর কথা বলা হয়।`,
  },
  {
    id: 'terms-intro',
    title: 'ব্যবহারের শর্তাবলি — ভূমিকা',
    content: `এই শর্তাবলি আল আমিন সমিতির PWA অ্যাপ্লিকেশন এবং অনলাইন সেবার ব্যবহারের governing rules। আমরা আমাদের ওয়েবসাইট বা অ্যাপ ব্যবহার করে আপনি এগুলো accept করেন।`,
  },
  {
    id: 'terms-membership',
    title: 'সদস্যত্ব ও যোগ্যতা',
    content: `আমাদের অ্যাপ ব্যবহার করতে আপনার অবশ্যই আমাদের নিবন্ধিত সদস্য হতে হবে। সদস্য হওয়ার যোগ্যতা:
• ১৮ বছর বা ততোধিক বয়স
• বৈধ পরিচয়পত্র আছে
• আমাদের নিকটস্থ ইউনিটে আবেদন করেছে এবং accepted হয়েছে
• ইচ্ছা ও শেখার মানসিকতা আছে
অবৈধ পদ্ধতিতে account তৈরি করলে সেই account permanently terminate করা হবে।`,
  },
  {
    id: 'terms-responsibilities',
    title: 'সদস্যদের দায়িত্ব',
    content: `প্রতিটি সদস্যের:
১) সঠিক তথ্য provide করা
২) ঋণের installment timelyভাবে পরিশোধ করা
৩) গ্রুপ মিটিংএ নিয়মিত অংশগ্রহণ করা
৪) শরিয়াহের নীতিমালা follow করা
৫) অন্য সদস্যের তথ্য confidential রাখা
৬) account credentials secure রাখা
৭) কোনো fraudulent activity report করা
`,
  },
  {
    id: 'terms-limitations',
    title: 'দায়বদ্ধতা সীমাবদ্ধতা',
    content: `আমরা আমাদের সর্বোচ্চ চেষ্টা করি কিন্তু কোনো গ্যারান্টিযুক্ত returns বা profits গ্যারান্টি করি না। Investment losses-এর জন্য আমরা দায়ী নই। আমাদের কোনো দায় individual damages বা consequential loss-এর জন্য নেই।
আমাদের কোনো গ্যারান্টি নাই যে অ্যাপ সবসময় available থাকবে — maintenance, updates, বা force majeure events-এর কারণে downtime হতে পারে।`,
  },
  {
    id: 'terms-modifications',
    title: 'নীতিমালা পরিবর্তন',
    content: `আমরা প্রয়োজন অনুযায়ী এই নীতিমালা পরিবর্তন করতে পারি। যে কোনো material changes members-দের explicitly notify করা হবে — app notification, SMS, বা email-এর মাধ্যমে। পুরনো নীতিমালা অনুযায়ী operation করা তথ্য বৈধ থাকবে।`,
  },
];

export default function PrivacyTermsPage() {
  return (
    <PublicLayout>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[hsl(160,84%,9%)] to-emerald-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-300 mb-2 block">
            আইনগত
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">গোপনীয়তা ও শর্তাবলি</h1>
          <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
            আপনার গোপনীয়তা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। এই পেজে আমরা বিস্তারিত বলেছি কীভাবে আপনার তথ্য ব্যবহার ও সুরক্ষিত রাখি।
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Navigation chips */}
        <div className="flex flex-wrap gap-2 mb-10 pb-6 border-b border-slate-200">
          <a href="#privacy-intro" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
            গোপনীয়তা নীতিমালা
          </a>
          <a href="#terms-intro" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors">
            ব্যবহারের শর্তাবলি
          </a>
        </div>

        {/* Section group: Privacy */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-emerald-700 mb-6 pb-2 border-b-2 border-emerald-200 inline-block">
            গোপনীয়তা নীতিমালা
          </h2>
          <div className="space-y-6">
            {SECTIONS.filter(s => s.id.startsWith('privacy-')).map(s => (
              <div key={s.id} id={s.id} className="scroll-mt-24">
                <h3 className="text-base font-bold text-slate-800 mb-3">{s.title}</h3>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 rounded-xl p-5 border border-slate-100">
                  {s.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section group: Terms */}
        <div>
          <h2 className="text-lg font-bold text-orange-700 mb-6 pb-2 border-b-2 border-orange-200 inline-block">
            ব্যবহারের শর্তাবলি
          </h2>
          <div className="space-y-6">
            {SECTIONS.filter(s => s.id.startsWith('terms-')).map(s => (
              <div key={s.id} id={s.id} className="scroll-mt-24">
                <h3 className="text-base font-bold text-slate-800 mb-3">{s.title}</h3>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 rounded-xl p-5 border border-slate-100">
                  {s.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last updated */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>সর্বশেষ আপডেট: নভেম্বর ২০২৫</p>
          <p className="mt-1">
            কোনো প্রশ্ন থাকলে যোগাযোগ করুন:
            <a href="/contact" className="text-emerald-600 hover:underline ml-1">info@alaminsomity.org</a>
          </p>
        </div>

      </div>
    </PublicLayout>
  );
}
