export const investmentCalculator = {
  calculateProfit(amount: number, profitPercent: number): number {
    return (amount * profitPercent) / 100;
  },

  calculateTotalReturn(amount: number, profitPercent: number): number {
    return amount + this.calculateProfit(amount, profitPercent);
  },

  calculateMonthlyProfit(amount: number, profitPercent: number, months: number): number {
    const totalProfit = this.calculateProfit(amount, profitPercent);
    return totalProfit / months;
  },

  calculateMaturityDate(startDate: Date, durationMonths: number): Date {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + durationMonths);
    return date;
  },

  calculateRemainingDays(maturityDate: Date): number {
    const today = new Date();
    const diffTime = maturityDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  calculateProgressPercentage(startDate: Date, maturityDate: Date): number {
    const total = maturityDate.getTime() - startDate.getTime();
    const elapsed = new Date().getTime() - startDate.getTime();
    if (total <= 0) return 100;
    const percentage = (elapsed / total) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  },

  getInvestmentStatus(maturityDate: Date): 'active' | 'matured' {
    const remainingDays = this.calculateRemainingDays(maturityDate);
    return remainingDays <= 0 ? 'matured' : 'active';
  },

  calculateROI(amount: number, profit: number): number {
    if (amount === 0) return 0;
    return (profit / amount) * 100;
  },

  calculateAnnualizedReturn(profit: number, amount: number, days: number): number {
    if (amount === 0 || days === 0) return 0;
    return (profit / amount) * (365 / days) * 100;
  }
};