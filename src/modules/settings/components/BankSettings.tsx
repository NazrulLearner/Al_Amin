// src/pages/settings/components/BankSettings.tsx
import React, { useState } from 'react';
import { Plus, Trash2, Edit, X, Building, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import type { BankAccount } from '../../../types/settings';

interface BankSettingsProps {
  bankAccounts: BankAccount[];
  onUpdate: (accounts: BankAccount[]) => void;
}

const BankSettings: React.FC<BankSettingsProps> = ({ bankAccounts = [], onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showAccountNumbers, setShowAccountNumbers] = useState<Record<string, boolean>>({});
  
  const emptyAccount: BankAccount = {
    id: '', bankName: '', accountName: '', accountNumber: '',
    branchName: '', routingNumber: '', swiftCode: '',
    accountType: 'savings', isActive: true, balance: 0, lastUpdated: new Date()
  };
  
  const [formData, setFormData] = useState<BankAccount>(emptyAccount);

  const handleSave = () => {
    if (!formData.bankName || !formData.accountName || !formData.accountNumber) {
      toast.error('ব্যাংকের নাম, অ্যাকাউন্টের নাম ও নম্বর আবশ্যক');
      return;
    }

    let updated: BankAccount[];
    if (editingId) {
      updated = bankAccounts.map(a => a.id === editingId ? { ...formData, id: editingId, lastUpdated: new Date() } : a);
      toast.success('ব্যাংক অ্যাকাউন্ট আপডেট হয়েছে');
    } else {
      const newAccount = { ...formData, id: Date.now().toString(), lastUpdated: new Date() };
      updated = [...bankAccounts, newAccount];
      toast.success('ব্যাংক অ্যাকাউন্ট যোগ করা হয়েছে');
    }
    
    onUpdate(updated);
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyAccount);
  };

  const handleEdit = (account: BankAccount) => {
    setFormData(account);
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত এই অ্যাকাউন্ট ডিলিট করতে চান?')) {
      onUpdate(bankAccounts.filter(a => a.id !== id));
      toast.success('অ্যাকাউন্ট ডিলিট করা হয়েছে');
    }
  };

  const toggleAccountNumber = (id: string) => {
    setShowAccountNumbers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const accountTypeLabels: Record<string, string> = {
    savings: 'সেভিংস',
    current: 'কারেন্ট',
    fixed: 'ফিক্সড ডিপোজিট'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-white flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">🏦 ব্যাংক অ্যাকাউন্ট সমূহ</h2>
          <p className="text-sm text-gray-500 mt-1">সমিতির ব্যাংক অ্যাকাউন্ট যোগ ও পরিচালনা করুন</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData(emptyAccount); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus className="h-4 w-4" /> অ্যাকাউন্ট যোগ করুন
        </button>
      </div>

      <div className="p-6">
        {/* Account List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bankAccounts.map((account) => (
            <div key={account.id} className={`border rounded-xl p-4 ${account.isActive ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{account.bankName}</h4>
                    <p className="text-sm text-gray-500">{account.accountName}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(account)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(account.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">অ্যাকাউন্ট নম্বর:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-medium">
                      {showAccountNumbers[account.id] ? account.accountNumber : '••••' + account.accountNumber.slice(-4)}
                    </span>
                    <button onClick={() => toggleAccountNumber(account.id)} className="text-gray-400">
                      {showAccountNumbers[account.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">ধরন:</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{accountTypeLabels[account.accountType]}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">ব্যালেন্স:</span>
                  <span className="font-semibold text-green-600">৳{account.balance?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">স্ট্যাটাস:</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${account.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {account.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {bankAccounts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Building className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p>কোনো ব্যাংক অ্যাকাউন্ট যোগ করা হয়নি</p>
            <p className="text-sm">উপরে "অ্যাকাউন্ট যোগ করুন" বাটনে ক্লিক করুন</p>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">{editingId ? 'অ্যাকাউন্ট সম্পাদনা' : 'নতুন ব্যাংক অ্যাকাউন্ট'}</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ব্যাংকের নাম *</label>
                  <input type="text" value={formData.bankName} onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg" placeholder="যেমন: Islami Bank, DBBL" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">অ্যাকাউন্টের নাম *</label>
                  <input type="text" value={formData.accountName} onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg" placeholder="যেমন: Al-Amin Somity" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">অ্যাকাউন্ট নম্বর *</label>
                  <input type="text" value={formData.accountNumber} onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg font-mono" placeholder="1234567890" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">অ্যাকাউন্ট টাইপ</label>
                    <select value={formData.accountType} onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value as any }))}
                      className="w-full px-3 py-2 border rounded-lg">
                      <option value="savings">সেভিংস</option>
                      <option value="current">কারেন্ট</option>
                      <option value="fixed">ফিক্সড ডিপোজিট</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded" />
                      <span className="text-sm">সক্রিয়</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ব্রাঞ্চ (অপশনাল)</label>
                  <input type="text" value={formData.branchName || ''} onChange={(e) => setFormData(prev => ({ ...prev, branchName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg" placeholder="শাখার নাম" />
                </div>
              </div>
              
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100">বাতিল</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankSettings;