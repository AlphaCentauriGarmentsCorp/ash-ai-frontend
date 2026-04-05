export const sizePricesSchema = {
  shirt_id: {
    required: true,
    message: "T-shirt type is required.",
  },
  size_id: {
    required: true,
    message: "T-shirt size is required.",
  },
  price: {
    required: true,
    message: "T-shirt price is required.",
  },
};
