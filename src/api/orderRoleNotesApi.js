import api from "./axios";

/**
 * Role-directed order notes — API client (CP2).
 *
 * ONE write endpoint. Reads deliberately have no endpoint: the Review Hub
 * receives every thread inside stageReviewApi.forOrder() (payload key
 * `role_notes`, grouped by audience_role), and each portal receives its
 * own thread inside its context payload (GA: context.role_notes).
 *
 * Backend: POST /api/v2/orders/{orderId}/role-notes
 *   body: { audience_role, body } — gated by access.production-review.
 */
export const orderRoleNotesApi = {
  post: async (orderId, audienceRole, body) => {
    const { data } = await api.post(`/orders/${orderId}/role-notes`, {
      audience_role: audienceRole,
      body,
    });
    return data;
  },
};

export default orderRoleNotesApi;
