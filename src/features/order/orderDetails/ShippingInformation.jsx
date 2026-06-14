import React from "react";
import {
  courierList,
  shippingMethodList,
} from "../../../constants/formOptions/orderOptions";

// Title-case a raw stored value as a graceful fallback when it does not match
// any dropdown option (e.g. legacy data saved before the option lists existed):
//   "lakbay_express" -> "Lakbay Express"
const prettify = (raw) =>
  String(raw || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Resolve a stored option value to the human label defined on the Add Order
// dropdown, falling back to a prettified version of the raw value.
const labelFor = (options, value) => {
  if (!value) return "";
  const match = options.find((o) => o.value === value);
  return match?.label || prettify(value);
};

const Row = ({ label, value }) => (
  <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2 last:border-b-0">
    <p className="text-gray-500 text-xs sm:text-sm">{label}</p>
    <p className="text-xs sm:text-sm font-medium text-right max-w-[60%] break-words">{value || "N/A"}</p>
  </div>
);

/**
 * ShippingInformation
 *
 * Shows the courier / delivery details captured on the Add Order form.
 * The `courier` and `method` columns persist the dropdown *value*
 * (e.g. "lakbay_express", "standard"); we map them back to their proper
 * dropdown *labels* ("Lakbay Express", "Standard Delivery (3-5 Business Days)")
 * for display.
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

  const courierLabel = labelFor(courierList, order?.courier);
  const methodLabel = labelFor(shippingMethodList, order?.method);

  return (
    <section className="flex-col flex gap-y-2 sm:gap-y-3">
      <h1 className="font-semibold text-base sm:text-lg">Shipping Information</h1>
      <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
        <Row label="Courier" value={courierLabel} />
        <Row label="Shipping Method" value={methodLabel} />
        <Row label="Receiver's Name" value={order?.receiver_name} />
        <Row label="Contact Number" value={order?.contact_number || order?.receiver_contact} />
        <Row label="Address" value={address} />
      </div>
    </section>
  );
};

export default ShippingInformation;
