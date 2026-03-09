import { defaultSize } from "../../../../constants/formOptions/orderOptions";

export const DEFAULT_DEADLINE_DAYS = 14;
export const DEFAULT_DEPOSIT_PERCENTAGE = 60;

export const getDefaultDeadline = () => {
  const date = new Date();
  date.setDate(date.getDate() + DEFAULT_DEADLINE_DAYS);
  return date.toISOString().split("T")[0];
};

export const createSizeObjects = () =>
  defaultSize.map((size) => ({
    id: crypto.randomUUID(),
    name: size.size,
    costPrice: size.cost_price,
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0,
  }));

export const parseAddress = (address) => {
  const parts = address?.split(",").map((part) => part.trim()) || [];
  return {
    street: parts[0] || "",
    barangay: parts[1] || "",
    city: parts[2] || "",
    province: parts[3] || "",
    postal: parts[4] || "",
  };
};

export const calculateUnitPrice = (costPrice, quantity) =>
  (parseFloat(costPrice) || 0) * (parseFloat(quantity) || 0);
