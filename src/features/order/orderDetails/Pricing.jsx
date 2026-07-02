import React from "react";

const fmt = (v) =>
  `₱${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Line = ({ label, value, strong, danger, highlight }) => (
  <div className={`flex justify-between items-center px-1.5 sm:px-2 py-1.5 ${highlight ? "bg-primary/5 rounded-lg" : ""}`}>
    <span className={`text-xs sm:text-sm text-gray-600 ${strong ? "font-semibold text-gray-700" : ""}`}>{label}</span>
    <span
      className={
        highlight
          ? "text-right text-primary font-bold text-sm sm:text-base"
          : danger
            ? "text-right text-red-600 font-medium text-xs sm:text-sm"
            : `text-right text-xs sm:text-sm ${strong ? "font-semibold" : "font-medium"}`
      }
    >
      {value}
    </span>
  </div>
);

const Divider = () => <div className="border-t border-gray-200 my-1" />;

/**
 * Pricing (Pricing Summary)
 *
 * Mirrors the ViewQuotation Financial Summary: the sample is part of the order
 * total (decision: fold sample into Grand Total). Component breakdown ->
 * Subtotal -> Discount -> Grand Total -> 60/40 payment terms. Bold Subtotal /
 * Grand Total use the backend-authoritative `order.subtotal` / `order.grand_total`
 * (which now include the sample), so the order reconciles with the quotation.
 */
const Pricing = ({ order }) => {
  const breakdown = order?.breakdown_json || {};
  const items = order?.items_json || [];
  const addons = order?.addons_json || [];

  // ── Component totals (informational). ─────────────────────────────────────
  const itemsTotal = items.reduce(
    (sum, it) =>
      sum +
      (Number(
        it.total_amount ??
          it.total ??
          (Number(it.price_per_piece) || 0) * (Number(it.quantity) || 0),
      ) || 0),
    0,
  );
  const addonsTotal = addons.reduce((sum, a) => sum + (Number(a.total) || 0), 0);
  const customPatternFee = Number(breakdown?.custom_pattern_fee) || 0;
  const dtfTotal = Number(breakdown?.dtf_order_total) || 0;

  // ── Sample — folded into the order total (read the populated
  //    breakdown_json.sample_breakdown; fall back to the OrderSamples record). ─
  const sampleBreakdown = breakdown?.sample_breakdown || {};
  const orderSamples = Array.isArray(order?.samples) ? order.samples : [];
  const sampleTotal =
    (Number(sampleBreakdown?.price_per_piece) || 0) ||
    orderSamples.reduce((s, x) => s + (Number(x.total_price) || 0), 0);
  const sampleApparel = sampleBreakdown?.sample_apparel || orderSamples[0]?.size || "";
  const sampleUnit =
    Number(sampleBreakdown?.unit_price) || Number(orderSamples[0]?.unit_price) || 0;
  const sampleQty = sampleBreakdown?.quantity ?? orderSamples[0]?.quantity ?? null;
  const hasSample = sampleTotal > 0;

  // ── Authoritative totals (sample-inclusive). ──────────────────────────────
  const subtotal =
    Number(order?.subtotal) ||
    itemsTotal + addonsTotal + sampleTotal + customPatternFee + dtfTotal;
  const discountAmt = Number(order?.discount_amount) || 0;
  const discountType = order?.discount_type || "";
  const discountPrice = Number(order?.discount_price) || 0;
  const grandTotal = Number(order?.grand_total) || subtotal - discountAmt;

  // Full-Payment plan: 100% collected upfront at the sample gate — no 60/40
  // split and no balance due. Plan-driven so legacy full-plan orders whose
  // stored breakdown still says 60/40 display correctly too.
  const isFullPayment = order?.payment_plan === "full_payment";
  const downpayment = isFullPayment
    ? grandTotal
    : Number(breakdown?.downpayment) || grandTotal * 0.6;
  const balance = isFullPayment
    ? 0
    : Number(breakdown?.balance) || grandTotal - downpayment;

  const discountLabel =
    discountType === "percentage"
      ? `Discount (${discountPrice}%)`
      : discountType === "fixed"
        ? "Discount (Fixed)"
        : "Discount";

  return (
    <section className="flex-col flex gap-y-2 sm:gap-y-3">
      <h1 className="font-semibold text-base sm:text-lg">Pricing Summary</h1>
      <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
        {/* Sample detail (part of the order total) */}
        {hasSample && (
          <>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5 px-1.5 sm:px-2">
              Sample
            </p>
            <Line label="Sample Apparel" value={sampleApparel || "N/A"} />
            <Line label="Unit Price" value={fmt(sampleUnit)} />
            <Line label="Quantity" value={sampleQty ?? "N/A"} />
            <Divider />
          </>
        )}

        {/* Component breakdown */}
        <Line label="Items Total" value={fmt(itemsTotal)} />
        {addonsTotal > 0 && <Line label="Addons Total" value={fmt(addonsTotal)} />}
        {hasSample && <Line label="Sample Total" value={fmt(sampleTotal)} />}
        {customPatternFee > 0 && (
          <Line label="Custom Pattern Fee" value={fmt(customPatternFee)} />
        )}
        {dtfTotal > 0 && <Line label="DTF Total" value={fmt(dtfTotal)} />}

        <Divider />

        {/* Totals (sample included) */}
        <Line label="Subtotal" value={fmt(subtotal)} strong />
        {discountAmt > 0 && <Line label={discountLabel} value={`− ${fmt(discountAmt)}`} danger />}
        <Line label="Grand Total" value={fmt(grandTotal)} highlight />

        {/* Payment terms — Full Payment (100% upfront) or the 60/40 split */}
        <Divider />
        {isFullPayment ? (
          <>
            <Line label="Full Payment (100%)" value={fmt(grandTotal)} strong />
            <p className="text-[10px] text-gray-400 text-right mt-1 px-1.5 sm:px-2">
              <i className="fas fa-check-circle mr-1"></i>Paid in full upfront — no balance due
            </p>
          </>
        ) : (
          <>
            <Line label="Downpayment (60%)" value={fmt(downpayment)} strong />
            <Line label="Balance (40%)" value={fmt(balance)} strong />
            <p className="text-[10px] text-gray-400 text-right mt-1 px-1.5 sm:px-2">
              <i className="fas fa-clock mr-1"></i>Balance due upon delivery/pickup
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default Pricing;
