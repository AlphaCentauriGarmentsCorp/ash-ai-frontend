export const quotationTypeSchema = {
  name: {
    required: true,
    message: "Name is required.",
  },
  base_price: {
    required: true,
    message: "Base price is required.",
  },
  description: {
    required: true,
    message: "Description is required.",
  },
};
