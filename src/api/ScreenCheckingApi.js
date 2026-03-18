import api from "./axios";

export const ScreenCheckingApi = {
  create: async (payload) => {
    console.log("Payload: ", payload);
    const { data } = await api.post("/screen-checking", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
