import api from "./axios";

/**
 * Phase 5-I — Logistics Portal API client.
 *
 * Two tabs:
 *   - Subcontract Shipments (active-shipments + shipment/assignment context + writes)
 *   - Customer Delivery (placeholder until a later phase)
 */
export const logisticsPortalApi = {
  // ── Listings ─────────────────────────────────────────────────────

  activeShipments: async () => {
    const { data } = await api.get("/portal/logistics/active-shipments");
    return data;
  },

  activeDeliveries: async () => {
    const { data } = await api.get("/portal/logistics/active-deliveries");
    return data;
  },

  // ── Context ──────────────────────────────────────────────────────

  shipmentContext: async (shipmentId) => {
    const { data } = await api.get(`/portal/logistics/shipment-context/${shipmentId}`);
    return data;
  },

  assignmentContext: async (assignmentId) => {
    const { data } = await api.get(`/portal/logistics/assignment-context/${assignmentId}`);
    return data;
  },

  // ── Shipment writes ──────────────────────────────────────────────

  createShipment: async (payload) => {
    const { data } = await api.post("/portal/logistics/shipments", payload);
    return data;
  },

  updateShipment: async (shipmentId, payload) => {
    const { data } = await api.put(`/portal/logistics/shipments/${shipmentId}`, payload);
    return data;
  },

  updateShipmentStatus: async (shipmentId, status, issueNote = null) => {
    const { data } = await api.patch(`/portal/logistics/shipments/${shipmentId}/status`, {
      status,
      issue_note: issueNote,
    });
    return data;
  },

  /**
   * Upload a proof file. `kind` is one of:
   *   payment | pickup | delivery | signature | gas_receipt
   */
  uploadProof: async (shipmentId, kind, file) => {
    const form = new FormData();
    form.append("kind", kind);
    form.append("file", file);

    const { data } = await api.post(
      `/portal/logistics/shipments/${shipmentId}/proof`,
      form,
      { headers: { "Content-Type": undefined } },
    );
    return data;
  },

  // ── Return verification ──────────────────────────────────────────

  verifyReturn: async (assignmentId, { qtyReceived, conditionNotes, photoFront, photoBack }) => {
    const form = new FormData();
    form.append("return_qty_received", qtyReceived);
    if (conditionNotes) form.append("return_condition_notes", conditionNotes);
    if (photoFront)     form.append("return_photo_front", photoFront);
    if (photoBack)      form.append("return_photo_back", photoBack);

    const { data } = await api.post(
      `/portal/logistics/assignments/${assignmentId}/verify-return`,
      form,
      { headers: { "Content-Type": undefined } },
    );
    return data;
  },
};

export default logisticsPortalApi;
