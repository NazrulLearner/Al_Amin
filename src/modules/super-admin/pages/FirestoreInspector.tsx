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
  docs: FirestoreDocItem[];
  error?: string;
}

const FirestoreInspector: React.FC = () => {
  const [collectionsState, setCollectionsState] = useState<FirestoreCollectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFirestoreData = async () => {
      setLoading(true);
      setError(null);

      const collectionList: Array<{
        title: string;
        label: string;
        type: 'collection' | 'singleDoc';
        loader: () => Promise<FirestoreDocItem[]>;
      }> = [
        { title: 'users', label: 'users', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.users());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'members', label: 'members', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.members());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'contributions', label: 'contributions', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.contributions());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'collector_balances', label: 'collector_balances', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.collectorBalances());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'deposits', label: 'deposits', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.deposits());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'loanApplications', label: 'loanApplications', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.loanApplications());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'loans', label: 'loans', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.loans());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'loan_repayments', label: 'loan_repayments', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.loanRepayments());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'loanDisbursements', label: 'loanDisbursements', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.loanDisbursements());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'bank_accounts', label: 'bank_accounts', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.bankAccounts());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'cash_balances', label: 'cash_balances', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.cashBalances());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'fund_transactions', label: 'fund_transactions', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.fundTransactions());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'daily_closing', label: 'daily_closing', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.dailyClosing());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'audit_logs', label: 'audit_logs', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.auditLogs());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'roles', label: 'roles', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.roles());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'investments', label: 'investments', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.investments());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'investment_projects', label: 'investment_projects', type: 'collection', loader: async () => {
          const snapshot = await getDocs(collections.investmentProjects());
          return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
        } },
        { title: 'somity_settings/config', label: 'somity_settings/config', type: 'singleDoc', loader: async () => {
          const docSnap = await getDoc(collections.somitySettings());
          return docSnap.exists() ? [{ id: docSnap.id, data: docSnap.data() }] : [];
        } },
      ];

      try {
        const loaded = await Promise.all(
          collectionList.map(async (collectionItem) => {
            try {
              const docs = await collectionItem.loader();
              return {
                title: collectionItem.title,
                label: collectionItem.label,
                type: collectionItem.type,
                docs,
              };
            } catch (collectionError: any) {
              return {
                title: collectionItem.title,
                label: collectionItem.label,
                type: collectionItem.type,
                docs: [],
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
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Firestore Inspector</h1>
          <p className="text-sm text-gray-500">
            Collections name - document id - data (JSON) দেখানো হচ্ছে।
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="rounded-lg bg-white p-6 shadow-sm text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">ডাটা লোড হচ্ছে...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {collectionsState.map((collectionEntry) => (
            <div key={collectionEntry.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{collectionEntry.title}</h2>
                  <p className="text-sm text-gray-500">{collectionEntry.type === 'singleDoc' ? 'Single document' : 'Collection'} • {collectionEntry.docs.length} item(s)</p>
                </div>
                {collectionEntry.error && (
                  <p className="text-sm text-red-600">Error: {collectionEntry.error}</p>
                )}
              </div>

              {collectionEntry.docs.length === 0 && !collectionEntry.error ? (
                <p className="mt-3 text-sm text-gray-500">No documents found.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {collectionEntry.docs.map((docItem) => (
                    <div key={docItem.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-700">Doc ID: {docItem.id}</span>
                        <span className="text-xs text-gray-500">{collectionEntry.label}</span>
                      </div>
                      <pre className="mt-2 overflow-x-auto rounded bg-black/5 p-3 text-xs leading-5 text-gray-800">
                        {JSON.stringify(docItem.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FirestoreInspector;
