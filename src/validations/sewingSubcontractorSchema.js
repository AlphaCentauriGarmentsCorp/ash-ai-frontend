export const sewingSubcontractorSchema = {
  name: {
    required: true,
    message: "Name is required.",
  },
  address: {
    required: true,
    message: "Address is required.",
  },
  rate_per_piece: {
    required: true,
    message: "Rate per piece is required.",
  },
  contact_number: {
    required: false,
    message: "Contact number is not required.",
  },
  email: {
    required: false,
    message: "Email is not required.",
  },
};
