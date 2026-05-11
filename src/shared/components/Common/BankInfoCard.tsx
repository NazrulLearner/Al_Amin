// src/components/common/BankInfoCard.tsx
import React from 'react';
import { Building, Hash, Landmark, CheckCircle, Clock } from 'lucide-react';

interface BankInfoCardProps {
  bankName?: string;
  bankReference?: string;
  depositedAt?: Date;
  depositedBy?: string;
  showTitle?: boolean;
  className?: string;
}

const BankInfoCard: React.FC<BankInfoCardProps> = ({
  bankName,
  bankReference,
  depositedAt,
  depositedBy,
  showTitle = true,
  className = ''
}) => {
  if (!bankName && !bankReference) {
    return null;
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      {showTitle && (
        <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Landmark className="h-4 w-4" />
          ব্যাংকের তথ্য
        </h4>
      )}
      
      <div className="space-y-2">
        {bankName && (
          <div className="flex items-start gap-2 text-sm">
            <Building className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-gray-600">ব্যাংকের নাম:</span>
              <span className="ml-2 font-medium text-gray-800">{bankName}</span>
            </div>
          </div>
        )}
        
        {bankReference && (
          <div className="flex items-start gap-2 text-sm">
            <Hash className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-gray-600">রেফারেন্স:</span>
              <span className="ml-2 font-mono text-sm text-gray-800">{bankReference}</span>
            </div>
          </div>
        )}
        
        {depositedAt && (
          <div className="flex items-start gap-2 text-sm">
            <Clock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-gray-600">জমার তারিখ:</span>
              <span className="ml-2 text-gray-800">
                {new Date(depositedAt).toLocaleDateString('bn-BD')}
              </span>
            </div>
          </div>
        )}
        
        {depositedBy && (
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-gray-600">জমা দিয়েছেন:</span>
              <span className="ml-2 text-gray-800">{depositedBy}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankInfoCard;