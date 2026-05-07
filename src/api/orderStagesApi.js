import api from "./axios";

/**
 * Order Stages API – sequential workflow state machine.
 *
 * Mirrors backend OrderStagesController endpoints under /v2/order-stages/*.
 */
export const orderStagesApi = {
  /**
   * Returns the canonical 14-stage workflow definition (id, label, group, role).
   * Result shape: { data: [ {key, label, group, role, sample, mass}, ... ] }
   */
  getWorkflow: async () => {
    const { data } = await api.get("/order-stages/workflow");
    return data;
  },

  /**
   * Returns the stages for a specific order, in sequence order.
   * Result shape: { data: [ OrderStageResource, ... ] }
   */
  listForOrder: async (orderId) => {
    const { data } = await api.get(`/order-stages/order/${orderId}`);
    return data;
  },

  /**
   * Legacy-compatible "ensure stages exist" call. The new backend will
   * auto-init stages when the order is created, so this is mostly a no-op,
   * but it's safe to call (idempotent).
   */
  ensureInitialized: async (orderId) => {
    const { data } = await api.post("/order-stages", { order_id: orderId });
    return data;
  },

  /**
   * Mark a stage completed. Auto-promotes the next stage to in_progress.
   * Returns: { message, stage, next }
   */
  complete: async (stageId, notes = null) => {
    const payload = notes ? { notes } : {};
    const { data } = await api.post(
      `/order-stages/${stageId}/complete`,
      payload,
    );
    return data;
  },

  /** Move a stage from in_progress -> for_approval */
  forApproval: async (stageId, notes = null) => {
    const payload = notes ? { notes } : {};
    const { data } = await api.post(
      `/order-stages/${stageId}/for-approval`,
      payload,
    );
    return data;
  },

  /** Mark stage as delayed. Reason is required. */
  delay: async (stageId, reason) => {
    const { data } = await api.post(`/order-stages/${stageId}/delay`, {
      reason,
    });
    return data;
  },

  /** Put stage on hold. Reason is optional. */
  hold: async (stageId, reason = null) => {
    const payload = reason ? { reason } : {};
    const { data } = await api.post(`/order-stages/${stageId}/hold`, payload);
    return data;
  },

  /** Resume an on_hold or delayed stage back to in_progress. */
  resume: async (stageId) => {
    const { data } = await api.post(`/order-stages/${stageId}/resume`);
    return data;
  },

  /** Assign a stage to a user (or just to a role). */
  assign: async (stageId, { userId = null, role = null } = {}) => {
    const { data } = await api.post(`/order-stages/${stageId}/assign`, {
      assigned_to: userId,
      assigned_role: role,
    });
    return data;
  },

  /** Attach / replace notes on a stage. */
  setNotes: async (stageId, notes) => {
    const { data } = await api.post(`/order-stages/${stageId}/notes`, {
      notes,
    });
    return data;
  },
};
