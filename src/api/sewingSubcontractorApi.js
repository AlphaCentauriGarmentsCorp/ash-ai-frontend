import api from "./axios";

export const sewingSubcontractorApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/sewing-subcontractor", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/sewing-subcontractor", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/sewing-subcontractor/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(`/sewing-subcontractor/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/sewing-subcontractor/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
