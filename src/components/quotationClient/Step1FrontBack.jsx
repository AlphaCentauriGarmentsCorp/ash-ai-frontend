import React from "react";

const Step1FrontBack = ({ formData, onChange, errors }) => {
  const handleCheckboxChange = (field) => {
    onChange({ target: { name: field, value: !formData[field] } });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Parts
        </h2>
        <p className="text-gray-600">
          Select at least one part of the garment
        </p>
      </div>

      {/* Front Part */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-primary/30 transition-colors">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => handleCheckboxChange("hasFrontPart")}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                formData.hasFrontPart
                  ? "bg-primary border-primary"
                  : "border-gray-300 hover:border-primary"
              }`}
            >
              {formData.hasFrontPart && (
                <i className="fas fa-check text-white text-sm"></i>
              )}
            </button>
          </div>
          <div className="flex-1">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Front
              </h3>
              <p className="text-sm text-gray-500">
                Add a design to the front of the garment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back Part */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-primary/30 transition-colors">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => handleCheckboxChange("hasBackPart")}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                formData.hasBackPart
                  ? "bg-primary border-primary"
                  : "border-gray-300 hover:border-primary"
              }`}
            >
              {formData.hasBackPart && (
                <i className="fas fa-check text-white text-sm"></i>
              )}
            </button>
          </div>
          <div className="flex-1">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Back
              </h3>
              <p className="text-sm text-gray-500">
                Add a design to the back of the garment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1FrontBack;
