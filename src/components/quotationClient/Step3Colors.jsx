import React from "react";

const Step3Colors = ({ formData, onChange, errors }) => {
  const parts = Array.isArray(formData.parts) ? formData.parts : [];

  const handleUnitCountChange = (partKey, value) => {
    const numValue = parseInt(value, 10) || 1;
    const validValue = Math.max(1, numValue);

    const updatedParts = parts.map((part) =>
      String(part.key) === String(partKey)
        ? { ...part, unit_count: validValue }
        : part,
    );

    onChange({ target: { name: "parts", value: updatedParts } });
  };

  const renderColorSection = (part) => {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <i className={`fas fa-palette text-2xl text-primary`}></i>
          <h3 className="text-lg font-semibold text-gray-800">
            {part.part} Print Units
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Units
          </label>
          <input
            type="number"
            min="1"
            value={part.unit_count || 1}
            onChange={(e) => handleUnitCountChange(part.key, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
          />
          {errors[`unit_${part.key}`] && (
            <p className="mt-1 text-xs text-red-500 flex items-center">
              <i className="fa-solid fa-exclamation-circle mr-1"></i>
              {errors[`unit_${part.key}`]}
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
          Units
        </h2>
        <p className="text-gray-600">
          Specify the number of print units per part
        </p>
      </div>

      {parts.length > 0 ? (
        <div className="space-y-4">
          {parts.map((part) => (
            <React.Fragment key={part.key}>{renderColorSection(part)}</React.Fragment>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <i className="fas fa-info-circle text-gray-400 text-3xl mb-3"></i>
          <p className="text-gray-600">
            No supported parts found in this shared quotation.
          </p>
        </div>
      )}
    </div>
  );
};

export default Step3Colors;
