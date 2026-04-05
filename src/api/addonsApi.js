import api from "./axios";

export const addonsApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/quotation/settings/addons", payload);
    return data;
  },

  index: async () => {
    try {
      const response = await api.get("/quotation/settings/addons");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/quotation/settings/addons/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(
        `/quotation/settings/addons/${id}`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/quotation/settings/addons/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
