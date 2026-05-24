import React, { useRef, useState } from 'react';

interface UploadInvestmentDocumentProps {
  investmentId: string;
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
}

const UploadInvestmentDocument: React.FC<UploadInvestmentDocumentProps> = ({ 
  onUpload, 
  uploading 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
        dragActive ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      />
      
      <div className="space-y-3">
        <div className="text-4xl">📎</div>
        <p className="text-gray-600">
          ডকুমেন্ট আপলোড করতে ক্লিক করুন অথবা ড্র্যাগ করুন
        </p>
        <p className="text-xs text-gray-400">
          সমর্থিত ফরম্যাট: PDF, JPG, PNG, DOC (সর্বোচ্চ 5MB)
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {uploading ? 'আপলোড হচ্ছে...' : '📤 ডকুমেন্ট নির্বাচন করুন'}
        </button>
      </div>
    </div>
  );
};

export default UploadInvestmentDocument;