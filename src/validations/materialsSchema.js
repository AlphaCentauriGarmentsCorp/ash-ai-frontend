export const materialsSchema = {
  // Only the material name is mandatory; every other field is optional.
  name: {
    required: true,
    message: "Material name is required",
  },
};
