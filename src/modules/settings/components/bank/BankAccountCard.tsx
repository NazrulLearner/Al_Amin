// src/modules/settings/components/bank/BankAccountCard.tsx

import React, { useState } from 'react';
import { Building, Eye, EyeOff, Edit, Trash2, User, Wallet, MapPin, CreditCard, Copy, Check, Power, AlertTriangle } from 'lucide-react';
import { ACCOUNT_TYPE_LABELS } from '../../constants/bank.constants';
import type { BankAccount } from '../../hooks/useBankAccounts';
import { toast } from 'sonner';

interface Props {
  account: BankAccount;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus?: () => void;  // ✅ NEW: Toggle active/inactive
  showCollectorInfo?: boolean;
  showDeleteButton?: boolean;  // ✅ NEW: Control delete button visibility
}

const BankAccountCard: React.FC<Props> = ({ 
  account, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  showCollectorInfo = false,
  showDeleteButton = true 
}) => {
  const [showNumber, setShowNumber] = useState(false);
  const [copied, setCopied] = useState(false);
  const isSomity = account.ownerType === 'somity';

  const handleCopyId = () => {
    navigator.clipboard.writeText(account.accountId);
    setCopied(true);
    toast.success(`Account ID copied: ${account.accountId}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md ${
      account.isActive 
        ? isSomity 
          ? 'bg-white border-l-4 border-blue-500' 
          : 'bg-white border-l-4 border-purple-500'
        : 'bg-gray-50 border-l-4 border-gray-300 opacity-75'
    }`}>
      <div className="p-3">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`p-1.5 rounded-lg ${isSomity ? 'bg-blue-100' : 'bg-purple-100'}`}>
              {isSomity ? (
                <Building className="h-4 w-4 text-blue-600" />
              ) : (
                <User className="h-4 w-4 text-purple-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-gray-800 truncate">{account.bankName}</h4>
                {account.isActive ? (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <span className="text-[10px] text-green-600 font-medium">Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 rounded-full">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    <span className="text-[10px] text-red-600 font-medium">Inactive</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{account.accountName}</p>
              {showCollectorInfo && account.collectorName && (
                <p className="text-[11px] text-purple-600 mt-0.5 flex items-center gap-1">
                  <User className="h-2.5 w-2.5" /> {account.collectorName}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1 ml-2">
            {/* ✅ Toggle Status Button */}
            {onToggleStatus && (
              <button 
                onClick={onToggleStatus} 
                className={`p-1 rounded transition-colors ${
                  account.isActive 
                    ? 'text-orange-500 hover:bg-orange-50' 
                    : 'text-green-500 hover:bg-green-50'
                }`}
                title={account.isActive ? 'Temporarily Disable' : 'Activate Account'}
              >
                <Power className="h-3.5 w-3.5" />
              </button>
            )}
            <button onClick={onEdit} className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded">
              <Edit className="h-3.5 w-3.5" />
            </button>
            {showDeleteButton && (
              <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        
        {/* ✅ Account ID Row with Copy Button */}
        <div className="flex items-center justify-between text-xs mb-1 bg-gray-50 px-2 py-1 rounded">
          <span className="text-gray-500">Account ID:</span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-gray-700 font-semibold">{account.accountId}</span>
            <button 
              onClick={handleCopyId} 
              className="p-0.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
              title="Copy Account ID"
            >
              {copied ? <Check className="h-2.5 w-2.5 text-green-500" /> : <Copy className="h-2.5 w-2.5" />}
            </button>
          </div>
        </div>
        
        {/* Details - Line by Line */}
        <div className="mt-2 pt-1 border-t border-gray-100 space-y-1">
          {/* Line 1: Account Number */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <CreditCard className="h-3 w-3 text-gray-400" />
              <span className="text-gray-500">Account:</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-gray-700">
                {showNumber ? account.accountNumber : '••••' + account.accountNumber.slice(-4)}
              </span>
              <button onClick={() => setShowNumber(!showNumber)} className="text-gray-400 hover:text-gray-600">
                {showNumber ? <EyeOff className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
              </button>
            </div>
          </div>
          
          {/* Line 2: Branch */}
          {account.branchName && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="text-gray-500">Branch:</span>
              </div>
              <span className="text-gray-700">{account.branchName}</span>
            </div>
          )}
          
          {/* Line 3: Account Type */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Type:</span>
            </div>
            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
              {ACCOUNT_TYPE_LABELS[account.accountType] || account.accountType}
            </span>
          </div>
          
          {/* Line 4: Balance */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 mt-1">
            <div className="flex items-center gap-1">
              <Wallet className="h-3 w-3 text-green-500" />
              <span className="text-gray-500">Balance:</span>
            </div>
            <span className="font-semibold text-green-600">৳ {account.balance?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankAccountCard;