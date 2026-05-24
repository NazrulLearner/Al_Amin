import React from 'react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  url: string;
}

interface InvestmentDocumentListProps {
  documents: Document[];
  onDelete?: (id: string) => void;
  onDownload?: (url: string, name: string) => void;
}

const InvestmentDocumentList: React.FC<InvestmentDocumentListProps> = ({ 
  documents, 
  onDelete, 
  onDownload 
}) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        কোনো ডকুমেন্ট আপলোড করা হয়নি
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word')) return '📝';
    if (type.includes('excel')) return '📊';
    return '📁';
  };

  return (
    <div className="space-y-2">
      {documents.map(doc => (
        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getFileIcon(doc.type)}</span>
            <div>
              <p className="font-medium text-gray-800">{doc.name}</p>
              <p className="text-xs text-gray-500">
                {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {onDownload && (
              <button
                onClick={() => onDownload(doc.url, doc.name)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                ⬇️
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(doc.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvestmentDocumentList;