export const supplierSchema = {
  name: {
    required: true,
    message: "Name is required.",
  },

  contact_person: {
    required: true,
    message: "Contact person is required",
  },

  contact_number: {
    required: true,
    pattern: /^[0-9]{10,11}$/,
    message: "Contact number is required.",
    invalidMessage: "Contact number is invalid.",
  },

  email: {
    required: false,
    pattern: /\S+@\S+\.\S+/,
    message: "Email address is required.",
    invalidMessage: "Email address is invalid.",
  },

  street_address: {
    required: false,
    message: "street address is required.",
  },

  barangay: {
    required: false,
    message: "barangay address is required.",
  },

  city: {
    required: false,
    message: "City address is required.",
  },

  province: {
    required: false,
    message: "Province address is required.",
  },

  postal_code: {
    required: false,
    pattern: /^[0-9]{4}$/,
    message: "Postal code is required.",
    invalidMessage: "Postal code must be 4 digits.",
  },
};
