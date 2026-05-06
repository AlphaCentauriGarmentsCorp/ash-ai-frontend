import React from "react";
import { Section } from "../common/Section";

const fmt = (v) =>
  `₱${(Number(v) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const SummarySection = ({ summary }) => {
  const {
    totalQuantity = 0,
    averageUnitPrice = 0,
    totalCost = 0,
    totalAmount = 0,
    estimatedTotal = 0,
    remainingBalance = 0,
  } = summary || {};

  const cards = [
    { label: "Total Quantity", value: totalQuantity, isCurrency: false, icon: "fa-layer-group" },
    { label: "Avg. Unit Price", value: averageUnitPrice, isCurrency: true, icon: "fa-tag" },
    { label: "Total Cost", value: totalCost, isCurrency: true, icon: "fa-coins" },
    { label: "Total Amount", value: totalAmount, isCurrency: true, icon: "fa-receipt", highlight: true },
  ];

  return (
    <Section title="Summary">
      <div className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, value, isCurrency, icon, highlight }) => (
            <div
              key={label}
              className={`rounded-xl border px-5 py-4 flex flex-col gap-1 shadow-sm
                ${highlight
                  ? "bg-primary/5 border-primary/20"
                  : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wide">
                <i className={`fas ${icon} text-[11px] ${highlight ? "text-primary" : "text-gray-400"}`}></i>
                {label}
              </div>
              <p className={`text-xl font-bold mt-1 ${highlight ? "text-primary" : "text-gray-800"}`}>
                {isCurrency ? fmt(value) : value}
              </p>
            </div>
          ))}
        </div>

        {/* Estimated total callout */}
        <div className="mt-4 flex justify-end">
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-6 py-3 flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Estimated Total:</span>
            <span className="text-2xl font-bold text-primary">{fmt(estimatedTotal)}</span>
          </div>
        </div>
      </div>
    </Section>
  );
};