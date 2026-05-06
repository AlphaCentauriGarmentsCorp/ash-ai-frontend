import React from "react";

const fmt = (v) =>
  `₱${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Row = ({ label, value, highlight }) => (
  <div className={`flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2 last:border-b-0 ${highlight ? "bg-primary/5" : ""}`}>
    <p className="text-gray-500 text-xs sm:text-sm">{label}</p>
    <p className={`text-xs sm:text-sm font-medium text-right ${highlight ? "text-primary font-bold" : ""}`}>{value}</p>
  </div>
);

const Pricing = ({ order }) => {
  const subtotal = Number(order?.subtotal) || 0;
  const discountAmt = Number(order?.discount_amount) || 0;
  const grandTotal = Number(order?.grand_total) || 0;
  const discountType = order?.discount_type || "";
  const discountPrice = Number(order?.discount_price) || 0;

  const discountLabel = discountType === "percentage"
    ? `Discount (${discountPrice}%)`
    : discountType === "fixed"
      ? "Discount (Fixed)"
      : "Discount";

  return (
    <section className="flex-col flex gap-y-2 sm:gap-y-3">
      <h1 className="font-semibold text-base sm:text-lg">Pricing</h1>
      <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
        <Row label="Subtotal" value={fmt(subtotal)} />
        {discountAmt > 0 && (
          <Row label={discountLabel} value={`− ${fmt(discountAmt)}`} />
        )}
        <Row label="Grand Total" value={fmt(grandTotal)} highlight />
      </div>
    </section>
  );
};

export default Pricing;