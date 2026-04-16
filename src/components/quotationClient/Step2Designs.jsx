import React, { useState } from "react";
import Input from "../form/Input";

const Step2Designs = ({ formData, onChange, errors }) => {
  const [showFrontUrlInput, setShowFrontUrlInput] = useState(false);
  const [showBackUrlInput, setShowBackUrlInput] = useState(false);

  const handleFileChange = (field, file) => {
    onChange({ target: { name: field, value: file } });
  };

  const handleUrlChange = (field, value) => {
    onChange({ target: { name: field, value } });
  };

  const renderUploadSection = (part, fileField, urlField, showUrlInput, setShowUrlInput) => {
    const file = formData[fileField];
    const url = formData[urlField];

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {part} Design Upload
        </h3>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose File
            </label>
            <input
              type="file"
              accept="image/*,.pdf,.ai,.psd"
              onChange={(e) => handleFileChange(fileField, e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            {file && (
              <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                <i className="fas fa-check-circle"></i>
                {file.name}
              </p>
            )}
          </div>

          {/* URL Input Toggle */}
          {!showUrlInput ? (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-2"
            >
              <i className="fas fa-link"></i>
              Or upload via URL
            </button>
          ) : (
            <div>
              <Input
                label="Design URL"
                name={urlField}
                placeholder="https://example.com/design.png"
                value={url}
                onChange={(e) => handleUrlChange(urlField, e.target.value)}
                error={errors[urlField]}
              />
              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(false);
                  handleUrlChange(urlField, "");
                }}
                className="text-sm text-gray-500 hover:text-gray-700 mt-2"
              >
                Cancel URL input
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Design Upload
        </h2>
        <p className="text-gray-600">
          Upload your design files or provide URLs
        </p>
      </div>

      {/* Front Upload - Only show if front part is selected */}
      {formData.hasFrontPart && renderUploadSection(
        "Front",
        "frontDesignFile",
        "frontDesignUrl",
        showFrontUrlInput,
        setShowFrontUrlInput
      )}

      {/* Back Upload - Only show if back part is selected */}
      {formData.hasBackPart && renderUploadSection(
        "Back",
        "backDesignFile",
        "backDesignUrl",
        showBackUrlInput,
        setShowBackUrlInput
      )}

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

export default Step2Designs;
