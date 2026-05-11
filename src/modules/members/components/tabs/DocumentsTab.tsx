// src/pages/Members/profile/tabs/DocumentsTab.tsx
import React, { useState } from 'react';
import { FileText, Image, Download, Upload, Trash2, Eye, Plus, Calendar } from 'lucide-react';
import type { Member } from '../../../../types';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc';
  size: string;
  uploadedAt: Date;
  url: string;
}

interface DocumentsTabProps {
  member: Member;
  isOwnProfile: boolean;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ isOwnProfile }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: 'NID Copy',
      type: 'image',
      size: '2.3 MB',
      uploadedAt: new Date('2024-01-15'),
      url: '#'
    },
    {
      id: '2',
      name: 'Membership Form',
      type: 'pdf',
      size: '1.1 MB',
      uploadedAt: new Date('2024-01-15'),
      url: '#'
    },
    {
      id: '3',
      name: 'Photo',
      type: 'image',
      size: '0.8 MB',
      uploadedAt: new Date('2024-01-15'),
      url: '#'
    }
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [reports] = useState([
    {
      id: '1',
      name: 'Fee Statement - January 2024',
      type: 'report',
      generatedAt: new Date('2024-02-01'),
      url: '#'
    },
    {
      id: '2',
      name: 'Loan Statement - Q1 2024',
      type: 'report',
      generatedAt: new Date('2024-04-01'),
      url: '#'
    }
  ]);

  const getFileIcon = (type: string) => {
    switch(type) {
      case 'pdf': return <FileText size={20} className="text-red-500" />;
      case 'image': return <Image size={20} className="text-blue-500" />;
      default: return <FileText size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Documents Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FileText size={18} className="mr-2 text-blue-500" />
            Documents
          </h3>
          {isOwnProfile && (
            <button className="flex items-center px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600">
              <Upload size={14} className="mr-1" />
              Upload
            </button>
          )}
        </div>
        <div className="divide-y divide-gray-100">
          {documents.map(doc => (
            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                {getFileIcon(doc.type)}
                <div>
                  <p className="font-medium text-gray-800">{doc.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{doc.uploadedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye size={16} />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                  <Download size={16} />
                </button>
                {isOwnProfile && (
                  <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reports Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FileText size={18} className="mr-2 text-purple-500" />
            Generated Reports
          </h3>
          {isOwnProfile && (
            <button className="flex items-center px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600">
              <Plus size={14} className="mr-1" />
              Generate Report
            </button>
          )}
        </div>
        <div className="divide-y divide-gray-100">
          {reports.map(report => (
            <div key={report.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-purple-500" />
                <div>
                  <p className="font-medium text-gray-800">{report.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar size={12} />
                    <span>Generated: {report.generatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                  <Eye size={16} />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg">
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentsTab;