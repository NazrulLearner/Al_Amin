import React, { useState, useEffect } from 'react';
import InvestmentBasicFields from './InvestmentBasicFields';
import type { Investment } from '../../types/investment.types';
import { investmentCalculator } from '../../utils/investmentCalculator';

interface InvestmentFormProps {
  initialData?: Investment;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({ 
  initialData, 
  onSubmit, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    memberId: '',
    memberName: '',
    planId: '',
    planName: '',
    amount: 0,
    startDate: new Date().toISOString().split('T')[0],
    expectedReturnPercent: 0,
    paymentMethod: 'cash' as 'cash' | 'bank',
    notes: ''
  });

  const [members] = useState<Array<{ id: string; name: string }>>([]);
  const [plans, setPlans] = useState<Array<{ 
    id: string; 
    name: string; 
    minAmount: number; 
    maxAmount: number; 
    expectedProfitPercent: number;
    durationMonths: number;
  }>>([]);

  useEffect(() => {
    // Load members and plans from your existing services
    loadMembers();
    loadPlans();
    
    if (initialData) {
      setFormData({
        memberId: initialData.memberId,
        memberName: initialData.memberName,
        planId: initialData.planId,
        planName: initialData.planName,
        amount: initialData.amount,
        startDate: initialData.startDate.toISOString().split('T')[0],
        expectedReturnPercent: initialData.expectedReturnPercent,
        paymentMethod: initialData.paymentMethod,
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const loadMembers = async () => {
    // Fetch from your members service
    // Example: const data = await memberService.getAll();
    // setMembers(data.map(m => ({ id: m.id, name: m.name })));
  };

  const loadPlans = async () => {
    // Fetch from your settings or constants
    setPlans([
      { id: 'plan1', name: '৬ মাস মাদারাবাহ', minAmount: 5000, maxAmount: 50000, expectedProfitPercent: 8, durationMonths: 6 },
      { id: 'plan2', name: '১ বছর মাদারাবাহ', minAmount: 10000, maxAmount: 100000, expectedProfitPercent: 12, durationMonths: 12 },
      { id: 'plan3', name: '২ বছর মাদারাবাহ', minAmount: 25000, maxAmount: 500000, expectedProfitPercent: 15, durationMonths: 24 }
    ]);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateObj = new Date(formData.startDate);
    const selectedPlan = plans.find(p => p.id === formData.planId);
    
    if (!selectedPlan) {
      alert('প্ল্যান নির্বাচন করুন');
      return;
    }

    const maturityDate = investmentCalculator.calculateMaturityDate(
      startDateObj, 
      selectedPlan.durationMonths
    );

    const expectedProfitAmount = investmentCalculator.calculateProfit(
      formData.amount, 
      formData.expectedReturnPercent
    );

    const submitData = {
      ...formData,
      startDate: startDateObj,
      maturityDate,
      expectedProfitAmount,
      status: 'pending' as const,
      createdBy: 'current_user_id' // Get from auth context
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
      <InvestmentBasicFields
        formData={formData}
        onChange={handleChange}
        members={members}
        plans={plans}
      />

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          পেমেন্ট মাধ্যম <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="cash"
              checked={formData.paymentMethod === 'cash'}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span>নগদ</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="bank"
              checked={formData.paymentMethod === 'bank'}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span>ব্যাংক</span>
          </label>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          নোট (ঐচ্ছিক)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="কোনো বিশেষ তথ্য থাকলে লিখুন..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          বাতিল
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'সংরক্ষণ হচ্ছে...' : (initialData ? 'আপডেট করুন' : 'বিনিয়োগ করুন')}
        </button>
      </div>
    </form>
  );
};

export default InvestmentForm;