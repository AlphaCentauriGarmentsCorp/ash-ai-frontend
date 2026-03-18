import api from "./axios";

export const ScreenMakingApi = {
  create: async (payload) => {
    console.log(payload);
    const { data } = await api.post("/screen-making", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
