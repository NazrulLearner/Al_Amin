export type BusinessStatus = "active" | "inactive" | "closed";

export interface Business {
  id: string;
  name: string;
  type: string;
  initialInvestment: number;
  currentValue: number;
  totalIncome: number;
  totalExpense: number;
  status: BusinessStatus;
  createdAt: string;
}
