import api from "./axios";

export const supplierApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/supplier", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/supplier", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Order/quotation forms read the supplier list from the public reference
  // route, so a logged-in CSR (who lacks access.suppliers) can still populate
  // the Fabric Supplier field. The management pages keep using index() above.
  publicIndex: async (params = {}) => {
    try {
      const response = await api.get("/public/supplier", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/supplier/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await api.put(`/supplier/${id}`, payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/supplier/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
