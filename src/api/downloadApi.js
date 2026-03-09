import api from "./axios";

export const downloadApi = {
  downloadFile: async (filePath, fileName) => {
    try {
      const response = await api.get(`/download`, {
        params: { path: filePath },
        responseType: "blob", // Important for binary files
        headers: {
          Accept: "application/octet-stream",
        },
      });

      return response.data; 
    } catch (error) {
      throw error;
    }
  },
};
