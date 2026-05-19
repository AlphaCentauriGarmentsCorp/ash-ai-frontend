import api from "./axios";

/**
 * Phase 7-B — QA/Packer Portal API client.
 *
 * Mirrors the shape of cutterPortalApi.js, sewerPortalApi.js, etc. so a
 * developer who knows one portal's frontend can pick this up immediately.
 *
 * Backend endpoints (all gated by permission:portal.qa-packer):
 *   GET    /portal/qa-packer/context/{orderStageId}
 *   POST   /portal/qa-packer/rejects        (JSON or multipart with photo)
 *   DELETE /portal/qa-packer/rejects/{id}
 *   POST   /portal/qa-packer/submit/{orderStageId}
 */
export const qaPackerPortalApi = {
  /**
   * Fetch the full portal context for one QA or Packing stage.
   * Drives the page render.
   */
  context: async (orderStageId) => {
    const { data } = await api.get(`/portal/qa-packer/context/${orderStageId}`);
    return data;
  },

  // ── Reject / Repair logs ──────────────────────────────────────────

  /**
   * Create a reject OR repair entry. Set `disposition` to 'reject' or
   * 'repair' — the backend stores both in the same table.
   *
   * @param {object} fields  - { order_id, order_stage_id, disposition,
   *                             reject_reason_id, quantity_pcs, notes? }
   * @param {File}   [photo] - Optional reject/repair photo (jpg/png/webp ≤ 8MB).
   */
  createReject: async (fields, photo) => {
    // If there's a photo, send as multipart so we can include the file.
    // Otherwise send as plain JSON, which axios serialises by default.
    if (photo) {
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      fd.append("photo", photo);

      // Let axios set the multipart boundary itself — matches the
      // Content-Type: undefined pattern used elsewhere in this codebase
      // (cutter, sewer sample uploads).
      const { data } = await api.post("/portal/qa-packer/rejects", fd, {
        headers: { "Content-Type": undefined },
      });
      return data;
    }

    const { data } = await api.post("/portal/qa-packer/rejects", fields);
    return data;
  },

  deleteReject: async (id) => {
    const { data } = await api.delete(`/portal/qa-packer/rejects/${id}`);
    return data;
  },

  // ── Atomic SUBMIT COMPLETED ───────────────────────────────────────

  /**
   * Submit a QA or Packing task as completed. Advances the stage.
   *
   * Bundle 2 doesn't wire the UI for this yet — Bundle 4 builds the
   * submit button + final-photo flow. Included here so the API surface
   * is complete and tests written against this file don't need updates
   * across bundles.
   *
   * @param {number} orderStageId
   * @param {object} payload      - { qa_checklist_state?, packing_checklist_state?,
   *                                  final_photos?, notes? }
   */
  submit: async (orderStageId, payload) => {
    const { data } = await api.post(
      `/portal/qa-packer/submit/${orderStageId}`,
      payload,
    );
    return data;
  },
};

export default qaPackerPortalApi;
