import api from "./axios";

export const tshirtNecklineApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post(
      "/quotation/settings/tshirt-neckline",
      payload,
    );
    return data;
  },

  index: async () => {
    try {
      const response = await api.get("/quotation/settings/tshirt-neckline");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(
        `/quotation/settings/tshirt-neckline/${id}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(
        `/quotation/settings/tshirt-neckline/${id}`,
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
        `/quotation/settings/tshirt-neckline/${id}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
