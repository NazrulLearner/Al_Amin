import type { Business } from "../types/business.types";

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">{business.name}</h3>
          <p className="text-sm text-gray-500">Type: {business.type}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
          {business.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-600">
        <div>
          <p className="text-xs text-gray-500">Initial</p>
          <p className="font-medium">{business.initialInvestment.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Current</p>
          <p className="font-medium">{business.currentValue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
