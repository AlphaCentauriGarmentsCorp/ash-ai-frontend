import api from "./axios";

export const printColorsApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post(
      "/quotation/settings/print-colors",
      payload,
    );
    return data;
  },

  index: async () => {
    try {
      const response = await api.get("/quotation/settings/print-colors");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/quotation/settings/print-colors/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(
        `/quotation/settings/print-colors/${id}`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(
        `/quotation/settings/print-colors/${id}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
