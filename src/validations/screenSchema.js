export const screenSchema = {
  name: {
    required: true,
    message: "Screen name is required.",
  },

  address: {
    required: true,
    message: "Screen address is required.",
  },
  size: {
    required: true,
    message: "Screen size is required.",
  },

  mesh_count: {
    required: true,
    message: "Mesh count is required.",
  },
};
