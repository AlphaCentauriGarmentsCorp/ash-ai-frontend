import React from "react";
import { Section } from "../common/Section";
import Input from "../../../../../components/form/Input";
import Select from "../../../../../components/form/Select";
import { options as optionList } from "../../../../../constants/formOptions/orderOptions";

export const OptionsSection = ({
  formData,
  handleChange,
  errors,
  selectedOptions,
  onAddOption,
  onRemoveOption,
}) => {
  const renderAddedOptions = () => {
    if (selectedOptions.length === 0) return null;

    return (
      <div className="col-span-1 sm:col-span-2 mt-4">
        <h3 className="font-medium text-primary mb-2">
          Added Options ({selectedOptions.length}):
        </h3>
        <div className="space-y-2">
          {selectedOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-300"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{option.name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full border border-gray-300"
                    style={{ backgroundColor: option.color }}
                    title={option.color}
                  />
                  <span className="text-sm text-gray-600">
                    {option.colorValue}
                  </span>
                </div>
                {option.applyToAll && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Same color for all
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemoveOption(option.id)}
                className="text-red-500 hover:text-red-700"
                title="Remove option"
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleAddOption = () => {
    const success = onAddOption(
      formData.options,
      formData.option_color,
      formData.same_option_color,
    );
    if (success) {
      // Clear the form fields after successful add
      handleChange({ target: { name: "options", value: "" } });
      if (!formData.same_option_color) {
        handleChange({ target: { name: "option_color", value: "" } });
      }
    }
  };

  return (
    <Section title="Add Options">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Options"
          name="options"
          options={optionList}
          value={formData.options || ""}
          onChange={handleChange}
          placeholder="Select option"
          searchable
          error={errors.options}
        />

        <Input
          label="Color"
          name="option_color"
          placeholder="Enter Options Color"
          value={formData.option_color || ""}
          onChange={handleChange}
          error={errors.option_color}
          type="text"
        />

        <div className="-mt-6 flex items-start">
          <div className="flex justify-center items-center gap-3">
            <input
              type="checkbox"
              name="same_option_color"
              id="same_option_color"
              checked={formData.same_option_color || false}
              onChange={handleChange}
              className="border-gray-300 border"
            />
            <label
              htmlFor="same_option_color"
              className="text-primary/55 text-xs"
            >
              Keep the same color for all options
            </label>
          </div>
        </div>

        {renderAddedOptions()}

        <div className="col-span-1 sm:col-span-2">
          <button
            type="button"
            onClick={handleAddOption}
            className="bg-secondary w-full py-2 text-white rounded-lg border border-gray-300 text-sm hover:bg-secondary/90"
          >
            <i className="fa fa-plus mr-1"></i>Add Options
          </button>
        </div>
      </div>
    </Section>
  );
};
