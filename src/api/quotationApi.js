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
