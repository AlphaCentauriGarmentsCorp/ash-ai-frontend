import api from "./axios";

/**
 * Phase 5-B — Cutter portal API client.
 */
export const cutterPortalApi = {
  /**
   * Fetch the full portal context for one stage (the data that drives
   * the page render).
   */
  context: async (orderStageId) => {
    const { data } = await api.get(`/portal/cutter/context/${orderStageId}`);
    return data;
  },

  // ── Fabric logs ───────────────────────────────────────────────

  /**
   * Create a fabric log entry.
   * @param {object} fields - { order_id, order_stage_id, fabric_used_kg,
   *                            waste_kg?, fabric_roll_id?, notes? }
   */
  createFabricLog: async (fields) => {
    const { data } = await api.post("/portal/cutter/fabric-logs", fields);
    return data;
  },

  deleteFabricLog: async (id) => {
    const { data } = await api.delete(`/portal/cutter/fabric-logs/${id}`);
    return data;
  },

  // ── Sample uploads ────────────────────────────────────────────

  /**
   * Create a sample upload. Photos are optional.
   *
   * @param {object} fields - { order_id, order_stage_id, remarks?, sample_status? }
   * @param {File} [photoFront]
   * @param {File} [photoBack]
   */
  createSampleUpload: async (fields, photoFront, photoBack) => {
    const fd = new FormData();
    fd.append("order_id", fields.order_id);
    fd.append("order_stage_id", fields.order_stage_id);
    if (fields.remarks) fd.append("remarks", fields.remarks);
    if (fields.sample_status) fd.append("sample_status", fields.sample_status);
    if (photoFront) fd.append("photo_front", photoFront);
    if (photoBack) fd.append("photo_back", photoBack);

    // Same Content-Type fix as Phase 4 — let axios set multipart boundary.
    const { data } = await api.post("/portal/cutter/sample-uploads", fd, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },

  /**
   * Update an existing sample upload (re-upload photos or change status).
   */
  updateSampleUpload: async (id, fields, photoFront, photoBack) => {
    const fd = new FormData();
    if (fields.remarks !== undefined) fd.append("remarks", fields.remarks);
    if (fields.sample_status) fd.append("sample_status", fields.sample_status);
    if (photoFront) fd.append("photo_front", photoFront);
    if (photoBack) fd.append("photo_back", photoBack);
    // Laravel's PATCH-with-multipart needs _method spoofing.
    fd.append("_method", "PATCH");

    const { data } = await api.post(`/portal/cutter/sample-uploads/${id}`, fd, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },

  deleteSampleUpload: async (id) => {
    const { data } = await api.delete(`/portal/cutter/sample-uploads/${id}`);
    return data;
  },
};

export default cutterPortalApi;
