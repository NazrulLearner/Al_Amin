
const LoansTab = ({ }: { memberId: string }) => {
  return (
    <div className="space-y-4">
      {/* Active Loan Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-slate-400 text-xs mb-1">সচল লোনের আইডি: #LN-552</p>
          <h4 className="text-2xl font-bold mb-4">৳৫০,০০০.০০</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-slate-400">পরিশোধিত</p><p className="font-bold">৳২০,০০০</p></div>
            <div><p className="text-slate-400">অবশিষ্ট</p><p className="font-bold">৳৩০,০০০</p></div>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full w-24 bg-white/5 skew-x-12 translate-x-10" />
      </div>
      <p className="text-center text-slate-400 text-sm py-4 italic">কোনো পুরাতন লোন রেকর্ড পাওয়া যায়নি</p>
    </div>
  );
};

export default LoansTab;