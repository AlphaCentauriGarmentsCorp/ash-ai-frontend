export const equipmentInventorySchema = {
  location_id: {
    required: true,
    message: "Location is required.",
  },
  name: {
    required: true,
    message: "Equipment name is required.",
  },
  quantity: {
    required: true,
    message: "Equipment quantity is required.",
  },
};
