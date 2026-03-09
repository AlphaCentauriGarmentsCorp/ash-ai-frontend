import { useState, useCallback } from "react";
import { orderInitialState } from "../../../../constants/formInitialState/orderInitialState";
import {
  getDefaultDeadline,
  createSizeObjects,
  DEFAULT_DEPOSIT_PERCENTAGE,
} from "../utlis/orderHelpers";
import { validateForm } from "../../addOrder/utlis/orderValidation";

export const useOrderForm = () => {
  const [formData, setFormData] = useState(() => ({
    ...orderInitialState,
    deadline: getDefaultDeadline(),
    deposit_percentage: DEFAULT_DEPOSIT_PERCENTAGE,
    sizes: createSizeObjects(),
  }));

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "same_fabric_color") {
      setFormData((prev) => ({
        ...prev,
        same_fabric_color: checked,
        ...(checked && {
          thread_color: prev.fabric_color,
          ribbing_color: prev.fabric_color,
        }),
      }));
      return;
    }

    if (name === "fabric_color") {
      setFormData((prev) => ({
        ...prev,
        fabric_color: value,
        ...(prev.same_fabric_color && {
          thread_color: value,
          ribbing_color: value,
        }),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    setServerError("");
  }, []);

  const handleDepositPercentageChange = useCallback((e) => {
    const { value } = e.target;
    const percentage = Math.min(100, Math.max(0, parseFloat(value) || 0));
    setFormData((prev) => ({ ...prev, deposit_percentage: percentage }));
    setServerError("");
  }, []);

  const handleFileChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setServerError("");
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      ...orderInitialState,
      deadline: getDefaultDeadline(),
      deposit_percentage: DEFAULT_DEPOSIT_PERCENTAGE,
      sizes: createSizeObjects(),
    });
    setErrors({});
    setServerError("");
  }, []);

  const validate = useCallback(() => {
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    serverError,
    setServerError,
    handleChange,
    handleDepositPercentageChange,
    handleFileChange,
    resetForm,
    validate,
  };
};
