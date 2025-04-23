
import React from "react";

interface FinancialSummaryProps {
  toReceiveToday: number;
  toPayToday: number;
}

export function FinancialSummaryCard({ toReceiveToday, toPayToday }: FinancialSummaryProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 flex justify-between">
      <div>
        <h2 className="text-lg font-medium">Financeiro do Dia</h2>
        <p className="text-green-600">A Receber: {toReceiveToday}</p>
        <p className="text-red-600">A Pagar: {toPayToday}</p>
      </div>
    </div>
  );
}
