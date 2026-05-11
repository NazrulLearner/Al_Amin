import { 
  User, 
  Users, 
  DollarSign, 
  Landmark, 
  FileText} from 'lucide-react';

export const PROFILE_TABS = [
  { id: 'overview', label: 'Overview', icon: <User size={16} /> },
  { id: 'personal', label: 'Personal', icon: <Users size={16} /> },
  { id: 'fees', label: 'Fees', icon: <DollarSign size={16} /> },
  { id: 'loans', label: 'Loans', icon: <Landmark size={16} /> },
  { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
];

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const ProfileTabs = ({ activeTab, onTabChange }: ProfileTabsProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <div className="flex min-w-max px-2">
        {PROFILE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center px-4 py-3 text-sm font-medium transition-all relative ${
              activeTab === tab.id
                ? 'text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-green-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileTabs;