import React from "react";
import POItemsSizeBreakdown from "./POItemsSizeBreakdown";
import { resolveImageUrl } from "../../../utils/designImage";

const Row = ({ label, value }) => (
  <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2 last:border-b-0">
    <p className="text-gray-500 text-xs sm:text-sm">{label}</p>
    <p className="text-xs sm:text-sm font-medium text-right max-w-[60%] break-words">{value || "N/A"}</p>
  </div>
);

// One label spec card (Brand or Care/Size). Renders only when the label is
// enabled, matching the new structured label spec shared with the quotation.
const LabelBlock = ({ title, spec }) => {
  if (!spec || !spec.enabled) return null;
  return (
    <div className="rounded-lg border border-gray-200 sm:border-gray-300 p-2 sm:p-3">
      <p className="text-xs sm:text-sm font-semibold text-primary mb-1">{title}</p>
      <Row label="Material" value={spec.material} />
      <Row label="Method" value={spec.method} />
      <Row label="Placement" value={spec.placement} />
      {spec.measurement ? <Row label="Measurement" value={spec.measurement} /> : null}
      {spec.notes ? <Row label="Notes" value={spec.notes} /> : null}
    </div>
  );
};

const fmt = (v) =>
  `₱${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ProductDetails = ({ order }) => {
  const addons = order?.addons_json || [];

  return (
    <>
      {/* ── Apparel Info ─────────────────────────────────────────────────── */}
      <section className="flex-col flex gap-y-2 sm:gap-y-3">
        <h1 className="font-semibold text-base sm:text-lg">Apparel Information</h1>
        <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
          <Row label="Apparel Type" value={order?.apparel_type} />
          <Row label="Pattern Type" value={order?.pattern_type} />
          <Row label="Neckline" value={order?.apparel_neckline} />
          <Row label="Print Method" value={order?.print_method} />
          <Row label="Shirt Color" value={order?.shirt_color} />
          <Row label="Print Area" value={order?.print_area} />
          <Row label="Special Print" value={order?.special_print} />
        </div>
      </section>

      {/* ── Production Details ───────────────────────────────────────────── */}
      <section className="flex-col flex gap-y-2 sm:gap-y-3">
        <h1 className="font-semibold text-base sm:text-lg">Production Details</h1>
        <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
          <Row label="Design Name" value={order?.design_name} />
          <Row label="Service Type" value={order?.service_type} />
          <Row label="Print Service" value={order?.print_service} />
          <Row label="Fabric Type" value={order?.fabric_type} />
          <Row label="Fabric Supplier" value={order?.fabric_supplier} />
          <Row label="Fabric Color" value={order?.fabric_color} />
          <Row label="Thread Color" value={order?.thread_color} />
          <Row label="Ribbing Color" value={order?.ribbing_color} />
        </div>
      </section>

      {/* ── Labels ───────────────────────────────────────────────────────── */}
      {(() => {
        const brand = order?.brand_label;
        const care = order?.care_label;
        const designUrl = order?.label_design_path ? resolveImageUrl(order.label_design_path) : "";
        const anyEnabled = !!(brand?.enabled || care?.enabled);
        if (!anyEnabled && !designUrl) return null;
        return (
          <section className="flex-col flex gap-y-2 sm:gap-y-3">
            <h1 className="font-semibold text-base sm:text-lg">Labels</h1>
            <div className="flex flex-col gap-2 sm:gap-3">
              <LabelBlock title="Brand Label" spec={brand} />
              <LabelBlock title="Care / Size Label" spec={care} />
              {designUrl && (
                <div className="rounded-lg border border-gray-200 sm:border-gray-300 p-2 sm:p-3 flex items-center gap-3">
                  <span className="text-xs sm:text-sm text-gray-500">Label Design</span>
                  <img
                    src={designUrl}
                    alt="Label Design"
                    className="h-10 w-10 object-cover rounded border border-gray-200"
                  />
                  <a
                    href={designUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs sm:text-sm text-primary hover:underline break-all"
                  >
                    View file
                  </a>
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {/* ── PO Items & Size Breakdown (shared component) ───────── */}
      <POItemsSizeBreakdown order={order} />

      {/* ── Addons ───────────────────────────────────────────────────────── */}
      {addons.length > 0 && (
        <section className="flex-col flex gap-y-2 sm:gap-y-3">
          <h1 className="font-semibold text-base sm:text-lg">Addons</h1>
          <div className="border border-gray-200 sm:border-gray-300 rounded-lg sm:rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Name</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-600">Price/Pc</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-600">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {addons.map((addon, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{addon.name || "—"}</td>
                      <td className="px-3 py-2 text-right">{fmt(addon.price_per_piece ?? addon.price)}</td>
                      <td className="px-3 py-2 text-right">{addon.quantity ?? 1}</td>
                      <td className="px-3 py-2 text-right font-semibold text-primary">{fmt(addon.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── Free Items / Notes ───────────────────────────────────────────── */}
      {(order?.free_items || order?.freebie_items || order?.freebie_color || order?.freebie_others) && (
        <section className="flex-col flex gap-y-2 sm:gap-y-3">
          <h1 className="font-semibold text-base sm:text-lg">Free Items</h1>
          <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
            {order?.freebie_items && <Row label="Freebie Item" value={order.freebie_items} />}
            {order?.freebie_color && <Row label="Freebie Color" value={order.freebie_color} />}
            {(order?.freebie_others || order?.free_items) && (
              <Row label="Other Freebies" value={order.freebie_others || order.free_items} />
            )}
          </div>
        </section>
      )}

      {order?.notes && (
        <section className="flex-col flex gap-y-2 sm:gap-y-3">
          <h1 className="font-semibold text-base sm:text-lg">Notes</h1>
          <p className="text-xs sm:text-sm p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-line">
            {order.notes}
          </p>
        </section>
      )}
    </>
  );
};

export default ProductDetails;