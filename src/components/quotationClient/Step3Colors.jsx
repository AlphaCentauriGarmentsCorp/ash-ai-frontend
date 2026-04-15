import React from "react";
import Select from "../form/Select";
import Input from "../form/Input";

const Step3Colors = ({ formData, onChange, errors }) => {
  const tshirtColorOptions = [
    { value: "white", label: "White" },
    { value: "black", label: "Black" },
    { value: "navy", label: "Navy Blue" },
    { value: "red", label: "Red" },
    { value: "gray", label: "Gray" },
    { value: "green", label: "Green" },
    { value: "yellow", label: "Yellow" },
    { value: "custom", label: "Custom Color (Specify in notes)" },
  ];

  const printColorOptions = [
    { value: "white", label: "White" },
    { value: "black", label: "Black" },
    { value: "red", label: "Red" },
    { value: "blue", label: "Blue" },
    { value: "yellow", label: "Yellow" },
    { value: "green", label: "Green" },
    { value: "orange", label: "Orange" },
    { value: "purple", label: "Purple" },
    { value: "pink", label: "Pink" },
    { value: "gold", label: "Gold" },
    { value: "silver", label: "Silver" },
  ];

  const colorCountOptions = [
    { value: 1, label: "1 Color" },
    { value: 2, label: "2 Colors" },
    { value: 3, label: "3 Colors" },
    { value: 4, label: "4 Colors" },
    { value: 5, label: "5+ Colors (Full Color)" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Color Selection
        </h2>
        <p className="text-gray-600">
          Choose your t-shirt and print colors
        </p>
      </div>

      {/* T-Shirt Color */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <i className="fas fa-tshirt text-2xl text-primary"></i>
          <h3 className="text-lg font-semibold text-gray-800">
            T-Shirt Base Color
          </h3>
        </div>

        <Select
          label="Select T-Shirt Color"
          name="tshirtColor"
          options={tshirtColorOptions}
          value={formData.tshirtColor}
          onChange={onChange}
          placeholder="Choose t-shirt color"
          required
          error={errors.tshirtColor}
        />

        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mt-4">
          {tshirtColorOptions.slice(0, -1).map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() =>
                onChange({ target: { name: "tshirtColor", value: color.value } })
              }
              className={`aspect-square rounded-lg border-2 transition-all ${
                formData.tshirtColor === color.value
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-gray-300 hover:border-primary/50"
              }`}
              style={{
                backgroundColor:
                  color.value === "white"
                    ? "#ffffff"
                    : color.value === "black"
                      ? "#000000"
                      : color.value === "navy"
                        ? "#001f3f"
                        : color.value === "red"
                          ? "#ff4136"
                          : color.value === "gray"
                            ? "#aaaaaa"
                            : color.value === "green"
                              ? "#2ecc40"
                              : color.value === "yellow"
                                ? "#ffdc00"
                                : "#cccccc",
              }}
              title={color.label}
            >
              {formData.tshirtColor === color.value && (
                <i
                  className={`fas fa-check ${color.value === "white" || color.value === "yellow" ? "text-gray-800" : "text-white"}`}
                ></i>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Print Colors */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <i className="fas fa-palette text-2xl text-primary"></i>
          <h3 className="text-lg font-semibold text-gray-800">
            Print Colors
          </h3>
        </div>

        <Select
          label="Number of Print Colors"
          name="colorCount"
          options={colorCountOptions}
          value={formData.colorCount}
          onChange={onChange}
          placeholder="Select color count"
          required
          error={errors.colorCount}
        />

        <Select
          label="Select Print Colors"
          name="printColors"
          options={printColorOptions}
          value={formData.printColors}
          onChange={onChange}
          placeholder="Choose print colors"
          multiple
          searchable
          error={errors.printColors}
          className="mt-4"
        />

        {formData.printColors && formData.printColors.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Selected Colors:
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.printColors.map((colorValue) => {
                const color = printColorOptions.find(
                  (c) => c.value === colorValue
                );
                return (
                  <div
                    key={colorValue}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg"
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{
                        backgroundColor:
                          colorValue === "white"
                            ? "#ffffff"
                            : colorValue === "black"
                              ? "#000000"
                              : colorValue === "red"
                                ? "#ff4136"
                                : colorValue === "blue"
                                  ? "#0074d9"
                                  : colorValue === "yellow"
                                    ? "#ffdc00"
                                    : colorValue === "green"
                                      ? "#2ecc40"
                                      : colorValue === "orange"
                                        ? "#ff851b"
                                        : colorValue === "purple"
                                          ? "#b10dc9"
                                          : colorValue === "pink"
                                            ? "#f012be"
                                            : colorValue === "gold"
                                              ? "#ffd700"
                                              : colorValue === "silver"
                                                ? "#c0c0c0"
                                                : "#cccccc",
                      }}
                    ></div>
                    <span className="text-sm text-gray-700">{color?.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Input
        label="Color Notes"
        name="colorNotes"
        placeholder="Any specific color requirements or Pantone codes?"
        value={formData.colorNotes}
        onChange={onChange}
        error={errors.colorNotes}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <i className="fas fa-lightbulb text-blue-600 mt-1"></i>
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              Color Matching Tip
            </p>
            <p className="text-xs text-blue-700">
              For exact color matching, please provide Pantone color codes or
              physical samples. Screen colors may vary from actual print colors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Colors;
