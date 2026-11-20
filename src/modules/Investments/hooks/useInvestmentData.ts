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

// One row of the list = the investment + the Somity's own funded amount.
export type InvestmentRow = Investment & { somity_funded: number };

export function useInvestmentList() {
  const [rows, setRows] = useState<InvestmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [capped, setCapped] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // 2 reads in total, regardless of how many rows are on screen:
  //   1) the investments (soft-deleted removed), 2) the Somity's own participant rows.
  const load = useCallback(async () => {
    setError(null);
    try {
      const [{ items, capped: isCapped }, somity] = await Promise.all([
        investmentService.listForTable(),
        participantService.listSomity(),
      ]);
      const funded = new Map<string, number>();
      somity.forEach((p) => funded.set(p.investment_id, (funded.get(p.investment_id) || 0) + (p.funded_amount || 0)));
      if (!alive.current) return;
      setRows(items.map((i) => ({ ...i, somity_funded: funded.get(i.id) || 0 })));
      setCapped(isCapped);
    } catch (e) {
      console.error('[investments] list load failed', e);
      if (alive.current) setError(msg(e));
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { rows, loading, error, capped, reload: load };
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
