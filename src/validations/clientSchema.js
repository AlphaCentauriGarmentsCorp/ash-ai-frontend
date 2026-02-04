export const clientSchema = {
  first_name: {
    required: true,
    message: "First name is required.",
  },

  last_name: {
    required: true,
    message: "Last name is required.",
  },

  email: {
    required: true,
    message: "Email is required.",
  },

  brands: {
    required: true,
    message: "At least one brand is required.",
    validation: (brands) => {
      if (!brands || brands.length === 0) {
        return false;
      }

      if (!brands[0] || !brands[0].name || brands[0].name.trim() === "") {
        return false;
      }

      return true;
    },
  },

  contact_number: {
    required: true,
    pattern: /^[0-9]{10,11}$/,
    message: "Contact number is required.",
    invalidMessage: "Contact number is invalid.",
  },

  street_address: {
    required: true,
    message: "street address is required.",
  },

  city: {
    required: true,
    message: "City address is required.",
  },

  province: {
    required: true,
    message: "Province address is required.",
  },

  postal_code: {
    required: true,
    pattern: /^[0-9]{4}$/,
    message: "Postal code is required.",
    invalidMessage: "Postal code must be 4 digits.",
  },

  notes: {
    required: false,
    message: "Postal code is required.",
  },
};
