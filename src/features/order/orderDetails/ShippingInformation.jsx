import React from "react";

const Row = ({ label, value }) => (
  <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2 last:border-b-0">
    <p className="text-gray-500 text-xs sm:text-sm">{label}</p>
    <p className="text-xs sm:text-sm font-medium text-right max-w-[60%] break-words">{value || "N/A"}</p>
  </div>
);

/**
 * ShippingInformation
 *
 * The new orders schema no longer stores courier/method/address as top-level columns.
 * These were removed in the recreate_orders_table migration. They may live inside
 * breakdown_json or item_config_json if the quotation carried them.
 * For now we surface what we have and show a placeholder where fields are absent.
 */
const ShippingInformation = ({ order }) => {
  const config = order?.item_config_json || {};

  return (
    <section className="flex-col flex gap-y-2 sm:gap-y-3">
      <h1 className="font-semibold text-base sm:text-lg">Shipping Information</h1>
      <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
        <Row label="Print Area" value={order?.print_area} />
        <Row label="Special Print" value={order?.special_print} />
        <Row label="Shirt Color" value={order?.shirt_color} />
        <Row label="Free Items" value={order?.free_items} />
      </div>
      {order?.notes && (
        <div className="border border-gray-200 sm:border-gray-300 p-3 sm:p-4 rounded-lg sm:rounded-xl">
          <h2 className="font-medium text-sm sm:text-base mb-2">Notes</h2>
          <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line">{order.notes}</p>
        </div>
      )}
    </section>
  );
};

export default ShippingInformation;