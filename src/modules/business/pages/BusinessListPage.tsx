import { useEffect, useState } from "react";
import { businessService } from "../services/businessService";
import type { Business } from "../types/business.types";
import BusinessCard from "../components/BusinessCard";

export default function BusinessListPage() {
  const [list, setList] = useState<Business[]>([]);

  useEffect(() => {
    businessService.getAll().then(setList);
  }, []);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-900">Business List</h1>

      {list.length === 0 && (
        <p className="text-gray-500">No business found. Create one first.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((b) => (
          <BusinessCard key={b.id} business={b} />
        ))}
      </div>
    </div>
  );
}
