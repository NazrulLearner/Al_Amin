// src/modules/contributions/components/CollectorSelect.tsx
import React from 'react';
import { Users, CheckCircle, AlertCircle } from 'lucide-react';
import type { CollectorAssignment } from '../../../types';

interface CollectorSelectProps {
  collectors: CollectorAssignment[];
  selectedCollectorId: string;
  onSelect: (collectorId: string) => void;
  isRequired?: boolean;
}

const CollectorSelect: React.FC<CollectorSelectProps> = ({
  collectors,
  selectedCollectorId,
  onSelect,
  isRequired = true,
}) => {
  if (collectors.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
        <h3 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Users className="h-5 w-5 text-yellow-600" />
          কালেক্টর নির্বাচন
        </h3>
        <p className="text-sm text-yellow-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          কোনো সক্রিয় কালেক্টর নেই। Settings থেকে কালেক্টর যোগ করুন।
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-200">
      <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-indigo-600" />
        কালেক্টর নির্বাচন
        {isRequired && (
          <span className="text-xs text-red-500 font-normal">* প্রয়োজনীয়</span>
        )}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {collectors.map(collector => (
          <button
            key={collector.id}
            type="button"
            onClick={() => onSelect(collector.id)}
            className={`p-3 rounded-xl text-left transition-all border-2 ${
              selectedCollectorId === collector.id
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selectedCollectorId === collector.id
                    ? 'bg-indigo-500'
                    : 'bg-gray-200'
                }`}
              >
                <Users
                  className={`h-4 w-4 ${
                    selectedCollectorId === collector.id
                      ? 'text-white'
                      : 'text-gray-500'
                  }`}
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">
                  {collector.memberName}
                </p>
                <p className="text-xs text-gray-500">{collector.memberId}</p>
                <p className="text-xs text-gray-400">{collector.phone}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Info */}
      {selectedCollectorId && (
        <div className="mt-3 p-2 bg-indigo-100 rounded-lg">
          <p className="text-xs text-indigo-700 flex items-center gap-2">
            <CheckCircle className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              {collectors.find(c => c.id === selectedCollectorId)?.memberName} কে
              কালেক্টর হিসেবে নির্বাচিত করা হয়েছে
            </span>
          </p>
        </div>
      )}

      {/* Warning when not selected */}
      {!selectedCollectorId && isRequired && (
        <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-700 flex items-center gap-2">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            দয়া করে একজন কালেক্টর নির্বাচন করুন
          </p>
        </div>
      )}
    </div>
  );
};

export default CollectorSelect;