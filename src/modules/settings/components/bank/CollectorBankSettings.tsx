// src/modules/settings/components/bank/CollectorBankSettings.tsx

import React, { useState } from 'react';
import { User, Users, X, Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useBankAccounts, BankAccount } from '../../hooks/useBankAccounts';
import { ACCOUNT_TYPES, OWNER_TYPES } from '../../constants/bank.constants';
import BankAccountCard from './BankAccountCard';

interface Props {
  collectors: Array<{ id: string; memberId: string; name: string; phone: string }>;
  isEnabled: boolean;
  onToggle: () => void;
}

const CollectorBankSettings: React.FC<Props> = ({ collectors, isEnabled, onToggle }) => {
  const { 
    accounts, 
    loading, 
    addAccount, 
    updateAccount, 
    toggleAccountStatus, 
    permanentDeleteAccount 
  } = useBankAccounts(OWNER_TYPES.COLLECTOR);
  
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [selectedCollectorId, setSelectedCollectorId] = useState('');
  const [formData, setFormData] = useState({
    accountName: '', accountNumber: '', bankName: '', branchName: '',
    accountType: 'savings', openingBalance: 0, routingNumber: '', swiftCode: '', notes: ''
  });

  const handleSubmit = async () => {
    if (!formData.bankName || !formData.accountName || !formData.accountNumber) {
      toast.error('ব্যাংকের নাম, অ্যাকাউন্টের নাম ও নম্বর আবশ্যক');
      return;
    }
    if (!editingAccount && !selectedCollectorId) {
      toast.error('কালেক্টর নির্বাচন করুন');
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
        toast.success('Collector account updated successfully!');
      } else {
        const collector = collectors.find(c => c.id === selectedCollectorId);
        if (!collector) return;
        
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
          ownerType: OWNER_TYPES.COLLECTOR,
          ownerId: collector.id,
          collectorId: collector.id,
          collectorName: collector.name,
          collectorMemberId: collector.memberId
        });
        toast.success('New collector account added successfully!');
      }
      setShowModal(false);
      setEditingAccount(null);
      setSelectedCollectorId('');
      setFormData({
        accountName: '', accountNumber: '', bankName: '', branchName: '',
        accountType: 'savings', openingBalance: 0, routingNumber: '', swiftCode: '', notes: ''
      });
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleDelete = async (account: BankAccount) => {
    // Check if account has balance
    if (account.balance > 0) {
      toast.warning(`Account has balance: ৳ ${account.balance.toLocaleString()}`, {
        description: 'Please withdraw or transfer all funds before deleting.',
        duration: 5000
      });
      return;
    }
    
    // Show warning that this is a collector account
    const confirmed = window.confirm(
      `⚠️ WARNING: You are about to delete ${account.collectorName}'s bank account!\n\n` +
      `Bank: ${account.bankName}\n` +
      `Account: ${account.accountName}\n` +
      `Balance: ৳ ${account.balance.toLocaleString()}\n\n` +
      `This action is IRREVERSIBLE!\n` +
      `Continue?`
    );
    
    if (!confirmed) return;
    
    await permanentDeleteAccount(account.accountId);
  };

  const activeAccounts = accounts.filter(a => a.isActive);
  const inactiveAccounts = accounts.filter(a => !a.isActive);

  // Group accounts by collector for better organization
  const accountsByCollector = activeAccounts.reduce((acc, account) => {
    const collectorName = account.collectorName || 'Unknown';
    if (!acc[collectorName]) acc[collectorName] = [];
    acc[collectorName].push(account);
    return acc;
  }, {} as Record<string, BankAccount[]>);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gradient-to-r from-purple-50 to-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <Users className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Collector Bank Accounts</h2>
            <p className="text-[11px] text-gray-500">Collectors' personal bank accounts</p>
          </div>
        </div>
        
        <button
          onClick={onToggle}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            isEnabled ? 'bg-purple-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Warning Banner for Inactive Accounts */}
      {inactiveAccounts.length > 0 && (
        <div className="mx-4 mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <div className="flex items-center gap-2 text-xs text-yellow-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{inactiveAccounts.length} collector account(s) are currently inactive. Click the power button to reactivate.</span>
          </div>
        </div>
      )}

      {/* Content */}
      {!isEnabled ? (
        <div className="p-6 text-center">
          <Users className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">Collector bank account system is disabled</p>
          <p className="text-xs text-gray-400 mt-1">Toggle the switch above to enable</p>
        </div>
      ) : (
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-xs text-gray-500 mt-2">Loading...</p>
            </div>
          ) : collectors.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No active collectors found</p>
              <p className="text-xs text-gray-400 mt-1">Please add collectors from Collectors tab first</p>
            </div>
          ) : activeAccounts.length === 0 && inactiveAccounts.length === 0 ? (
            <div className="text-center py-10">
              <User className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No collector bank accounts found</p>
              <button 
                onClick={() => {
                  setEditingAccount(null);
                  setSelectedCollectorId('');
                  setFormData({
                    accountName: '', accountNumber: '', bankName: '', branchName: '',
                    accountType: 'savings', openingBalance: 0, routingNumber: '', swiftCode: '', notes: ''
                  });
                  setShowModal(true);
                }} 
                className="mt-2 inline-flex items-center gap-1 text-xs text-purple-600 hover:underline"
              >
                <Plus className="h-3 w-3" /> Add first collector account
              </button>
            </div>
          ) : (
            <>
              {/* Active Accounts - Grouped by Collector */}
              {Object.keys(accountsByCollector).length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                      Active Accounts ({activeAccounts.length})
                    </h3>
                  </div>
                  
                  {Object.entries(accountsByCollector).map(([collectorName, collectorAccounts]) => (
                    <div key={collectorName} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-1 mb-2 ml-1">
                        <User className="h-3 w-3 text-purple-500" />
                        <span className="text-xs font-medium text-purple-700">{collectorName}</span>
                        <span className="text-[10px] text-gray-400">({collectorAccounts.length} account{collectorAccounts.length > 1 ? 's' : ''})</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 border-l-2 border-purple-200">
                        {collectorAccounts.map(acc => (
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
                            showCollectorInfo={false}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
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
                        showCollectorInfo={true}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add button when accounts exist */}
              <div className="mt-6 text-center pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setEditingAccount(null);
                    setSelectedCollectorId('');
                    setFormData({
                      accountName: '', accountNumber: '', bankName: '', branchName: '',
                      accountType: 'savings', openingBalance: 0, routingNumber: '', swiftCode: '', notes: ''
                    });
                    setShowModal(true);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Plus className="h-3 w-3" /> Add Another Account
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-3 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-sm font-semibold">
                {editingAccount ? 'Edit Collector Account' : 'Add New Collector Account'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {editingAccount && (
                <div className="bg-purple-50 rounded-lg p-2 mb-2 border border-purple-200">
                  <p className="text-[10px] text-purple-600 mb-0.5">Account ID (for tracking)</p>
                  <p className="text-xs font-mono font-semibold text-purple-700">{editingAccount.accountId}</p>
                  {editingAccount.collectorName && (
                    <p className="text-[10px] text-purple-500 mt-1">
                      Collector: {editingAccount.collectorName}
                    </p>
                  )}
                </div>
              )}
              
              {!editingAccount && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Select Collector <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCollectorId}
                    onChange={(e) => setSelectedCollectorId(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Select Collector --</option>
                    {collectors.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.memberId}) - {c.phone}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {collectors.length} collector(s) available
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Bank Name *</label>
                  <input 
                    type="text" 
                    value={formData.bankName} 
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500" 
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
                    placeholder="Personal account" 
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
                <p className="text-[10px] text-gray-400 mt-0.5">Unique bank account number</p>
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
                    {ACCOUNT_TYPES.collector.map(t => (
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
                  <p className="text-[10px] text-gray-400 mt-0.5">Initial balance in this account</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea 
                  value={formData.notes} 
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-2 py-1.5 text-sm border rounded-lg" 
                  rows={2}
                  placeholder="Any special notes about this account..." 
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
                className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {editingAccount ? 'Update Account' : 'Save Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectorBankSettings;