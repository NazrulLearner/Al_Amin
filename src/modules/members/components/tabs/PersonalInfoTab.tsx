// src/pages/Members/profile/tabs/PersonalInfoTab.tsx
import React from 'react';
import { User, CreditCard, Phone } from 'lucide-react';
import type { Member } from '../../../../types';

interface PersonalInfoTabProps {
  member: Member;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ member }) => {
  const infoSections = [
    {
      title: 'Basic Information',
      icon: User,
      fields: [
        { label: 'Full Name', value: member.fullName },
        { label: 'Member ID', value: member.memberId },
        { label: 'Date of Birth', value: member.dateOfBirth || 'Not provided' },
        { label: 'NID Number', value: member.nidNumber || 'Not provided' },
      ]
    },
    {
      title: 'Contact Information',
      icon: Phone,
      fields: [
        { label: 'Phone', value: member.phone || 'Not provided' },
        { label: 'Alternate Phone', value: member.alternatePhone || 'Not provided' },
        { label: 'Email', value: member.email || 'Not provided' },
      ]
    },
    {
      title: 'Membership Details',
      icon: CreditCard,
      fields: [
        { label: 'Join Date', value: member.membership?.dateOfJoin || 'N/A' },
        { label: 'Membership Type', value: member.membership?.membershipType || 'Regular' },
        { label: 'Position', value: member.membership?.position || 'General Member' },
        { label: 'Status', value: member.membership?.status || 'Active' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {infoSections.map((section, idx) => {
        const Icon = section.icon;
        return (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Icon size={18} className="mr-2 text-green-500" />
                {section.title}
              </h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field, fIdx) => (
                  <div key={fIdx} className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">{field.label}</span>
                    <span className="text-sm font-medium text-gray-800">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PersonalInfoTab;