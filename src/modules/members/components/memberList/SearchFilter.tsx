// src/modules/members/components/memberList/SearchFilter.tsx
import { Search, Filter, Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onExport: (type: 'pdf' | 'excel') => void;
}

const SearchFilter = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onExport,
}: SearchFilterProps) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showExportMenu) return;
    const away = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setShowExportMenu(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setShowExportMenu(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [showExportMenu]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex flex-col gap-3">
        {/* Row 1: Search (full-width on mobile) */}
        <div className="w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="নাম, আইডি বা ফোন নম্বর দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Row 2: Status Filter on Left & Export on Right (side-by-side on mobile) */}
        <div className="flex items-center justify-between gap-3">
          {/* Status filter (Left) */}
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>

          {/* Export button (Right) */}
          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setShowExportMenu((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={showExportMenu}
              className="inline-flex items-center gap-2 px-3 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors bg-white whitespace-nowrap"
            >
              <Download size={15} />
              Export
              <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
              <div role="menu" className="absolute right-0 z-10 mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <p className="border-b border-gray-100 px-3 py-2 text-xs text-gray-500 bg-gray-50">
                  Export members matching current filters
                </p>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { setShowExportMenu(false); onExport('excel'); }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FileSpreadsheet size={15} className="text-emerald-600 flex-shrink-0" />
                  Export as Excel
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-gray-400 cursor-not-allowed"
                >
                  <FileText size={15} className="flex-shrink-0" />
                  Export as PDF
                  <span className="ml-auto text-[11px] bg-gray-100 px-1.5 py-0.5 rounded-full">Soon</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
