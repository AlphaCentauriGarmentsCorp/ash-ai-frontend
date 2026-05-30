import api from "./axios";

/**
 * Phase 3 — generic per-stage proof-of-work uploads API client.
 *
 * Endpoints:
 *   GET    /order-stages/{id}/uploads          → { order_stage_id, uploads[] }
 *   POST   /order-stages/{id}/uploads          (multipart: file, category?, notes?)
 *   DELETE /stage-uploads/{uploadId}
 *
 * Each upload: { id, url, original_name, mime_type, is_image, category,
 *                notes, uploaded_by, created_at }.
 */
export const stageUploadApi = {
  forStage: async (orderStageId) => {
    const { data } = await api.get(`/order-stages/${orderStageId}/uploads`);
    return data.uploads || [];
  },

  upload: async (orderStageId, file, { category = "proof", notes = null } = {}) => {
    const fd = new FormData();
    fd.append("file", file);
    if (category) fd.append("category", category);
    if (notes) fd.append("notes", notes);
    const { data } = await api.post(
      `/order-stages/${orderStageId}/uploads`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.upload;
  },

  remove: async (uploadId) => {
    const { data } = await api.delete(`/stage-uploads/${uploadId}`);
    return data;
  },
};

export default stageUploadApi;