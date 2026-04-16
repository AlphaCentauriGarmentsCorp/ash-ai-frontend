import React from "react";

const Step3Colors = ({ formData, onChange, errors }) => {
  const handleColorCountChange = (field, value) => {
    // Ensure value is a positive number
    const numValue = parseInt(value) || 1;
    const validValue = Math.max(1, numValue);
    onChange({ target: { name: field, value: validValue } });
  };

  const renderColorSection = (part, colorCountField) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <i className={`fas fa-palette text-2xl text-primary`}></i>
          <h3 className="text-lg font-semibold text-gray-800">
            {part} Print Colors
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Colors
          </label>
          <input
            type="number"
            name={colorCountField}
            min="1"
            value={formData[colorCountField]}
            onChange={(e) => handleColorCountChange(colorCountField, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
          />
          {errors[colorCountField] && (
            <p className="mt-1 text-xs text-red-500 flex items-center">
              <i className="fa-solid fa-exclamation-circle mr-1"></i>
              {errors[colorCountField]}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Colors
        </h2>
        <p className="text-gray-600">
          Specify the number of print colors for each part
        </p>
      </div>

      {/* Front Colors - Only show if front part is selected */}
      {formData.hasFrontPart && renderColorSection("Front", "frontColorCount")}

      {/* Back Colors - Only show if back part is selected */}
      {formData.hasBackPart && renderColorSection("Back", "backColorCount")}

      {!formData.hasFrontPart && !formData.hasBackPart && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <i className="fas fa-info-circle text-gray-400 text-3xl mb-3"></i>
          <p className="text-gray-600">
            No parts selected. Please go back to Step 1 and select at least one part.
          </p>
        </div>
      )}
    </div>
  );
};

export default Step3Colors;
