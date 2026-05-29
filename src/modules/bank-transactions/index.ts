// src/modules/bank-transactions/index.ts

// Named exports
export { bankTransactionService } from './services/bankTransactionService';
export { useBankTransactions } from './hooks/useBankTransactions';

// ✅ Add alias for backward compatibility with useBankAccounts name
export { useBankTransactions as useBankAccounts } from './hooks/useBankTransactions';

// Default export
export { default } from './services/bankTransactionService';