import type { Business } from "../types/business.types";
import { calculateProfit } from "../utils/businessHelpers";

export default function BusinessCard({ business }: { business: Business }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 10 }}>
      <h3>{business.name}</h3>

      <p>Type: {business.type}</p>
      <p>Investment: {business.initialInvestment}</p>

      <p>
        Profit:{" "}
        <b>{calculateProfit(business)}</b>
      </p>
    </div>
  );
}