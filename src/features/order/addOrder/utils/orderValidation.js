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
      ].includes(fieldName)
    ) {
      return;
    }

    const value = formData[fieldName];
    const error = validateField(fieldName, value, formData);
    if (error) newErrors[fieldName] = error;
  });

  // Labels: optional to enable, but an ENABLED label must have material,
  // method and placement (measurement / notes stay optional). Produces a
  // nested error object per label that the shared LabelSpecSection renders
  // inline (errors.brandLabel / errors.careLabel).
  const labelErrors = (spec) => {
    if (!spec?.enabled) return null;
    const e = {};
    if (!spec.material) e.material = "Required";
    if (!spec.method) e.method = "Required";
    if (!spec.placement) e.placement = "Required";
    return Object.keys(e).length ? e : null;
  };
  const brandErr = labelErrors(formData.brandLabel);
  if (brandErr) newErrors.brandLabel = brandErr;
  const careErr = labelErrors(formData.careLabel);
  if (careErr) newErrors.careLabel = careErr;

  return newErrors;
};
