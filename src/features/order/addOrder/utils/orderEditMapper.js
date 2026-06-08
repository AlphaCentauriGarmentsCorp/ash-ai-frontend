/**
 * mapOrderEditOverlay — production-field overlay for Edit Order.
 *
 * useQuotationPrefill maps the quotation-derived fields (client, apparel /
 * pattern / print method, shirt color, print config, sizes) but it does NOT
 * carry the order's production details and it forces a default deadline. This
 * overlay restores everything else from the saved order so the edit form shows
 * the real values. It is spread AFTER the quotation prefill (and after the
 * client-master brand defaults) so the order's own saved values win.
 */

// Accepts "2026-07-01", "2026-07-01 00:00:00", or ISO "2026-07-01T00:00:00Z"
// and returns the YYYY-MM-DD a <input type="date"> expects.
const toDateInput = (value) => {
  if (!value) return "";
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

export const mapOrderEditOverlay = (order) => {
  if (!order) return {};
  return {
    // Apparel brand (Sorbetes / Reefer / …) — distinct from client_brand/company.
    brand: order.brand ?? "",
    priority: order.priority ?? "",
    deadline: toDateInput(order.deadline),

    // Shipping / courier
    courier: order.courier ?? "",
    method: order.method ?? "",
    receiver_name: order.receiver_name ?? "",
    contact_number: order.contact_number ?? order.receiver_contact ?? "",
    street_address: order.street_address ?? "",
    barangay_address: order.barangay_address ?? "",
    city_address: order.city_address ?? "",
    province_address: order.province_address ?? "",
    postal_address: order.postal_address ?? "",

    // Production details
    design_name: order.design_name ?? "",
    service_type: order.service_type ?? "",
    print_service: order.print_service ?? "",
    size_label: order.size_label ?? "",
    print_label_placement: order.print_label_placement ?? "",
    fabric_type: order.fabric_type ?? "",
    fabric_supplier: order.fabric_supplier ?? "",
    fabric_color: order.fabric_color ?? "",
    thread_color: order.thread_color ?? "",
    ribbing_color: order.ribbing_color ?? "",

    // Freebies
    freebie_items: order.freebie_items ?? "",
    freebie_color: order.freebie_color ?? "",
    freebie_others: order.freebie_others ?? order.free_items ?? "",

    // Payment
    deposit_percentage: order.deposit_percentage ?? 60,
    payment_plan: order.payment_plan ?? "",
    payment_method: order.payment_method ?? "",
  };
};
