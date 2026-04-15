import React from "react";
import Select from "../form/Select";
import Input from "../form/Input";

const Step2Designs = ({ formData, onChange, errors }) => {
  const designTypeOptions = [
    { value: "upload", label: "Upload My Own Design" },
    { value: "template", label: "Choose from Templates" },
    { value: "describe", label: "Describe Design (We'll Create It)" },
  ];

  const templateOptions = [
    { value: "template1", label: "Classic Logo" },
    { value: "template2", label: "Modern Typography" },
    { value: "template3", label: "Vintage Style" },
    { value: "template4", label: "Minimalist Design" },
    { value: "template5", label: "Bold Graphics" },
  ];

  const handleMultipleFileUpload = (files) => {
    const fileArray = Array.from(files);
    onChange({
      target: {
        name: "uploadedDesigns",
        value: [...(formData.uploadedDesigns || []), ...fileArray],
      },
    });
  };

  const removeUploadedFile = (index) => {
    const newFiles = formData.uploadedDesigns.filter((_, i) => i !== index);
    onChange({ target: { name: "uploadedDesigns", value: newFiles } });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Design Details
        </h2>
        <p className="text-gray-600">
          Tell us more about your design preferences
        </p>
      </div>

      <Select
        label="How would you like to provide your design?"
        name="designType"
        options={designTypeOptions}
        value={formData.designType}
        onChange={onChange}
        placeholder="Select design method"
        required
        error={errors.designType}
      />

      {/* Upload Design */}
      {formData.designType === "upload" && (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-primary transition-colors">
          <div className="text-center">
            <i className="fas fa-cloud-upload-alt text-4xl text-primary mb-3"></i>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Upload Your Design Files
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Supported formats: JPG, PNG, PDF, AI, PSD
            </p>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.ai,.psd"
              onChange={(e) => handleMultipleFileUpload(e.target.files)}
              className="hidden"
              id="design-upload"
            />
            <label
              htmlFor="design-upload"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Choose Files
            </label>
          </div>

          {formData.uploadedDesigns && formData.uploadedDesigns.length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Uploaded Files:
              </p>
              {formData.uploadedDesigns.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <i className="fas fa-file-image text-primary"></i>
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeUploadedFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Choose Template */}
      {formData.designType === "template" && (
        <div className="space-y-4">
          <Select
            label="Select a Template"
            name="selectedTemplate"
            options={templateOptions}
            value={formData.selectedTemplate}
            onChange={onChange}
            placeholder="Choose a template"
            required
            error={errors.selectedTemplate}
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {templateOptions.map((template) => (
              <div
                key={template.value}
                onClick={() =>
                  onChange({
                    target: { name: "selectedTemplate", value: template.value },
                  })
                }
                className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-all ${
                  formData.selectedTemplate === template.value
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                }`}
              >
                <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <i className="fas fa-image text-3xl text-gray-400"></i>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {template.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Describe Design */}
      {formData.designType === "describe" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <i className="fas fa-info-circle text-blue-600 mt-1"></i>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Design Creation Service
              </h3>
              <p className="text-xs text-blue-700">
                Our design team will create your custom design based on your
                description. Additional fees may apply.
              </p>
            </div>
          </div>
        </div>
      )}

      <Input
        label="Design Notes & Specifications"
        name="designNotes"
        placeholder="Provide any additional details about your design (colors, text, dimensions, placement, etc.)"
        value={formData.designNotes}
        onChange={onChange}
        error={errors.designNotes}
      />
    </div>
  );
};

export default Step2Designs;
