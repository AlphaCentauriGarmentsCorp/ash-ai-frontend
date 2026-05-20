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
  // ── Bundle 4a — Packing boxes & QR ────────────────────────────

  /**
   * Auto-create or fetch box #1 for an order.
   * Idempotent — safe to call repeatedly.
   */
  ensureFirstBox: async (orderId) => {
    const { data } = await api.post(
      `/portal/qa-packer/boxes/ensure-for-order/${orderId}`,
    );
    return data;
  },

  /**
   * Update a box's contents + optional weight.
   * @param {number} boxId
   * @param {object} payload  - { contents_json: [...], weight_kg?: number }
   */
  updateBoxContents: async (boxId, payload) => {
    const { data } = await api.patch(
      `/portal/qa-packer/boxes/${boxId}`,
      payload,
    );
    return data;
  },

  /**
   * Seal a box (locks contents, marks ready for QR print).
   */
  sealBox: async (boxId) => {
    const { data } = await api.post(
      `/portal/qa-packer/boxes/${boxId}/seal`,
    );
    return data;
  },

  /**
   * Unseal a box so its contents can be edited again.
   * Only works before the packing stage is submitted (backend-enforced).
   */
  unsealBox: async (boxId) => {
    const { data } = await api.post(
      `/portal/qa-packer/boxes/${boxId}/unseal`,
    );
    return data;
  },

  /**
   * Download the box's QR label PDF as a blob, returning a local
   * object URL that can be opened in a new tab.
   *
   * We fetch via axios (which carries the Sanctum auth headers) and
   * then mint a blob URL because window.open() against the raw API
   * endpoint loses the auth context — Laravel sees an unauthenticated
   * request and tries to redirect to a login route that doesn't exist
   * in this SPA. Going via blob sidesteps the entire problem.
   *
   * Caller is responsible for revoking the URL when done, e.g.:
   *   const url = await qaPackerPortalApi.boxLabelBlobUrl(123);
   *   window.open(url, '_blank');
   *   setTimeout(() => URL.revokeObjectURL(url), 60_000);
   */
  boxLabelBlobUrl: async (boxId) => {
    const response = await api.get(
      `/portal/qa-packer/boxes/${boxId}/qr-label.pdf`,
      { responseType: "blob" },
    );
    return URL.createObjectURL(response.data);
  },

  // ── Bundle 4a — Final photos ──────────────────────────────────

  /**
   * Upload one of the three final-photo slots.
   * @param {object} fields - { order_id, order_stage_id, kind }
   * @param {File}   photo  - required image file
   *
   * Returns { data: { kind, path } }. The frontend keeps the path in
   * client state and passes it to submit() as final_photos[kind].
   */
  uploadFinalPhoto: async (fields, photo) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v);
    });
    fd.append("photo", photo);

    const { data } = await api.post("/portal/qa-packer/final-photos", fd, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },
};

export default qaPackerPortalApi;
