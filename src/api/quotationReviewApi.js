import api from "./axios";

/**
 * Issue 8 — Graphic Artist design-review API client.
 *
 * Backed by /quotation-reviews/{id}, gated by the access.quotation-review
 * permission (graphic_artist + superadmin). This is the GA's least-privilege
 * window into a quotation — it never touches the access.quotations endpoints.
 */
export const quotationReviewApi = {
  // GA-scoped view: specs + design images + current verdict.
  show: async (id) => {
    const { data } = await api.get(`/quotation-reviews/${id}`);
    return data;
  },

  // Record the verdict. payload = { design_review_status, design_color_count?, design_review_note? }
  update: async (id, payload) => {
    const { data } = await api.patch(`/quotation-reviews/${id}`, payload);
    return data;
  },
};

export default quotationReviewApi;
