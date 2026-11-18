// ==========================================
// Documents Tab
// ==========================================

import React, { useState } from 'react';
import { formatDate } from '../../../utils/investmentUtils';
import { Upload, FileText, Eye, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../../../app/providers/AuthProvider';
import { documentService } from '../../../services';
import { toActor } from '../../../utils/actor';
import type { Investment, InvestmentParticipant, InvestmentDocument } from '../../../types/investment.types';

const DOC_TYPES = [
  'Investment Proposal', 'Agreement', 'Contract', 'FDR Certificate',
  'Investor Agreement', 'Payment Proof', 'Return Proof',
  'Security/Collateral Document', 'Other',
];

interface Props {
  investment: Investment;
  documents: InvestmentDocument[];
  participants: InvestmentParticipant[];
  onReload: () => void;
}

export default function DocumentsTab({ investment, documents, participants, onReload }: Props) {
  const { user, userData } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    file_name: '',
    document_type: 'Investment Proposal',
    related_investor: '',
    description: '',
  });

  const submit = async () => {
    if (!form.file_name) {
      toast.error('File name required');
      return;
    }

    setSaving(true);
    try {
      await documentService.create({
        investment_id: investment.id,
        file_name: form.file_name.trim(),
        document_type: form.document_type as InvestmentDocument['document_type'],
        related_investor: form.related_investor || undefined,
        description: form.description || undefined,
        uploaded_by: toActor(user, userData).name,
        upload_date: new Date().toLocaleDateString('en-CA'),
      });
      toast.success('Document added');

      setForm({
        file_name: '',
        document_type: 'Investment Proposal',
        related_investor: '',
        description: '',
      });
      setShowForm(false);
      onReload();
    } catch (e) {
      toast.error('Error: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {documents.length} document(s) on record.
        </p>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" /> Upload Document
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2">
          <Field label="File Name">
            <input
              className="inp"
              value={form.file_name}
              onChange={(e) =>
                setForm({ ...form, file_name: e.target.value })
              }
              placeholder="e.g. agreement-2026.pdf"
            />
          </Field>
          <Field label="Document Type">
            <select
              className="inp"
              value={form.document_type}
              onChange={(e) =>
                setForm({ ...form, document_type: e.target.value })
              }
            >
              {DOC_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Related Investor">
            <select
              className="inp"
              value={form.related_investor}
              onChange={(e) =>
                setForm({ ...form, related_investor: e.target.value })
              }
            >
              <option value="">—</option>
              {participants.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description">
            <input
              className="inp"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Field>
          <div className="flex justify-end sm:col-span-2">
            <button
              onClick={submit}
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Save Document
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-4 py-2.5 label-eyebrow">File Name</th>
              <th className="px-4 py-2.5 label-eyebrow">Type</th>
              <th className="px-4 py-2.5 label-eyebrow">Related Investor</th>
              <th className="px-4 py-2.5 label-eyebrow">Uploaded By</th>
              <th className="px-4 py-2.5 label-eyebrow">Upload Date</th>
              <th className="px-4 py-2.5 label-eyebrow">Status</th>
              <th className="px-4 py-2.5 label-eyebrow text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  <FileText className="mx-auto mb-2 h-6 w-6 opacity-40" />
                  No documents yet.
                </td>
              </tr>
            ) : (
              documents.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{d.file_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {d.document_type}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {d.related_investor || '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {d.uploaded_by || '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(d.upload_date)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium">
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="rounded p-1.5 text-muted-foreground hover:bg-muted">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded p-1.5 text-muted-foreground hover:bg-muted">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-eyebrow">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}