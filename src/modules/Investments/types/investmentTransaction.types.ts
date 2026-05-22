export interface InvestmentProfitDistribution {
  id: string;
  investmentId: string;
  distributionDate: Date;
  periodStart: Date;
  periodEnd: Date;
  profitAmount: number;
  status: "pending" | "distributed" | "failed";
}
