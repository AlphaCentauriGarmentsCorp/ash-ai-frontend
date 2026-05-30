import api from "./axios";

/**
 * CSR Review Hub — API client.
 *
 * Mirrors the shape of the other portal API clients (qaPackerPortalApi.js,
 * cutterPortalApi.js, …) so it's immediately familiar.
 *
 * Backend endpoints:
 *   GET  /orders/{orderId}/stage-reviews          → { order_id, history, states }
 *   GET  /order-stages/{id}/review/state          → { review_state, open_rejection, latest }
 *   POST /order-stages/{id}/review/approve         (JSON: { comment? })            [reviewers]
 *   POST /order-stages/{id}/review/reject          (multipart: comment, image?)    [reviewers]
 *   POST /order-stages/{id}/review/resubmit        (JSON: { comment? })            [owning role]
 *
 * review_state ∈ { 'none' | 'approved' | 'rejected' | 'resubmitted' }.
 * open_rejection === true means the stage is waiting on the owning role to
 * resubmit (latest review is a reject).
 */
export const stageReviewApi = {
  /**
   * Hub payload for an order: full review history grouped by stage id, plus a
   * per-stage current-state map keyed by order_stage_id.
   */
  forOrder: async (orderId) => {
    const { data } = await api.get(`/orders/${orderId}/stage-reviews`);
    return data;
  },

  /**
   * Lightweight single-stage state probe (used by a production portal to
   * decide whether to show the rejection banner + resubmit action).
   */
  state: async (orderStageId) => {
    const { data } = await api.get(
      `/order-stages/${orderStageId}/review/state`
    );
    return data;
  },

  /**
   * Reviewer approves a stage's output. Comment optional.
   */
  approve: async (orderStageId, comment = null) => {
    const { data } = await api.post(
      `/order-stages/${orderStageId}/review/approve`,
      { comment }
    );
    return data;
  },

  /**
   * Reviewer rejects a stage's output. Comment REQUIRED; image optional.
   * Sends multipart when an image is attached, JSON otherwise.
   *
   * @param {number} orderStageId
   * @param {string} comment   - required reason
   * @param {File}  [image]    - optional evidence (jpg/png/webp ≤ 5MB)
   */
  reject: async (orderStageId, comment, image = null) => {
    if (image) {
      const fd = new FormData();
      fd.append("comment", comment);
      fd.append("image", image);
      const { data } = await api.post(
        `/order-stages/${orderStageId}/review/reject`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    }
    const { data } = await api.post(
      `/order-stages/${orderStageId}/review/reject`,
      { comment }
    );
    return data;
  },

  /**
   * Owning role resubmits a previously-rejected stage's output. Comment
   * optional (what was fixed). Only valid when open_rejection === true.
   */
  resubmit: async (orderStageId, comment = null) => {
    const { data } = await api.post(
      `/order-stages/${orderStageId}/review/resubmit`,
      { comment }
    );
    return data;
  },
};

export default stageReviewApi;