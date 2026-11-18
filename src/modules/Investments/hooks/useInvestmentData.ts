// ==========================================
// Investment data hooks
//   useInvestmentList()      -> list page (investments + participants)
//   useInvestmentDetail(id)  -> detail page (everything for one investment)
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  investmentService,
  participantService,
  fundingService,
  returnService,
  transactionService,
  documentService,
  historyService,
} from '../services';
import type {
  Investment,
  InvestmentParticipant,
  FundingRecord,
  ReturnRecord,
  InvestmentTransaction,
  InvestmentDocument,
  InvestmentHistory,
} from '../types';

const msg = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

export function useInvestmentList() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [participants, setParticipants] = useState<InvestmentParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [inv, parts] = await Promise.all([investmentService.list(), participantService.listAll()]);
      setInvestments(inv);
      setParticipants(parts);
    } catch (e) {
      console.error('[investments] list load failed', e);
      setError(msg(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { investments, participants, loading, error, reload: load };
}

export function useInvestmentDetail(id?: string) {
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [participants, setParticipants] = useState<InvestmentParticipant[]>([]);
  const [funding, setFunding] = useState<FundingRecord[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [transactions, setTransactions] = useState<InvestmentTransaction[]>([]);
  const [documents, setDocuments] = useState<InvestmentDocument[]>([]);
  const [history, setHistory] = useState<InvestmentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const [inv, p, f, r, t, d, h] = await Promise.all([
        investmentService.getById(id),
        participantService.listByInvestment(id),
        fundingService.listByInvestment(id),
        returnService.listByInvestment(id),
        transactionService.listByInvestment(id),
        documentService.listByInvestment(id),
        historyService.listByInvestment(id),
      ]);
      if (!alive.current) return;
      setInvestment(inv);
      setParticipants(p);
      setFunding(f);
      setReturns(r);
      setTransactions(t);
      setDocuments(d);
      setHistory(h);
    } catch (e) {
      console.error('[investments] detail load failed', e);
      if (alive.current) setError(msg(e));
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // reload() keeps the screen visible (no spinner flash) after a save
  return { investment, participants, funding, returns, transactions, documents, history, loading, error, reload: load };
}
