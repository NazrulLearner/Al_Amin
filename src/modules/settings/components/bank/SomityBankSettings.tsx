// src/modules/settings/components/bank/SomityBankSettings.tsx

import React, { useState } from 'react';
import { Plus, RefreshCw, Building, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useBankAccounts, BankAccount } from '../../hooks/useBankAccounts';
import { ACCOUNT_TYPES, OWNER_TYPES } from '../../constants/bank.constants';
import BankAccountCard from './BankAccountCard';

const SomityBankSettings: React.FC = () => {
  const { accounts, loading, loadAccounts, addAccount, updateAccount, toggleAccountStatus, permanentDeleteAccount } = 
    useBankAccounts(OWNER_TYPES.SOMITY);
  
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState({
    accountName: '', accountNumber: '', bankName: '', branchName: '',
    accountType: 'savings', openingBalance: 0, routingNumber: '', swiftCode: '', notes: ''
  });

  const handleSubmit = async () => {
    if (!formData.bankName || !formData.accountName || !formData.accountNumber) {
      toast.error('ব্যাংকের নাম, অ্যাকাউন্টের নাম ও নম্বর আবশ্যক');
      return;
    }
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.accountId, {
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          bankName: formData.bankName,
          branchName: formData.branchName,
          accountType: formData.accountType,
          routingNumber: formData.routingNumber,
          swiftCode: formData.swiftCode,
          notes: formData.notes
        });
        toast.success('Account updated successfully!');
      } else {
        await addAccount({
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          bankName: formData.bankName,
          branchName: formData.branchName,
          accountType: formData.accountType,
          isActive: true,
          balance: formData.openingBalance,
          routingNumber: formData.routingNumber,
          swiftCode: formData.swiftCode,
          notes: formData.notes,
          ownerType: OWNER_TYPES.SOMITY,
          ownerId: 'somity_main'
        });
        toast.success('New bank account added successfully!');
      }
      setShowModal(false);
      setEditingAccount(null);
      setFormData({
        accountName: '', accountNumber: '', bankName: '', branchName: '',
        accountType: 'savings', openingBalance: 0, routingNumber: '', swiftCode: '', notes: ''
      });
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleDelete = async (account: BankAccount) => {
    // Show warning if account has balance or transactions
    if (account.balance > 0) {
      toast.warning(`Account has balance: ৳ ${account.balance.toLocaleString()}`, {
        description: 'Please withdraw or transfer all funds before deleting.',
        duration: 5000
      });
      return;
    }
    
    await permanentDeleteAccount(account.accountId);
  };

  const activeAccounts = accounts.filter(a => a.isActive);
  const inactiveAccounts = accounts.filter(a => !a.isActive);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <Building className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Somity Bank Accounts</h2>
            <p className="text-[11px] text-gray-500">Official somity bank accounts</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button 
            onClick={loadAccounts} 
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => { setEditingAccount(null); setShowModal(true); }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-3 w-3" /> Add Account
          </button>
        </div>
      </div>

      {/* Warning Banner for Inactive Accounts */}
      {inactiveAccounts.length > 0 && (
        <div className="mx-4 mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <div className="flex items-center gap-2 text-xs text-yellow-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{inactiveAccounts.length} account(s) are currently inactive. Click the power button to reactivate.</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-xs text-gray-500 mt-2">Loading...</p>
          </div>
        ) : activeAccounts.length === 0 && inactiveAccounts.length === 0 ? (
          <div className="text-center py-10">
            <Building className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No bank accounts found</p>
            <button 
              onClick={() => setShowModal(true)} 
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              Add your first account
            </button>
          </div>
        ) : (
          <>
            {/* Active Accounts */}
            {activeAccounts.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                    Active Accounts ({activeAccounts.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeAccounts.map(acc => (
                    <BankAccountCard
                      key={acc.accountId}
                      account={acc}
                      onEdit={() => {
                        setEditingAccount(acc);
                        setFormData({
                          accountName: acc.accountName,
                          accountNumber: acc.accountNumber,
                          bankName: acc.bankName,
                          branchName: acc.branchName || '',
                          accountType: acc.accountType,
                          openingBalance: acc.balance || 0,
                          routingNumber: acc.routingNumber || '',
                          swiftCode: acc.swiftCode || '',
                          notes: acc.notes || ''
                        });
                        setShowModal(true);
                      }}
                      onDelete={() => handleDelete(acc)}
                      onToggleStatus={() => toggleAccountStatus(acc.accountId)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Accounts */}
            {inactiveAccounts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Inactive Accounts ({inactiveAccounts.length})
                  </h3>
                  <span className="text-[10px] text-gray-400">(Click power button to activate)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {inactiveAccounts.map(acc => (
                    <BankAccountCard
                      key={acc.accountId}
                      account={acc}
                      onEdit={() => {
                        setEditingAccount(acc);
                        setFormData({
                          accountName: acc.accountName,
                          accountNumber: acc.accountNumber,
                          bankName: acc.bankName,
                          branchName: acc.branchName || '',
                          accountType: acc.accountType,
                          openingBalance: acc.balance || 0,
                          routingNumber: acc.routingNumber || '',
                          swiftCode: acc.swiftCode || '',
                          notes: acc.notes || ''
                        });
                        setShowModal(true);
                      }}
                      onDelete={() => handleDelete(acc)}
                      onToggleStatus={() => toggleAccountStatus(acc.accountId)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal - Keep as is */}
      {showModal && (
        // ... modal content same as before
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-3 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-sm font-semibold">
                {editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {editingAccount && (
                <div className="bg-blue-50 rounded-lg p-2 mb-2 border border-blue-200">
                  <p className="text-[10px] text-blue-600 mb-0.5">Account ID (for tracking)</p>
                  <p className="text-xs font-mono font-semibold text-blue-700">{editingAccount.accountId}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Bank Name *</label>
                  <input 
                    type="text" 
                    value={formData.bankName} 
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="e.g., Islami Bank" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Account Name *</label>
                  <input 
                    type="text" 
                    value={formData.accountName} 
                    onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg" 
                    placeholder="e.g., Al-Amin Somity" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Account Number *</label>
                <input 
                  type="text" 
                  value={formData.accountNumber} 
                  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  className="w-full px-2 py-1.5 text-sm border rounded-lg font-mono" 
                  placeholder="12345678901234" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Branch</label>
                  <input 
                    type="text" 
                    value={formData.branchName} 
                    onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg" 
                    placeholder="Branch name" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Account Type</label>
                  <select 
                    value={formData.accountType} 
                    onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg"
                  >
                    {ACCOUNT_TYPES.somity.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!editingAccount && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Opening Balance</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">৳</span>
                    <input 
                      type="number" 
                      value={formData.openingBalance} 
                      onChange={(e) => setFormData({...formData, openingBalance: Number(e.target.value)})}
                      className="w-full pl-7 pr-2 py-1.5 text-sm border rounded-lg" 
                      placeholder="0" 
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea 
                  value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-2 py-1.5 text-sm border rounded-lg" 
                  rows={2}
                  placeholder="Any special notes..." 
                />
              </div>
            </div>
            
            <div className="px-4 py-3 border-t bg-gray-50 flex justify-end gap-2">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit} 
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingAccount ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SomityBankSettings;