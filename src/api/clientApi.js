import api from "./axios";

export const clientApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/clients", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  index: async (params = {}) => {
    try {
      const response = await api.get("/clients", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  show: async (id) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, payload) => {
    console.log("FormData to submit:", payload);
    try {
      const response = await api.put(`/clients/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Issue 1 — add a brand to a client on the fly. Returns the refreshed client
  // (with its full brand list) so the caller can repopulate the Brand dropdown.
  addBrand: async (clientId, brandName) => {
    const { data } = await api.post(`/clients/${clientId}/brands`, {
      brand_name: brandName,
    });
    return data;
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};