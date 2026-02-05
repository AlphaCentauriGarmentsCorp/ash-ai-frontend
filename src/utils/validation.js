export const validateForm = (formData, schema) => {
  const errors = {};

  Object.entries(schema).forEach(([key, rule]) => {
    const value = formData[key];

    // Conditional rule
    if (rule.condition && !rule.condition(formData)) return;

    // Required
    if (rule.required) {
      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && !value.trim()) ||
        (Array.isArray(value) && value.length === 0)
      ) {
        errors[key] = rule.message;
        return;
      }
    }

    // Pattern
    if (rule.pattern && value && !rule.pattern.test(String(value))) {
      errors[key] = rule.invalidMessage || "Invalid format.";
      return;
    }

    // Length
    if (rule.minLength && value?.length < rule.minLength) {
      errors[key] =
        rule.minMessage || `Minimum ${rule.minLength} characters required.`;
      return;
    }

    if (rule.maxLength && value?.length > rule.maxLength) {
      errors[key] =
        rule.maxMessage || `Maximum ${rule.maxLength} characters allowed.`;
      return;
    }

    // Number limits
    if (rule.min !== undefined && Number(value) < rule.min) {
      errors[key] = rule.minMessage || `Value must be at least ${rule.min}.`;
      return;
    }

    if (rule.max !== undefined && Number(value) > rule.max) {
      errors[key] = rule.maxMessage || `Value cannot exceed ${rule.max}.`;
      return;
    }

    // Custom validation
    if (rule.custom) {
      const error = rule.custom(value, formData);
      if (error) {
        errors[key] = error;
      }
    }
  });

  return errors;
};

export const hasErrors = (errors) => Object.keys(errors).length > 0;

/**
 * Conditional rule helper
 */
export const when = (condition, rules) => ({
  condition,
  ...rules,
});
