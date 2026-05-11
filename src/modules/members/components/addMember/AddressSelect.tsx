// src/components/Members/addMember/AddressSelect.tsx
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import bangladeshData from '../../../../shared/data/bangladesh.json';

interface AddressData {
  division: string;
  district: string;
  upazila: string;
  union: string;
  village: string;
}

interface AddressSelectProps {
  value: AddressData;
  onChange: (data: AddressData) => void;
  errors?: Record<string, string>;
}

const AddressSelect: React.FC<AddressSelectProps> = ({ value, onChange, errors = {} }) => {
  const [divisions, setDivisions] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  // Load divisions from JSON on mount
  useEffect(() => {
    const divisionNames = bangladeshData.divisions.map(div => div.name);
    setDivisions(divisionNames);
  }, []);

  // Update districts when division changes
  useEffect(() => {
    if (value.division) {
      const selectedDivision = bangladeshData.divisions.find(
        div => div.name === value.division
      );
      setDistricts(selectedDivision?.districts || []);
      
      // Reset district if current district is not in the new list
      if (value.district && !selectedDivision?.districts.includes(value.district)) {
        onChange({ ...value, district: '', upazila: '', union: '', village: '' });
      }
    } else {
      setDistricts([]);
    }
  }, [value.division]);

  return (
    <div className="space-y-4">
      {/* Division Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Division <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={value.division}
            onChange={(e) => onChange({ ...value, division: e.target.value, district: '', upazila: '', union: '', village: '' })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="">Select Division</option>
            {divisions.map(div => (
              <option key={div} value={div}>{div}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {errors.division && <p className="text-xs text-red-500 mt-1">{errors.division}</p>}
      </div>

      {/* District Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          District <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={value.district}
            onChange={(e) => onChange({ ...value, district: e.target.value, upazila: '', union: '', village: '' })}
            disabled={!value.division}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select District</option>
            {districts.map(dist => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
      </div>

      {/* Upazila / Thana - Input Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upazila / Thana
        </label>
        <input
          type="text"
          value={value.upazila}
          onChange={(e) => onChange({ ...value, upazila: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter upazila or thana name"
        />
      </div>

      {/* Union / Ward - Input Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Union / Ward
        </label>
        <input
          type="text"
          value={value.union}
          onChange={(e) => onChange({ ...value, union: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter union or ward name"
        />
      </div>

      {/* Village / House - Input Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Village / House / Road
        </label>
        <input
          type="text"
          value={value.village}
          onChange={(e) => onChange({ ...value, village: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter village, house number, road name..."
        />
      </div>
    </div>
  );
};

export default AddressSelect;