import api from "./axios";

export const printTypesApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/quotation/settings/print-types", payload);
    return data;
  },

  index: async () => {
    try {
      const response = await api.get("/quotation/settings/print-types");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/quotation/settings/print-types/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(
        `/quotation/settings/print-types/${id}`,
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
        `/quotation/settings/print-types/${id}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
