import api from "./axios";

/**
 * Phase 5-H — Graphic Artist Portal API client.
 *
 * Endpoints all live under /portal/graphic-artist. The active-assignment
 * resolver is shared via portalApi.myActive("graphic-artist").
 */
export const graphicArtistPortalApi = {
  // Aggregated portal context
  context: async (orderStageId) => {
    const { data } = await api.get(`/portal/graphic-artist/context/${orderStageId}`);
    return data;
  },

  // ── Design files ─────────────────────────────────────────────────

  /**
   * Upload a new design file. multipart/form-data.
   *
   * @param {Object} payload
   * @param {number} payload.order_id
   * @param {number} payload.order_stage_id
   * @param {string} payload.kind         - one of: front_design, back_design,
   *                                         front_mockup, back_mockup,
   *                                         color_separation, other
   * @param {File}   payload.file         - the file to upload (PNG, JPG, PDF, PSD, SVG, WebP, AI)
   * @param {string} [payload.notes]
   */
  uploadDesignFile: async ({ order_id, order_stage_id, kind, file, notes }) => {
    const form = new FormData();
    form.append("order_id", order_id);
    form.append("order_stage_id", order_stage_id);
    form.append("kind", kind);
    form.append("file", file);
    if (notes) form.append("notes", notes);

    const { data } = await api.post("/portal/graphic-artist/design-files", form, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },

  /**
   * Hard-delete a design file (removes the row + the physical file).
   * Pass order_stage_id so the audit log is written against the right stage.
   */
  deleteDesignFile: async (id, order_stage_id) => {
    const { data } = await api.delete(`/portal/graphic-artist/design-files/${id}`, {
      data: { order_stage_id },
    });
    return data;
  },

  // ── Label assets ─────────────────────────────────────────────────

  /**
   * Upsert a label asset (main_label / size_label / hangtag).
   * multipart/form-data — file is optional, metadata is optional.
   *
   * Note: this uses POST with _method=PUT so multipart works.
   */
  upsertLabelAsset: async ({
    order_id,
    order_stage_id,
    kind,
    file,
    width_in,
    height_in,
    printing_process,
    color_count,
    background_color,
    material,
    notes,
  }) => {
    const form = new FormData();
    form.append("_method", "PUT");
    form.append("order_id", order_id);
    form.append("order_stage_id", order_stage_id);
    form.append("kind", kind);
    if (file) form.append("file", file);
    if (width_in != null) form.append("width_in", width_in);
    if (height_in != null) form.append("height_in", height_in);
    if (printing_process) form.append("printing_process", printing_process);
    if (color_count != null) form.append("color_count", color_count);
    if (background_color) form.append("background_color", background_color);
    if (material) form.append("material", material);
    if (notes) form.append("notes", notes);

    const { data } = await api.post("/portal/graphic-artist/label-assets", form, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },

  deleteLabelAsset: async (id, order_stage_id) => {
    const { data } = await api.delete(`/portal/graphic-artist/label-assets/${id}`, {
      data: { order_stage_id },
    });
    return data;
  },

  // ── Sample uploads (reuses shared infrastructure) ────────────────

  uploadSample: async ({
    order_id,
    order_stage_id,
    photo_front,
    photo_back,
    remarks,
    sample_status,
  }) => {
    const form = new FormData();
    form.append("order_id", order_id);
    form.append("order_stage_id", order_stage_id);
    if (photo_front) form.append("photo_front", photo_front);
    if (photo_back) form.append("photo_back", photo_back);
    if (remarks) form.append("remarks", remarks);
    if (sample_status) form.append("sample_status", sample_status);

    const { data } = await api.post("/portal/graphic-artist/sample-uploads", form, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },

  updateSample: async (id, {
    photo_front,
    photo_back,
    remarks,
    sample_status,
  }) => {
    const form = new FormData();
    form.append("_method", "PATCH");
    if (photo_front) form.append("photo_front", photo_front);
    if (photo_back) form.append("photo_back", photo_back);
    if (remarks) form.append("remarks", remarks);
    if (sample_status) form.append("sample_status", sample_status);

    const { data } = await api.post(`/portal/graphic-artist/sample-uploads/${id}`, form, {
      headers: { "Content-Type": undefined },
    });
    return data;
  },

  deleteSample: async (id) => {
    const { data } = await api.delete(`/portal/graphic-artist/sample-uploads/${id}`);
    return data;
  },
};

export default graphicArtistPortalApi;