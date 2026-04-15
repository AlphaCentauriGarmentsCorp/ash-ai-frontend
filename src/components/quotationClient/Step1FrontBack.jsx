import React from "react";
import Input from "../form/Input";

const Step1FrontBack = ({ formData, onChange, errors }) => {
  const handleCheckboxChange = (field) => {
    onChange({ target: { name: field, value: !formData[field] } });
  };

  const handleFileChange = (field, file) => {
    onChange({ target: { name: field, value: file } });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Front & Back Design
        </h2>
        <p className="text-gray-600">
          Select which sides of the t-shirt you want to customize
        </p>
      </div>

      {/* Front Design */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-primary/30 transition-colors">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => handleCheckboxChange("hasFrontDesign")}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                formData.hasFrontDesign
                  ? "bg-primary border-primary"
                  : "border-gray-300 hover:border-primary"
              }`}
            >
              {formData.hasFrontDesign && (
                <i className="fas fa-check text-white text-sm"></i>
              )}
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <i className="fas fa-tshirt text-2xl text-primary"></i>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Front Design
                </h3>
                <p className="text-sm text-gray-500">
                  Add a design to the front of the t-shirt
                </p>
              </div>
            </div>

            {formData.hasFrontDesign && (
              <div className="mt-4 space-y-4 pl-10">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Design File (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf,.ai,.psd"
                    onChange={(e) =>
                      handleFileChange("frontDesignFile", e.target.files[0])
                    }
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                  {formData.frontDesignFile && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                      <i className="fas fa-check-circle"></i>
                      {formData.frontDesignFile.name}
                    </p>
                  )}
                </div>

                <Input
                  label="Design Notes"
                  name="frontDesignNotes"
                  placeholder="Describe your front design (size, placement, colors, etc.)"
                  value={formData.frontDesignNotes}
                  onChange={onChange}
                  error={errors.frontDesignNotes}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back Design */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-primary/30 transition-colors">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => handleCheckboxChange("hasBackDesign")}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                formData.hasBackDesign
                  ? "bg-primary border-primary"
                  : "border-gray-300 hover:border-primary"
              }`}
            >
              {formData.hasBackDesign && (
                <i className="fas fa-check text-white text-sm"></i>
              )}
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <i className="fas fa-tshirt fa-flip-horizontal text-2xl text-primary"></i>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Back Design
                </h3>
                <p className="text-sm text-gray-500">
                  Add a design to the back of the t-shirt
                </p>
              </div>
            </div>

            {formData.hasBackDesign && (
              <div className="mt-4 space-y-4 pl-10">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Design File (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf,.ai,.psd"
                    onChange={(e) =>
                      handleFileChange("backDesignFile", e.target.files[0])
                    }
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                  {formData.backDesignFile && (
                    <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                      <i className="fas fa-check-circle"></i>
                      {formData.backDesignFile.name}
                    </p>
                  )}
                </div>

                <Input
                  label="Design Notes"
                  name="backDesignNotes"
                  placeholder="Describe your back design (size, placement, colors, etc.)"
                  value={formData.backDesignNotes}
                  onChange={onChange}
                  error={errors.backDesignNotes}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {!formData.hasFrontDesign && !formData.hasBackDesign && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Please select at least one design option
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              You need to choose either front, back, or both designs to proceed
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1FrontBack;
