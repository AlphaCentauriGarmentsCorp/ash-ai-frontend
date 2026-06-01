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
 * Shows the courier / delivery details captured on the Add Order form
 * (courier, shipping method, receiver, contact, address). These are now
 * persisted as order columns and exposed by OrderResource.
 */
const ShippingInformation = ({ order }) => {
  // Prefer the composed address from the API; fall back to assembling the parts.
  const address =
    order?.address ||
    [
      order?.street_address,
      order?.barangay_address,
      order?.city_address,
      order?.province_address,
      order?.postal_address,
    ]
      .filter(Boolean)
      .join(", ");

  return (
    <section className="flex-col flex gap-y-2 sm:gap-y-3">
      <h1 className="font-semibold text-base sm:text-lg">Shipping Information</h1>
      <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
        <Row label="Courier" value={order?.courier} />
        <Row label="Shipping Method" value={order?.method} />
        <Row label="Receiver's Name" value={order?.receiver_name} />
        <Row label="Contact Number" value={order?.contact_number || order?.receiver_contact} />
        <Row label="Address" value={address} />
      </div>
    </section>
  );
};

export default ShippingInformation;
