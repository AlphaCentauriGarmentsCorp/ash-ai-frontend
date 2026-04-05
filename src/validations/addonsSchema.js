export const addonsSchema = {
  category_id: {
    required: true,
    message: "Addon category is required.",
  },
  name: {
    required: true,
    message: "Name is required.",
  },
  price: {
    required: true,
    message: "Price is required.",
  },
  price_type: {
    required: true,
    message: "Price type is required.",
  },
  description: {
    required: true,
    message: "Description is required.",
  },
};
