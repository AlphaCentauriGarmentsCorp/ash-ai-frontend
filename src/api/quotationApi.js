import api from "./axios";

export const quotationApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/quotations", payload);
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
      const response = await api.put(
        `/quotations/${id}`,
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
        `/quotations/${id}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
