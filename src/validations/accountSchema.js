export const accountSchema = {
  first_name: {
    required: true,
    message: "First name is required.",
  },

  last_name: {
    required: false,
    message: "Last name is required.",
  },

  username: {
    required: true,
    message: "Username is required.",
  },

  email: {
    required: true,
    pattern: /\S+@\S+\.\S+/,
    message: "Email address is required.",
    invalidMessage: "Email address is invalid.",
  },

  password: {
    required: true,
    minLength: 8,
    message: "Password is required.",
    minMessage: "Password must be at least 8 characters.",
  },

  contact_number: {
    required: true,
    pattern: /^[0-9]{10,11}$/,
    message: "Contact number is required.",
    invalidMessage: "Contact number is invalid.",
  },

  gender: {
    required: true,
    message: "Gender is required.",
  },

  civil_status: {
    required: true,
    message: "Civil status is required.",
  },

  birthdate: {
    required: true,
    message: "Birthdate is required.",
  },

  profile: {
    required: false,
    validate: (value) => {
      return !!value || !!selectedImage;
    },
  },

  currentStreet: {
    required: true,
    message: "Street address is required.",
  },

  currentProvince: {
    required: true,
    message: "Province is required.",
  },

  currentBarangay: {
    required: true,
    message: "Barangay is required.",
  },

  currentCity: {
    required: true,
    message: "City is required.",
  },

  currentPostalCode: {
    required: true,
    pattern: /^[0-9]{4}$/,
    message: "Postal code is required.",
    invalidMessage: "Postal code must be 4 digits.",
  },

  permanentStreet: {
    required: true,
    message: "Street address is required.",
  },

  permanentProvince: {
    required: true,
    message: "Province is required.",
  },

  permanentBarangay: {
    required: true,
    message: "Barangay is required.",
  },

  permanentCity: {
    required: true,
    message: "City is required.",
  },

  permanentPostalCode: {
    required: true,
    pattern: /^[0-9]{4}$/,
    message: "Postal code is required.",
    invalidMessage: "Postal code must be 4 digits.",
  },

  position: {
    required: true,
    message: "Job position is required.",
  },

  department: {
    required: true,
    message: "Department is required.",
  },

  pagibig: {
    required: true,
    message: "Pag-ibig number is required.",
  },

  sss: {
    required: true,
    message: "SSS number is required.",
  },

  philhealth: {
    required: true,
    message: "PhilHealth number is required.",
  },

  roles: {
    required: true,
    message: "At least one role must be selected.",
    validate: (value) => {
      if (!Array.isArray(value)) {
        return false;
      }
      if (value.length === 0) {
        return false;
      }
      const validRoleValues = RoleAccess.map((role) => role.value);
      const allValid = value.every((role) => validRoleValues.includes(role));

      return allValid;
    },
  },
};
