export const typesSchema = {
  name: {
    required: true,
    message: "Name is required.",
  },
  description: {
    required: true,
    message: "Description is required.",
  },
  pattern_images: {
    required: true,
    message: "At least one pattern image is required.",
    custom: (value) => {
      if (!value || value.length === 0) {
        return "At least one pattern image is required.";
      }
      return null;
    },
  },
};
