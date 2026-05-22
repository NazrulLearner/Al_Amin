import { useState } from "react";
import { businessService } from "../services/businessService";

export default function BusinessCreatePage() {
  const [name, setName] = useState("");

  const createBusiness = async () => {
    if (!name.trim()) return;

    await businessService.create({
      id: Date.now().toString(),
      name: name.trim(),
      type: "fdr",
      initialInvestment: 0,
      currentValue: 0,
      totalIncome: 0,
      totalExpense: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    });

    alert("Business Created");
    setName("");
  };

  return (
    <div className="max-w-xl space-y-4 p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-900">Create Business</h1>

      <input
        placeholder="Business Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2"
      />

      <button
        onClick={createBusiness}
        className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
      >
        Create
      </button>
    </div>
  );
}
