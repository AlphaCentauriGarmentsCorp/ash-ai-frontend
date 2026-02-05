export const orderSchema = {
  // Order Information
  client: {
    required: true,
    message: "Client is required.",
  },

  deadline: {
    required: true,
    message: "Deadline is required.",
  },

  company: {
    required: true,
    message: "Company is required.",
  },

  brand: {
    required: true,
    message: "Brand is required.",
  },

  priority: {
    required: true,
    message: "Priority is required.",
  },

  // Courier Information
  courier: {
    required: true,
    message: "Preferred courier is required.",
  },

  shipping_method: {
    required: true,
    message: "Shipping method is required.",
  },

  receiver_name: {
    required: true,
    message: "Receiver's name is required.",
  },

  contact_number: {
    required: true,
    pattern: /^[0-9]{10,11}$/,
    message: "Contact number is required.",
    invalidMessage: "Contact number must be 10-11 digits.",
  },

  street_address: {
    required: true,
    message: "Street address is required.",
  },

  province_address: {
    required: true,
    message: "Province address is required.",
  },

  city_address: {
    required: true,
    message: "City address is required.",
  },

  barangay_address: {
    required: true,
    message: "Barangay address is required.",
  },

  postal_address: {
    required: true,
    pattern: /^[0-9]{4}$/,
    message: "Postal code is required.",
    invalidMessage: "Postal code must be 4 digits.",
  },

  // Product Details
  design_name: {
    required: true,
    message: "Design name is required.",
  },

  apparel_type: {
    required: true,
    message: "Apparel type is required.",
  },

  pattern_type: {
    required: true,
    message: "Pattern type is required.",
  },

  service_type: {
    required: true,
    message: "Service type is required.",
  },

  print_method: {
    required: true,
    message: "Print method is required.",
  },

  print_service: {
    required: true,
    message: "Print service is required.",
  },

  size_label: {
    required: true,
    message: "Size label is required.",
  },

  print_label_placement: {
    required: true,
    message: "Print label placement is required.",
  },

  // Fabric Details
  fabric_type: {
    required: true,
    message: "Fabric type is required.",
  },

  fabric_supplier: {
    required: true,
    message: "Fabric supplier is required.",
  },

  fabric_color: {
    required: true,
    message: "Fabric color is required.",
  },

  thread_color: {
    required: true,
    message: "Thread color is required.",
  },

  ribbing_color: {
    required: true,
    message: "Ribbing color is required.",
  },

  // Sizes Validation
  sizes: {
    required: true,
    message: "At least one size with quantity is required.",
    validation: (sizes) => {
      if (!sizes || sizes.length === 0) {
        return false;
      }
      const hasValidSize = sizes.some((size) => {
        const quantity = parseInt(size.quantity) || 0;
        return quantity > 0;
      });

      if (!hasValidSize) {
        return false;
      }

      // Check all sizes with quantity > 0 have valid data
      return sizes.every((size) => {
        const quantity = parseInt(size.quantity) || 0;
        if (quantity > 0) {
          return (
            size.name &&
            size.name.trim() !== "" &&
            size.costPrice !== undefined &&
            size.unitPrice !== undefined
          );
        }
        return true; // Skip validation for sizes with quantity = 0
      });
    },
  },

  // File Validations (optional, can be made required as needed)
  design_files: {
    required: false,
    message: "Design files are required.",
    validation: (files) => {
      if (!files || files.length === 0) {
        return true; // Optional field
      }
      // Add file validation logic if needed (size, type, etc.)
      return true;
    },
  },

  design_mockup: {
    required: false,
    message: "Design mockup is required.",
  },

  // Freebies (optional fields)
  freebie_items: {
    required: false,
    message: "Freebie items field is required.",
  },

  freebie_color: {
    required: false,
    message: "Freebie color field is required.",
  },

  freebie_others: {
    required: false,
    message: "Freebie others field is required.",
  },

  deposit_percentage: {
    required: true,
    pattern: /^[0-9]{1,3}%?$/,
    message: "Deposit percentage is required.",
    invalidMessage: "Deposit percentage must be a percentage (e.g., 60%).",
  },

  payment_method: {
    required: true,
    message: "Payment method is required.",
  },

  estimated_total: {
    required: true,
    pattern: /^[0-9,.]+$/,
    message: "Estimated total is required.",
    invalidMessage: "Estimated total must be a valid number.",
  },

  payments: {
    required: false,
    message: "Payment files are required.",
    validation: (files) => {
      if (!files || files.length === 0) {
        return true; // Optional field
      }
      return true;
    },
  },

  // Notes (optional)
  notes: {
    required: false,
    message: "Notes field is required.",
  },
};
