// src/pages/super-admin/Logs.tsx
import React, { useState } from 'react';
import { Search, Activity, AlertCircle } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  target: string;
  details: string;
  type: 'info' | 'warning' | 'error';
}

const sampleLogs: LogEntry[] = [
  { id: '1', timestamp: new Date(), user: 'Super Admin', action: 'Created somity', target: 'Al Amin Society', details: 'New somity created with admin user', type: 'info' },
  { id: '2', timestamp: new Date(Date.now() - 3600000), user: 'Admin', action: 'Approved Request', target: 'somity Request #123', details: 'Approved somity creation request', type: 'info' },
  { id: '3', timestamp: new Date(Date.now() - 7200000), user: 'System', action: 'User Blocked', target: 'user@example.com', details: 'User account blocked due to suspicious activity', type: 'warning' },
];

const Logs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'warning': return <AlertCircle size={16} className="text-yellow-500" />;
      case 'error': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Activity size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">System Logs</h1>
      <p className="text-gray-500 mb-6">Audit trail of all platform activities</p>

      <div className="bg-white rounded-lg shadow p-4 mb-6"><div className="flex flex-wrap gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg"><option value="all">All Types</option><option value="info">Info</option><option value="warning">Warning</option><option value="error">Error</option></select></div></div>

      <div className="bg-white rounded-lg shadow overflow-hidden"><div className="divide-y divide-gray-200">{sampleLogs.map(log => (<div key={log.id} className="p-4 hover:bg-gray-50 flex items-start gap-4"><div className="flex-shrink-0 mt-1">{getTypeIcon(log.type)}</div><div className="flex-1"><div className="flex items-center gap-2"><span className="font-medium">{log.user}</span><span className="text-gray-500">•</span><span className="text-sm text-gray-500">{log.timestamp.toLocaleString()}</span></div><p className="text-sm mt-1"><span className="font-medium">{log.action}:</span> {log.target}</p><p className="text-xs text-gray-400 mt-1">{log.details}</p></div></div>))}</div></div>
    </div>
  );
};

export default Logs;
