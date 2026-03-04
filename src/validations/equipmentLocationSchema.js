export const equipmentLocationSchema = {
  name: {
    required: true,
    message: "Location name is required.",
  },
  description: {
    required: true,
    message: "Description is required.",
  },
  icon: {
    required: true,
    message: "Icon is required.",
  },
};
