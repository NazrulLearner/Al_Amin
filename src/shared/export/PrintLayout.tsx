// src/shared/export/PrintLayout.tsx

import React, { useRef } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { useSomitySettings } from '../../app/context/SomitySettingsProvider';
import { Printer, X } from 'lucide-react';

interface PrintLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose?: () => void;
  showPrintButton?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const PrintLayout: React.FC<PrintLayoutProps> = ({
  title,
  subtitle,
  children,
  onClose,
  showPrintButton = true,
  showCloseButton = true,
  className = ''
}) => {
  const { somityInfo } = useAuth();
  const { settings } = useSomitySettings();
  const contentRef = useRef<HTMLDivElement>(null);

  const generalSettings = settings?.general;
  const somityName = generalSettings?.somityName || somityInfo?.name || 'Al-Amin Somity';
  const somityAddress = generalSettings?.somityAddress || somityInfo?.address || '';
  const somityPhone = generalSettings?.somityPhone || somityInfo?.phone || '';
  const somityEmail = generalSettings?.somityEmail || somityInfo?.email || '';
  const somityLogo = generalSettings?.logo || '';
  const watermarkText = generalSettings?.watermarkText || 'স্মৃতি চিরন্তন';

  const handlePrint = () => {
    const content = contentRef.current;
    if (!content) return;

    // Get the inner HTML of the content
    const contentHTML = content.innerHTML;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${somityName} - ${title}</title>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Segoe UI', 'Nikosh', 'Bangla', Arial, sans-serif;
                background: white;
                padding: 20px;
                line-height: 1.5;
              }
              
              .print-container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                position: relative;
              }
              
              /* Header Styles */
              .print-header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 15px;
                border-bottom: 2px solid #ddd;
                position: relative;
              }
              
              .print-logo {
                max-height: 70px;
                margin-bottom: 10px;
              }
              
              .print-org-name {
                font-size: 24px;
                font-weight: bold;
                color: #1e3a5f;
                margin-bottom: 5px;
              }
              
              .print-org-address {
                font-size: 11px;
                color: #666;
                margin-bottom: 5px;
              }
              
              .print-org-contact {
                font-size: 10px;
                color: #888;
              }
              
              .print-title {
                font-size: 20px;
                font-weight: bold;
                color: #2d6a4f;
                margin-top: 15px;
                padding: 8px 16px;
                background: #f0fdf4;
                display: inline-block;
                border-radius: 8px;
              }
              
              .print-subtitle {
                font-size: 12px;
                color: #555;
                margin-top: 8px;
              }
              
              .print-date {
                font-size: 10px;
                color: #999;
                margin-top: 5px;
              }
              
              /* Content Styles */
              .print-content {
                margin: 20px 0;
              }
              
              /* Footer Styles */
              .print-footer {
                margin-top: 40px;
                padding-top: 15px;
                border-top: 1px solid #ddd;
                text-align: center;
                font-size: 10px;
                color: #888;
              }
              
              /* Table Styles */
              .print-table {
                width: 100%;
                border-collapse: collapse;
                margin: 15px 0;
                font-size: 12px;
              }
              
              .print-table th {
                background: #f2f2f2;
                border: 1px solid #ddd;
                padding: 10px;
                text-align: left;
                font-weight: bold;
              }
              
              .print-table td {
                border: 1px solid #ddd;
                padding: 8px 10px;
              }
              
              .print-table tr:nth-child(even) {
                background: #f9f9f9;
              }
              
              /* Card Styles */
              .info-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 20px;
              }
              
              /* Grid Styles */
              .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 12px;
              }
              
              /* Signature Section */
              .signature-section {
                display: flex;
                justify-content: space-between;
                margin-top: 40px;
                padding-top: 20px;
              }
              
              .signature-item {
                text-align: center;
                width: 180px;
              }
              
              .signature-line {
                border-top: 1px solid #999;
                margin-top: 50px;
                padding-top: 8px;
                font-size: 10px;
                color: #666;
              }
              
              /* Watermark */
              .watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-25deg);
                opacity: 0.05;
                font-size: 50px;
                font-weight: bold;
                white-space: nowrap;
                pointer-events: none;
                z-index: 1000;
              }
              
              /* Print-specific styles */
              @media print {
                body {
                  padding: 0;
                  margin: 0;
                  background: white;
                }
                
                .print-container {
                  margin: 0;
                  padding: 15px;
                }
                
                .watermark {
                  opacity: 0.08;
                  font-size: 60px;
                }
                
                .print-header {
                  margin-bottom: 20px;
                  break-inside: avoid;
                }
                
                .print-footer {
                  break-inside: avoid;
                  position: fixed;
                  bottom: 0;
                  left: 0;
                  right: 0;
                  background: white;
                }
                
                .info-card, .print-table {
                  break-inside: avoid;
                }
                
                tr {
                  break-inside: avoid;
                }
                
                @page {
                  margin: 1.5cm;
                }
              }
            </style>
          </head>
          <body>
            <div class="watermark">${watermarkText}</div>
            <div class="print-container">
              <!-- Header -->
              <div class="print-header">
                ${somityLogo ? `<img src="${somityLogo}" alt="Logo" class="print-logo" />` : ''}
                <div class="print-org-name">${somityName}</div>
                ${somityAddress ? `<div class="print-org-address">${somityAddress}</div>` : ''}
                <div class="print-org-contact">
                  ${somityPhone ? `📞 ${somityPhone}` : ''}
                  ${somityPhone && somityEmail ? ' | ' : ''}
                  ${somityEmail ? `✉️ ${somityEmail}` : ''}
                </div>
                <div class="print-title">${title}</div>
                ${subtitle ? `<div class="print-subtitle">${subtitle}</div>` : ''}
                <div class="print-date">জেনারেটেড: ${new Date().toLocaleDateString('bn-BD')} - ${new Date().toLocaleTimeString('bn-BD')}</div>
              </div>
              
              <!-- Content -->
              <div class="print-content">
                ${contentHTML}
              </div>
              
              <!-- Footer -->
              <div class="print-footer">
                <p>© ${new Date().getFullYear()} ${somityName} | সর্বস্বত্ব সংরক্ষিত</p>
                <p>এই ডকুমেন্টটি কম্পিউটার দ্বারা জেনারেটেড। স্বাক্ষর ছাড়া এটি বৈধ নয়।</p>
              </div>
            </div>
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header - Screen View */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-4 flex justify-between items-center no-print">
        <div className="flex items-center gap-3">
          {somityLogo && (
            <img src={somityLogo} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
          )}
          <div>
            <h1 className="text-white font-bold text-lg">{title}</h1>
            {subtitle && <p className="text-blue-200 text-sm">{subtitle}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          {showPrintButton && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <Printer className="h-4 w-4" /> প্রিন্ট করুন
            </button>
          )}
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4" /> বন্ধ
            </button>
          )}
        </div>
      </div>

      {/* Content - Reference for printing */}
      <div ref={contentRef} className="p-6 bg-white">
        {children}
      </div>
    </div>
  );
};

export default PrintLayout;