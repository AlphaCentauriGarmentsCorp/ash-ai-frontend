import { useState, useCallback } from "react";
import { options as optionList } from "../../../../constants/formOptions/orderOptions";

export const useOptions = () => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [errors, setErrors] = useState({});

  const addOption = useCallback(
    (optionValue, optionColor, sameOptionColor) => {
      if (!optionValue) {
        setErrors((prev) => ({ ...prev, options: "Please select an option" }));
        return false;
      }

      if (!optionColor) {
        setErrors((prev) => ({
          ...prev,
          option_color: "Please enter a color",
        }));
        return false;
      }

      const colorToUse =
        sameOptionColor && selectedOptions.length > 0
          ? selectedOptions[0].color
          : optionColor;

      const selectedOption = optionList.find(
        (opt) => opt.value === optionValue,
      );
      const newOption = {
        id: crypto.randomUUID(),
        name: selectedOption?.label || optionValue,
        color: colorToUse,
        colorValue: colorToUse,
        applyToAll: sameOptionColor,
      };

      setSelectedOptions((prev) => [...prev, newOption]);

      // Clear errors
      setErrors((prev) => {
        const { options, option_color, ...rest } = prev;
        return rest;
      });

      return true;
    },
    [selectedOptions],
  );

  const removeOption = useCallback((id) => {
    setSelectedOptions((prev) => prev.filter((option) => option.id !== id));
  }, []);

  return {
    selectedOptions,
    setSelectedOptions,
    optionsErrors: errors,
    addOption,
    removeOption,
    setOptionsErrors: setErrors,
  };
};