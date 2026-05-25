import React, { useEffect, useState } from 'react';
import { getDoc, getDocs } from 'firebase/firestore';
import collections from '../../../services/firebase/firebaseCollections';

interface FirestoreDocItem {
  id: string;
  data: any;
}

interface FirestoreCollectionEntry {
  title: string;
  label: string;
  type: 'collection' | 'singleDoc';
  sampleDoc: FirestoreDocItem | null;
  totalCount: number;
  error?: string;
}

const FirestoreInspector: React.FC = () => {
  const [collectionsState, setCollectionsState] = useState<FirestoreCollectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});

  // Convert Firestore Timestamp to readable date string
  const formatTimestamp = (timestamp: any): any => {
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp && 'nanoseconds' in timestamp) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      }).replace(',', '');
    }
    return timestamp;
  };

  // Recursively convert all timestamps in an object to readable strings
  const convertTimestamps = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    
    if (obj && typeof obj === 'object' && 'seconds' in obj && 'nanoseconds' in obj) {
      return formatTimestamp(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => convertTimestamps(item));
    }
    
    if (typeof obj === 'object') {
      const converted: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          converted[key] = convertTimestamps(obj[key]);
        }
      }
      return converted;
    }
    
    return obj;
  };

  // Copy document JSON to clipboard
  const copyToClipboard = (docId: string, data: any) => {
    const convertedData = convertTimestamps(data);
    const jsonStr = JSON.stringify(convertedData, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopiedDocId(docId);
      setTimeout(() => setCopiedDocId(null), 2000);
    }).catch(() => {
      alert('Failed to copy');
    });
  };

  // Toggle JSON expand/collapse
  const toggleExpand = (label: string) => {
    setExpandedDocs(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Get JSON lines and decide if we need truncation
  const getFormattedJson = (data: any, isExpanded: boolean) => {
    const jsonStr = JSON.stringify(convertTimestamps(data), null, 2);
    const lines = jsonStr.split('\n');
    
    if (lines.length <= 10 || isExpanded) {
      return { content: jsonStr, truncated: false, totalLines: lines.length };
    }
    
    const truncatedContent = lines.slice(0, 10).join('\n') + '\n... (truncated)';
    return { content: truncatedContent, truncated: true, totalLines: lines.length };
  };

  useEffect(() => {
    const loadFirestoreData = async () => {
      setLoading(true);
      setError(null);

      const collectionList: Array<{
        title: string;
        label: string;
        type: 'collection' | 'singleDoc';
        loader: () => Promise<{ docs: FirestoreDocItem[]; total: number }>;
      }> = [
        { title: 'users', label: 'users', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.users());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'members', label: 'members', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.members());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'contributions', label: 'contributions', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.contributions());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'collector_balances', label: 'collector_balances', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.collectorBalances());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'deposits', label: 'deposits', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.deposits());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'loanApplications', label: 'loanApplications', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.loanApplications());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'loans', label: 'loans', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.loans());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'loan_repayments', label: 'loan_repayments', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.loanRepayments());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'loanDisbursements', label: 'loanDisbursements', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.loanDisbursements());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'bank_accounts', label: 'bank_accounts', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.bankAccounts());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'cash_balances', label: 'cash_balances', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.cashBalances());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'fund_transactions', label: 'fund_transactions', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.fundTransactions());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'daily_closing', label: 'daily_closing', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.dailyClosing());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'audit_logs', label: 'audit_logs', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.auditLogs());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'roles', label: 'roles', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.roles());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'investments', label: 'investments', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.investments());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'investment_projects', label: 'investment_projects', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.investmentProjects());
          const docs = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
          return { docs: docs.slice(0, 1), total: docs.length };
        } },
        { title: 'somity_settings/config', label: 'somity_settings/config', type: 'singleDoc', loader: async () => {
          const docSnap = await getDoc(collections.somitySettings());
          const docs = docSnap.exists() ? [{ id: docSnap.id, data: docSnap.data() }] : [];
          return { docs: docs, total: docs.length };
        } },
      ];

      try {
        const loaded = await Promise.all(
          collectionList.map(async (collectionItem) => {
            try {
              const { docs, total } = await collectionItem.loader();
              return {
                title: collectionItem.title,
                label: collectionItem.label,
                type: collectionItem.type,
                sampleDoc: docs[0] || null,
                totalCount: total,
              };
            } catch (collectionError: any) {
              return {
                title: collectionItem.title,
                label: collectionItem.label,
                type: collectionItem.type,
                sampleDoc: null,
                totalCount: 0,
                error: collectionError?.message || 'Failed to load collection',
              };
            }
          })
        );
        setCollectionsState(loaded);
      } catch (loadError: any) {
        setError(loadError?.message || 'Unable to load firestore collections');
      } finally {
        setLoading(false);
      }
    };

    loadFirestoreData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Firestore Inspector
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Each collection shows only 1 sample document to understand the schema • Timestamps are human-readable
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-12 shadow-sm text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
            <p className="mt-4 text-gray-600 font-medium">Loading Firestore data...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {collectionsState.map((collectionEntry) => {
              const isExpanded = expandedDocs[collectionEntry.label] || false;
              
              return (
                <div key={collectionEntry.label} className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                            {collectionEntry.type === 'singleDoc' ? 'DOC' : 'COL'}
                          </span>
                          {collectionEntry.title}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-500">
                            📄 {collectionEntry.totalCount} document{collectionEntry.totalCount !== 1 ? 's' : ''}
                          </p>
                          {collectionEntry.type === 'collection' && collectionEntry.totalCount > 1 && (
                            <p className="text-xs text-blue-600">
                              ⚡ Showing 1 sample document
                            </p>
                          )}
                        </div>
                      </div>
                      {collectionEntry.sampleDoc && (
                        <button
                          onClick={() => copyToClipboard(collectionEntry.sampleDoc!.id, collectionEntry.sampleDoc!.data)}
                          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 transition-colors"
                          title="Copy JSON"
                        >
                          📋 {copiedDocId === collectionEntry.sampleDoc?.id ? 'Copied!' : 'Copy'}
                        </button>
                      )}
                    </div>
                    {collectionEntry.error && (
                      <p className="mt-2 text-xs text-red-600">Error: {collectionEntry.error}</p>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {!collectionEntry.sampleDoc ? (
                      <div className="text-center py-8 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-sm">No documents found</p>
                      </div>
                    ) : (
                      <>
                        {/* Document ID */}
                        <div className="mb-3 pb-2 border-b border-gray-100">
                          <p className="text-xs text-gray-500 font-mono break-all">
                            <span className="font-semibold text-gray-600">ID:</span> {collectionEntry.sampleDoc.id}
                          </p>
                        </div>
                        
                        {/* JSON Content */}
                        <div className="bg-gray-900 rounded-lg overflow-hidden">
                          <pre className="text-xs font-mono text-gray-100 p-3 overflow-x-auto">
                            {getFormattedJson(collectionEntry.sampleDoc.data, isExpanded).content}
                          </pre>
                        </div>
                        
                        {/* Show More / Show Less Button */}
                        {getFormattedJson(collectionEntry.sampleDoc.data, isExpanded).truncated && (
                          <button
                            onClick={() => toggleExpand(collectionEntry.label)}
                            className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Show Full Document ({getFormattedJson(collectionEntry.sampleDoc.data, false).totalLines} lines)
                          </button>
                        )}
                        
                        {isExpanded && (
                          <button
                            onClick={() => toggleExpand(collectionEntry.label)}
                            className="mt-3 text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Show Less
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FirestoreInspector;