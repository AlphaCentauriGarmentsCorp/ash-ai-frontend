import api from "./axios";

export const authApi = {
  login: async (payload) => {
    try {
      const response = await api.post("/login/ash", payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  meApi: () => {
    const token = localStorage.getItem("token");
    return api.get("/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  logout: async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      throw error;
    }
  },
};
