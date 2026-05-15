// src/modules/finance/types/transfer.types.ts

export interface FundTransfer {
  id: string;
  transferId: string;
  amount: number;
  fromType: 'cashier' | 'bank';
  fromId: string;
  fromName: string;
  toType: 'cashier' | 'bank';
  toId: string;
  toName: string;
  paymentMethod: 'cash' | 'bank' | 'bikash' | 'nogod' | 'rocket';
  referenceNo?: string;
  bankReference?: string;
  note?: string;
  status: 'pending' | 'completed' | 'cancelled';
  completedBy?: string;
  completedByName?: string;
  completedAt?: Date;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
}

export interface TransferRequestDto {
  amount: number;
  fromType: 'cashier' | 'bank';
  fromId: string;
  toType: 'cashier' | 'bank';
  toId: string;
  paymentMethod: 'cash' | 'bank' | 'bikash' | 'nogod' | 'rocket';
  referenceNo?: string;
  bankReference?: string;
  note?: string;
  createdBy: string;
  createdByName: string;
}