import type { Business } from "../types/business.types";

const businesses: Business[] = [];

export const businessService = {
  async getAll(): Promise<Business[]> {
    return [...businesses];
  },

  async create(business: Business): Promise<Business> {
    businesses.unshift(business);
    return business;
  },
};
