import React from 'react';

interface InvestmentBasicFieldsProps {
  formData: {
    memberId: string;
    memberName: string;
    planId: string;
    planName: string;
    amount: number;
    startDate: string;
    expectedReturnPercent: number;
  };
  onChange: (field: string, value: any) => void;
  members: Array<{ id: string; name: string }>;
  plans: Array<{ id: string; name: string; minAmount: number; maxAmount: number; expectedProfitPercent: number }>;
}

const InvestmentBasicFields: React.FC<InvestmentBasicFieldsProps> = ({
  formData,
  onChange,
  members,
  plans
}) => {
  const selectedPlan = plans.find(p => p.id === formData.planId);
  const isAmountValid = selectedPlan 
    ? formData.amount >= selectedPlan.minAmount && formData.amount <= selectedPlan.maxAmount
    : true;

  return (
    <div className="space-y-4">
      {/* Member Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          সদস্য <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.memberId}
          onChange={(e) => {
            const member = members.find(m => m.id === e.target.value);
            onChange('memberId', e.target.value);
            onChange('memberName', member?.name || '');
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">সদস্য নির্বাচন করুন</option>
          {members.map(member => (
            <option key={member.id} value={member.id}>{member.name}</option>
          ))}
        </select>
      </div>

      {/* Plan Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          বিনিয়োগ পরিকল্পনা <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.planId}
          onChange={(e) => {
            const plan = plans.find(p => p.id === e.target.value);
            onChange('planId', e.target.value);
            onChange('planName', plan?.name || '');
            onChange('expectedReturnPercent', plan?.expectedProfitPercent || 0);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">পরিকল্পনা নির্বাচন করুন</option>
          {plans.map(plan => (
            <option key={plan.id} value={plan.id}>
              {plan.name} - {plan.expectedProfitPercent}% (ন্যূনতম ৳{plan.minAmount.toLocaleString()})
            </option>
          ))}
        </select>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          বিনিয়োগের পরিমাণ (টাকা) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => onChange('amount', parseFloat(e.target.value))}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
            !isAmountValid ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="যেমন: 50000"
          required
        />
        {selectedPlan && (
          <p className={`text-xs mt-1 ${!isAmountValid ? 'text-red-500' : 'text-gray-500'}`}>
            {!isAmountValid 
              ? `পরিমাণ ${selectedPlan.minAmount.toLocaleString()} থেকে ${selectedPlan.maxAmount.toLocaleString()} টাকার মধ্যে হতে হবে`
              : `ন্যূনতম: ৳${selectedPlan.minAmount.toLocaleString()}, সর্বোচ্চ: ৳${selectedPlan.maxAmount.toLocaleString()}`
            }
          </p>
        )}
      </div>

      {/* Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          শুরুর তারিখ <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => onChange('startDate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
    </div>
  );
};

export default InvestmentBasicFields;