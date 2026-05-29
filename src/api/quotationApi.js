import api from "./axios";

export const quotationApi = {
  create: async (payload) => {
    const config =
      payload instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined;
    const { data } = await api.post("/quotations", payload, config);
    return data;
  },

  // Live price preview — computes totals without saving. Send a plain JSON
  // payload (item_config_json / items_json / print_parts_json as JSON strings,
  // plus discount fields). Returns { subtotal, grand_total, downpayment,
  // balance, items_json, addons_json, breakdown_json }.
  preview: async (payload) => {
    const { data } = await api.post("/quotations/preview", payload);
    return data;
  },

  index: async () => {
    try {
      const response = await api.get("/quotations");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/quotations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  showPDF: async (id) => {
    try {
      const response = await api.get(`/quotations/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      if (payload instanceof FormData) {
        if (!payload.has("_method")) {
          payload.append("_method", "PUT");
        }

        const response = await api.post(`/quotations/${id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
      }

      const response = await api.put(`/quotations/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  confirm: async (id) => {
    try {
      const response = await api.post(`/quotations/${id}/confirm`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Issue 12 — change lifecycle status through the backend state machine.
  // payload = { status, notes? }. The 'Sent' transition also emails the PDF
  // (best-effort). Returns { message, quotation, email_sent, email_error }.
  changeStatus: async (id, payload) => {
    const { data } = await api.patch(`/quotations/${id}/status`, payload);
    return data;
  },

  // Issue 12 — immutable status-transition history (newest first).
  statusLog: async (id) => {
    const { data } = await api.get(`/quotations/${id}/status-log`);
    return data;
  },

  // Issue 8 — CSR sends the quotation design to the Graphic Artist for review.
  // Sets design_review_status to "Pending GA" and notifies the GA.
  requestDesignReview: async (id) => {
    const { data } = await api.post(`/quotations/${id}/request-design-review`);
    return data;
  },

  delete: async (id) => {
    try {
      const response = await api.delete(
        `/quotations/${id}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};