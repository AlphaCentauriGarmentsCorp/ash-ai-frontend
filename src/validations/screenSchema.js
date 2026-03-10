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
};
