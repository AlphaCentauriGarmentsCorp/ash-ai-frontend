import api from "./axios";

/**
 * Phase 4 — Subcontract Assignments API client.
 *
 * Lifecycle: pending → out → returned
 * Cancel allowed from pending or out (not from returned).
 */
export const subcontractApi = {
  list: async ({
    orderId,
    orderStageId,
    subcontractorId,
    status,
    page = 1,
    perPage = 50,
  } = {}) => {
    const { data } = await api.get("/subcontract-assignments", {
      params: {
        order_id: orderId,
        order_stage_id: orderStageId,
        subcontractor_id: subcontractorId,
        status,
        page,
        per_page: perPage,
      },
    });
    return data;
  },

  show: async (id) => {
    const { data } = await api.get(`/subcontract-assignments/${id}`);
    return data;
  },

  /**
   * Create a new assignment.
   *
   * @param {object} fields
   * @param {number} fields.order_id
   * @param {number} fields.order_stage_id
   * @param {number} fields.subcontractor_id  - vendor from /sewing-subcontractor
   * @param {number} fields.quantity_pcs
   * @param {string} [fields.notes]
   */
  create: async (fields) => {
    const { data } = await api.post("/subcontract-assignments", fields);
    return data;
  },

  markSent: async (id) => {
    const { data } = await api.post(`/subcontract-assignments/${id}/mark-sent`);
    return data;
  },

  markReturned: async (id) => {
    const { data } = await api.post(`/subcontract-assignments/${id}/mark-returned`);
    return data;
  },

  cancel: async (id) => {
    const { data } = await api.post(`/subcontract-assignments/${id}/cancel`);
    return data;
  },
};

export default subcontractApi;
