// src/pages/fees/FeesHistory.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { feesService } from '../services/contributionService';
import { 
  Search, Eye, Printer, Loader2, 
  Edit, Trash2, AlertCircle, X
} from 'lucide-react';
import { toast } from 'sonner';
import type { FeeTransaction } from '../../../types';

// Edit Transaction Modal Component
interface EditTransactionModalProps {
  transaction: FeeTransaction;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ 
  transaction, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [remarks, setRemarks] = useState(transaction.remarks || '');
  const [referenceNo, setReferenceNo] = useState(transaction.referenceNo || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Update transaction in Firebase
      await feesService.updateTransaction(transaction.id, {
        remarks,
        referenceNo
      });
      toast.success('লেনদেন আপডেট করা হয়েছে!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">লেনদেন এডিট</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">রসিদ নম্বর</label>
            <input
              type="text"
              value={transaction.receiptId}
              disabled
              className="w-full px-3 py-2 bg-gray-100 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">সদস্য</label>
            <input
              type="text"
              value={transaction.memberName}
              disabled
              className="w-full px-3 py-2 bg-gray-100 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ট্রানজেকশন আইডি</label>
            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="ট্রানজেকশন আইডি"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">মন্তব্য</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="মন্তব্য"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal: React.FC<{
  transaction: FeeTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}> = ({ transaction, isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold">লেনদেন ডিলিট করুন</h2>
          </div>
          <p className="text-gray-600 mb-4">
            আপনি কি নিশ্চিত যে এই লেনদেনটি ডিলিট করতে চান?
          </p>
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="text-sm"><strong>রসিদ নম্বর:</strong> {transaction.receiptId}</p>
            <p className="text-sm"><strong>সদস্য:</strong> {transaction.memberName}</p>
            <p className="text-sm"><strong>পরিমাণ:</strong> ৳{transaction.feeAmount.toLocaleString()}</p>
            <p className="text-sm"><strong>তারিখ:</strong> {new Date(transaction.createdAt).toLocaleDateString()}</p>
          </div>
          <p className="text-sm text-red-600 mb-4">
            ⚠️ সতর্কতা: এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না!
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              বাতিল
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'ডিলিট করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeesHistory: React.FC = () => {
  const { userData } = useAuth();
  const [transactions, setTransactions] = useState<FeeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<FeeTransaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Single somity data!
      const data = await feesService.getAllTransactions(500);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('লেনদেন ইতিহাস লোড করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTransaction) return;
    
    setDeleteLoading(true);
    try {
      // Single somity data!
      await feesService.deleteTransaction(
        selectedTransaction.id,
        selectedTransaction.memberId,
        selectedTransaction.feeAmount
      );
      
      toast.success('লেনদেন ডিলিট করা হয়েছে!');
      setShowDeleteModal(false);
      setSelectedTransaction(null);
      await fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('ডিলিট করতে সমস্যা হয়েছে');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (transaction: FeeTransaction) => {
    setSelectedTransaction(transaction);
    setShowEditModal(true);
  };

  const handleViewReceipt = (transaction: FeeTransaction) => {
    setSelectedTransaction(transaction);
    setShowReceiptModal(true);
  };

  const filteredTransactions = transactions.filter(t =>
    t.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.receiptId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('bn-BD', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Only admin can edit/delete
  const canEditDelete = userData?.role === 'admin' || userData?.role === 'super_admin';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ফি জমার ইতিহাস</h1>
          <p className="text-gray-500 mt-1">সকল ফি জমার লিস্ট</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="সদস্যের নাম, আইডি বা রিসিপ্ট নম্বর দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">মোট জমা</p>
            <p className="text-2xl font-bold text-green-600">৳{transactions.reduce((sum, t) => sum + t.feeAmount, 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">মোট লেনদেন</p>
            <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">এই মাসে</p>
            <p className="text-2xl font-bold text-purple-600">
              ৳{transactions.filter(t => {
                const date = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
                return date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
              }).reduce((sum, t) => sum + t.feeAmount, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">গত মাসে</p>
            <p className="text-2xl font-bold text-amber-600">
              ৳{transactions.filter(t => {
                const date = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
              }).reduce((sum, t) => sum + t.feeAmount, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">তারিখ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">রিসিপ্ট নং</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">সদস্য</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">পরিমাণ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">পদ্ধতি</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">মাস</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{formatDate(transaction.createdAt)}</td>
                    <td className="px-6 py-4 text-sm font-mono">{transaction.receiptId}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{transaction.memberName}</p>
                      <p className="text-xs text-gray-500">{transaction.memberId}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">৳{transaction.feeAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {transaction.payType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{transaction.paymentPeriod}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewReceipt(transaction)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="রসিদ দেখুন"
                        >
                          <Eye size={18} />
                        </button>
                        {canEditDelete && (
                          <>
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="এডিট করুন"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowDeleteModal(true);
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="ডিলিট করুন"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">কোনো লেনদেন পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">ফি জমার রসিদ</h2>
                <p className="text-gray-500">{selectedTransaction.receiptId}</p>
              </div>
              
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">তারিখ:</span>
                  <span className="font-medium">{formatDate(selectedTransaction.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">সদস্যের নাম:</span>
                  <span className="font-medium">{selectedTransaction.memberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">সদস্য আইডি:</span>
                  <span className="font-medium">{selectedTransaction.memberId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">মোট পরিমাণ:</span>
                  <span className="font-bold text-green-600">৳{selectedTransaction.feeAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">পেমেন্ট পদ্ধতি:</span>
                  <span className="capitalize">{selectedTransaction.payType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">পরিশোধিত মাস:</span>
                  <span className="text-sm">{selectedTransaction.paymentPeriod}</span>
                </div>
                {selectedTransaction.referenceNo && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ট্রানজেকশন আইডি:</span>
                    <span className="font-mono text-sm">{selectedTransaction.referenceNo}</span>
                  </div>
                )}
                {selectedTransaction.remarks && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">মন্তব্য:</span>
                    <span className="text-sm">{selectedTransaction.remarks}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  প্রিন্ট
                </button>
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    setSelectedTransaction(null);
                  }}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTransaction && (
        <EditTransactionModal
          transaction={selectedTransaction}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTransaction(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedTransaction(null);
            fetchTransactions();
          }}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedTransaction && (
        <DeleteConfirmModal
          transaction={selectedTransaction}
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedTransaction(null);
          }}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default FeesHistory;
