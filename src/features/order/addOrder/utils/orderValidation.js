import { orderSchema } from "../../../../validations/orderSchema";

export const validateField = (name, value, allData) => {
  const fieldSchema = orderSchema[name];
  if (!fieldSchema) return "";

  const { required, pattern, validation, message, invalidMessage } =
    fieldSchema;

  if (name === "sizes") {
    if (
      fieldSchema.validation &&
      typeof fieldSchema.validation === "function"
    ) {
      return fieldSchema.validation(value)
        ? ""
        : message || `${name} is invalid.`;
    }
    return "";
  }

  if (required && (value === undefined || value === null || value === "")) {
    return message || `${name} is required.`;
  }

  if (pattern && value && !pattern.test(value)) {
    return invalidMessage || `${name} is invalid.`;
  }

  if (validation && typeof validation === "function") {
    return validation(value, allData) ? "" : message || `${name} is invalid.`;
  }

  return "";
};

export const validateForm = (formData) => {
  const newErrors = {};

  Object.keys(orderSchema).forEach((fieldName) => {
    if (fieldName === "sizes") {
      const error = validateField("sizes", formData.sizes, formData);
      if (error) newErrors.sizes = error;
      return;
    }

    if (
      [
        "design_files",
        "design_mockup",
        "payments",
        "freebies_files",
        "size_label_files",
      ].includes(fieldName)
    ) {
      return;
    }

    const value = formData[fieldName];
    const error = validateField(fieldName, value, formData);
    if (error) newErrors[fieldName] = error;
  });

  return newErrors;
};
