import api from "./axios";

export const sizeLabelApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/size-label", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/size-label", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/size-label/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
