import api from "./axios";

export const sizePricesApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/quotation/settings/size-prices", payload);
    return data;
  },

  index: async () => {
    try {
      const response = await api.get("/quotation/settings/size-prices");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/quotation/settings/size-prices/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(
        `/quotation/settings/size-prices/${id}`,
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
        `/quotation/settings/size-prices/${id}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
