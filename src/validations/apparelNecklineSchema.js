export const apparelNecklineSchema = {
  name: {
    required: true,
    message: "Name is required.",
  },
  price: {
    required: true,
    message: "Price is required.",
    min: 0,
    minMessage: "Price must be at least 0.",
  },
};
