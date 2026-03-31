export const shippingMethodsSchema = {
  courier_id: {
    required: true,
    message: "Courier is required.",
  },
  name: {
    required: true,
    message: "Name is required.",
  },
  description: {
    required: true,
    message: "Description is required.",
  },
};
