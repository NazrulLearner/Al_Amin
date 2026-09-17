// src/modules/Investments/components/InvestmentDocuments/InvestmentDocumentUpload.tsx

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, File, Plus, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface InvestmentDocument {
  id: string;
  name: string;
  file: File;
  preview?: string;
  type: 'certificate' | 'agreement' | 'receipt' | 'other';
}

interface InvestmentDocumentUploadProps {
  onDocumentsChange?: (documents: InvestmentDocument[]) => void;
  maxFiles?: number;
}

const InvestmentDocumentUpload: React.FC<InvestmentDocumentUploadProps> = ({ 
  onDocumentsChange, 
  maxFiles = 5 
}) => {
  const [documents, setDocuments] = useState<InvestmentDocument[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<InvestmentDocument['type']>('other');
  const [docName, setDocName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!docName) {
        setDocName(file.name.split('.')[0]);
      }
    }
  };

  const handleAddDocument = () => {
    if (!selectedFile) {
      toast.error('একটি ফাইল নির্বাচন করুন');
      return;
    }

    if (documents.length >= maxFiles) {
      toast.error(`সর্বোচ্চ ${maxFiles} টি ডকুমেন্ট আপলোড করা যাবে`);
      return;
    }

    const newDoc: InvestmentDocument = {
      id: Date.now().toString(),
      name: docName || selectedFile.name,
      file: selectedFile,
      preview: URL.createObjectURL(selectedFile),
      type: selectedDocType,
    };

    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    onDocumentsChange?.(updatedDocs);
    
    // Reset form
    setSelectedFile(null);
    setDocName('');
    setSelectedDocType('other');
    setIsOpen(false);
    
    toast.success('ডকুমেন্ট যোগ করা হয়েছে');
  };

  const handleRemoveDocument = (docId: string) => {
    const updatedDocs = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocs);
    onDocumentsChange?.(updatedDocs);
    toast.success('ডকুমেন্ট সরানো হয়েছে');
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'certificate': return 'সনদপত্র';
      case 'agreement': return 'চুক্তিপত্র';
      case 'receipt': return 'রসিদ';
      default: return 'অন্যান্য';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'certificate': return <FileText className="h-4 w-4" />;
      case 'agreement': return <File className="h-4 w-4" />;
      case 'receipt': return <FileText className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          ডকুমেন্টস (ঐচ্ছিক)
        </label>
        {documents.length < maxFiles && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
          >
            <Plus className="h-4 w-4" />
            ডকুমেন্ট যোগ করুন
          </button>
        )}
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {doc.preview && doc.file.type.startsWith('image/') ? (
                    <img src={doc.preview} alt={doc.name} className="h-8 w-8 object-cover rounded" />
                  ) : (
                    getTypeIcon(doc.type)
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                  <p className="text-xs text-gray-500">{getTypeLabel(doc.type)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveDocument(doc.id)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="px-5 py-3 border-b flex justify-between items-center">
              <h3 className="text-base font-semibold">ডকুমেন্ট আপলোড</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* File Drop Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    {selectedFile.type.startsWith('image/') ? (
                      <Image className="h-8 w-8 text-green-500" />
                    ) : (
                      <File className="h-8 w-8 text-blue-500" />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">ক্লিক করে ফাইল নির্বাচন করুন</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (সর্বোচ্চ 5MB)</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ডকুমেন্টের ধরন
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="certificate">সনদপত্র</option>
                  <option value="agreement">চুক্তিপত্র</option>
                  <option value="receipt">রসিদ</option>
                  <option value="other">অন্যান্য</option>
                </select>
              </div>

              {/* Document Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ডকুমেন্টের নাম
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="যেমন: বিনিয়োগ চুক্তি, এফডি সার্টিফিকেট"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
              >
                বাতিল
              </button>
              <button
                onClick={handleAddDocument}
                disabled={!selectedFile}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                যোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentDocumentUpload;