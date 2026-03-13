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

export const createSampleSizeObject = () => ({
  id: crypto.randomUUID(),
  size: "",
  quantity: 1,
  unit_price: 0,
  total_price: 0,
});

export const calculateSampleTotal = (sample) => {
  return (
    (parseFloat(sample.quantity) || 0) * (parseFloat(sample.unit_price) || 0)
  );
};

export const calculateSampleSummary = (samples = []) => {
  return samples.reduce(
    (summary, sample) => {
      const sampleTotal = calculateSampleTotal(sample);
      return {
        totalPieces: summary.totalPieces + (parseInt(sample.quantity) || 0),
        totalAmount: summary.totalAmount + sampleTotal,
        uniqueSizes: samples.length,
      };
    },
    { totalPieces: 0, totalAmount: 0, uniqueSizes: 0 },
  );
};

export const validateSample = (sample) => {
  const errors = {};

  if (!sample.size || sample.size.trim() === "") {
    errors.size = "Size is required";
  }

  if (!sample.quantity || sample.quantity < 1) {
    errors.quantity = "Quantity must be at least 1";
  }

  if (
    sample.unit_price === undefined ||
    sample.unit_price === "" ||
    sample.unit_price < 0
  ) {
    errors.unit_price = "Unit price must be a positive number";
  }

  return errors;
};

export const validateSamples = (samples = []) => {
  const errors = {};

  samples.forEach((sample, index) => {
    const sampleErrors = validateSample(sample);
    if (Object.keys(sampleErrors).length > 0) {
      errors[index] = sampleErrors;
    }
  });

  return errors;
};
