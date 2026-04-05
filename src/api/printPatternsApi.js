import api from "./axios";

export const printPatternsApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post(
      "/quotation/settings/print-pattern",
      payload,
    );
    return data;
  },

  index: async () => {
    try {
      const response = await api.get("/quotation/settings/print-pattern");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/quotation/settings/print-pattern/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(
        `/quotation/settings/print-pattern/${id}`,
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
        `/quotation/settings/print-pattern/${id}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
