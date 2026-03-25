import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  createSampleSizeObject,
  calculateSampleSummary,
  validateSamples,
} from "../utils/orderHelpers";

export const useSampleSizes = (initialSamples = [], onSamplesChange) => {
  const [samples, setSamples] = useState(initialSamples);
  const [errors, setErrors] = useState({});
  const isInitialMount = useRef(true);
  const isInternalUpdate = useRef(false);
  const prevInitialSamplesRef = useRef(initialSamples);
  const onSamplesChangeRef = useRef(onSamplesChange);

  // Store the latest onSamplesChange in a ref to avoid dependency issues
  useEffect(() => {
    onSamplesChangeRef.current = onSamplesChange;
  }, [onSamplesChange]);

  // Sync with external initialSamples changes, but avoid loops
  useEffect(() => {
    // Check if initialSamples actually changed
    if (
      JSON.stringify(prevInitialSamplesRef.current) !==
      JSON.stringify(initialSamples)
    ) {
      // Mark that this is an external update
      isInternalUpdate.current = false;
      setSamples(initialSamples);
      prevInitialSamplesRef.current = initialSamples;
    }
  }, [initialSamples]);

  // Notify parent of changes, but only for internal updates
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only notify parent if this is an internal update (not from syncing with initialSamples)
    // and if the callback exists
    if (isInternalUpdate.current && onSamplesChangeRef.current) {
      onSamplesChangeRef.current(samples);
    }

    // Reset the flag after notification
    isInternalUpdate.current = false;
  }, [samples]);

  const summary = useMemo(() => calculateSampleSummary(samples), [samples]);

  const addSample = useCallback(() => {
    const newSample = createSampleSizeObject();
    isInternalUpdate.current = true; // Mark as internal update
    setSamples((prev) => [...prev, newSample]);
  }, []);

  const removeSample = useCallback((id) => {
    isInternalUpdate.current = true; // Mark as internal update
    setSamples((prev) => {
      const updatedSamples = prev.filter((sample) => sample.id !== id);

      const removedIndex = prev.findIndex((s) => s.id === id);
      if (removedIndex !== -1) {
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[removedIndex];

          return Object.keys(newErrors).reduce((acc, key) => {
            const numKey = parseInt(key);
            if (numKey > removedIndex) {
              acc[numKey - 1] = newErrors[numKey];
            } else {
              acc[numKey] = newErrors[numKey];
            }
            return acc;
          }, {});
        });
      }

      return updatedSamples;
    });
  }, []);

  const updateSampleField = useCallback((id, field, value) => {
    isInternalUpdate.current = true; // Mark as internal update
    setSamples((prev) => {
      const updated = prev.map((sample) => {
        if (sample.id !== id) return sample;

        const updatedSample = { ...sample, [field]: value };

        if (field === "quantity" || field === "unit_price") {
          const quantity = field === "quantity" ? value : sample.quantity;
          const unitPrice = field === "unit_price" ? value : sample.unit_price;
          updatedSample.total_price =
            (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);
        }

        return updatedSample;
      });

      const sampleIndex = prev.findIndex((s) => s.id === id);
      if (sampleIndex !== -1) {
        setErrors((prevErrors) => {
          if (prevErrors[sampleIndex]?.[field]) {
            const newErrors = { ...prevErrors };
            delete newErrors[sampleIndex][field];
            if (Object.keys(newErrors[sampleIndex]).length === 0) {
              delete newErrors[sampleIndex];
            }
            return newErrors;
          }
          return prevErrors;
        });
      }

      return updated;
    });
  }, []);

  const validate = useCallback(() => {
    const validationErrors = validateSamples(samples);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [samples]);

  const resetSamples = useCallback(() => {
    isInternalUpdate.current = true; // Mark as internal update
    setSamples([]);
    setErrors({});
  }, []);

  return {
    samples,
    errors,
    summary,
    addSample,
    removeSample,
    updateSampleField,
    validate,
    resetSamples,
  };
};
