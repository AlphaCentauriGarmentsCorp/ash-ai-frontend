import api from "./axios";

/**
 * Phase 4 — Stage Inputs API client.
 *
 * Mirrors backend StageInputsController endpoints under /v2/stage-inputs.
 *
 * Photo uploads use FormData. The backend accepts multipart/form-data for
 * waste/reject create endpoints and stores the file on the public disk.
 */
export const stageInputsApi = {
  // ── Waste ───────────────────────────────────────────────────────

  /**
   * List waste logs for an order (and optionally a single stage).
   *
   * @param {object} params
   * @param {number} [params.orderId]
   * @param {number} [params.orderStageId]
   * @param {number} [params.page]
   * @param {number} [params.perPage]
   */
  listWaste: async ({ orderId, orderStageId, page = 1, perPage = 50 } = {}) => {
    const { data } = await api.get("/stage-inputs/waste", {
      params: {
        order_id: orderId,
        order_stage_id: orderStageId,
        page,
        per_page: perPage,
      },
    });
    return data;
  },

  /**
   * Create a new waste log.
   *
   * @param {object} fields - { order_id, order_stage_id, quantity_pcs, notes }
   * @param {File}   [photo] - optional UploadedFile (jpeg/png/webp, ≤5MB)
   */
  createWaste: async (fields, photo) => {
    const fd = new FormData();
    fd.append("order_id", fields.order_id);
    fd.append("order_stage_id", fields.order_stage_id);
    fd.append("quantity_pcs", fields.quantity_pcs);
    if (fields.notes) fd.append("notes", fields.notes);
    if (photo) fd.append("photo", photo);

    // IMPORTANT: the axios default Content-Type is application/json. We
    // must override it for multipart so axios auto-generates the
    // boundary param (Content-Type: multipart/form-data; boundary=...).
    // Setting the header to undefined tells axios to compute it itself
    // based on the FormData payload.
    const { data } = await api.post("/stage-inputs/waste", fd, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },

  /** Manager-only delete (defensive — UI hides for non-managers). */
  deleteWaste: async (id) => {
    const { data } = await api.delete(`/stage-inputs/waste/${id}`);
    return data;
  },

  // ── Reject ──────────────────────────────────────────────────────

  listReject: async ({ orderId, orderStageId, page = 1, perPage = 50 } = {}) => {
    const { data } = await api.get("/stage-inputs/reject", {
      params: {
        order_id: orderId,
        order_stage_id: orderStageId,
        page,
        per_page: perPage,
      },
    });
    return data;
  },

  createReject: async (fields, photo) => {
    const fd = new FormData();
    fd.append("order_id", fields.order_id);
    fd.append("order_stage_id", fields.order_stage_id);
    fd.append("quantity_pcs", fields.quantity_pcs);
    if (fields.notes) fd.append("notes", fields.notes);
    if (photo) fd.append("photo", photo);

    // Override default Content-Type so axios auto-generates the
    // multipart boundary parameter. (Same fix as createWaste.)
    const { data } = await api.post("/stage-inputs/reject", fd, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },

  deleteReject: async (id) => {
    const { data } = await api.delete(`/stage-inputs/reject/${id}`);
    return data;
  },
};

export default stageInputsApi;
