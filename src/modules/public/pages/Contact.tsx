/* src/modules/public/pages/Contact.tsx */
import { useState } from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

const CONTACT_INFO = [
  { icon: <Phone className="w-5 h-5" />, label: 'ফোন', value: '+880-1XXX-XXXXXX', sub: 'সকাল ৯টা - সন্ধ্যা ৬টা' },
  { icon: <Mail className="w-5 h-5" />, label: 'ইমেইল', value: 'info@alaminsomity.org', sub: '২৪ ঘণ্টার মধ্যে উত্তর' },
  { icon: <MapPin className="w-5 h-5" />, label: 'অফিস', value: 'ইউনিস / অফিস ঠিকানা', sub: 'জেলা / উপজেলা উল্লেখ করুন' },
  { icon: <Clock className="w-5 h-5" />, label: 'কাজের সময়', value: 'শনি - বৃহঃ', sub: 'সকাল ৯টা - সন্ধ্যা ৬টা' },
];

type FormField = { name: string; value: string; error?: string };

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', subject: '', message: '',
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate send — no backend connected yet (Spark plan)
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setForm({ name: '', phone: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 4000);
    }, 1200);
  };

  return (
    <PublicLayout>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[hsl(160,84%,9%)] to-emerald-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-300 mb-2 block">
            যোগাযোগ
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">আমাদের সাথে কথা বলুন</h1>
          <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
            প্রশ্ন, পরামর্শ বা সদস্য হওয়ার আগ্রহ থাকলে যেকোনো মাধ্যমে যোগাযোগ করুন।
            আমরা সাধ্যমতো দ্রুত উত্তর দিতে চাই।
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Left: contact info */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-lg font-bold text-slate-800 mb-6">যোগাযোগ তথ্য</h2>
            {CONTACT_INFO.map(c => (
              <div key={c.label} className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                  {c.icon}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{c.label}</p>
                  <p className="text-sm font-semibold text-slate-800">{c.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.sub}</p>
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <MapPin className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 mb-1">অফিসের স্থান</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                ইউনিস / অফিসের ঠিকানা ও মানচিত্র অত্র সময়ে আপডেট চলছে।
                সঠিক ঠিকানা জানতে ফোন করুন।
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-6">অনলাইন বার্তা পাঠান</h2>

              {sent && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      নাম <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text" name="name" required
                      value={form.name} onChange={handleChange}
                      placeholder="আপনার পুরো নাম"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm
                                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      ফোন <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel" name="phone" required
                      value={form.phone} onChange={handleChange}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm
                                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    ইমেইল
                  </label>
                  <input
                    type="email" name="email"
                    value={form.email} onChange={handleChange}
                    placeholder="example@mail.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm
                              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    বিষয় <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="subject" required
                    value={form.subject} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm
                              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                              bg-white text-slate-700"
                  >
                    <option value="">বিষয় বাছুন...</option>
                    <option>সদস্য হতে চাই</option>
                    <option>হিনা ঋণ সম্পর্কে জানতে চাই</option>
                    <option>সঞ্চয় যোজনা সম্পর্কে</option>
                    <option>অনুষ্ঠান / প্রশিক্ষণ</option>
                    <option>অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    বার্তা <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message" required rows={5}
                    value={form.message} onChange={handleChange}
                    placeholder="আপনার বার্তা লিখুন..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm
                              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                              resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl
                             bg-[hsl(160,84%,19%)] text-white font-semibold text-sm
                             hover:bg-[hsl(160,84%,16%)] transition-all
                             disabled:opacity-60 disabled:cursor-not-allowed
                             shadow-md shadow-green-900/20"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      পাঠানো হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      বার্তা পাঠান
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

    </PublicLayout>
  );
}
