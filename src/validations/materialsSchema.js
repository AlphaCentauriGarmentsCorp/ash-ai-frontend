export const materialsSchema = {
  // Order Information
  name: {
    required: true,
    message: "Material name is required",
  },

  supplier_id: {
    required: true,
    message: "Supplier is required.",
  },

  material_type: {
    required: true,
    message: "Material type is required.",
  },

  unit: {
    required: true,
    message: "Material unit is required.",
  },

  price: {
    required: true,
    message: "Material price is required.",
  },

  
};
