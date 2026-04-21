import api from "./axios";

export const publicQuotationApi = {
  show: async (token) => {
    try {
      const response = await api.get(`/share/quotations/${token}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (token, payload) => {
    try {
      if (payload instanceof FormData) {
        // Laravel/PHP reliably parses multipart form data on POST; use method override for PUT semantics.
        if (!payload.has("_method")) {
          payload.append("_method", "PUT");
        }

        const response = await api.post(`/share/quotations/${token}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
      }

      const response = await api.put(`/share/quotations/${token}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  showPDF: async (token) => {
    try {
      const response = await api.get(`/share/quotations/${token}/pdf`, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
