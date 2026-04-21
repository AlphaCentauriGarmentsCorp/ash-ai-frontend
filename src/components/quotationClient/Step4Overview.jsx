import React from "react";

const Step4Overview = ({ formData }) => {
  const parts = Array.isArray(formData.parts) ? formData.parts : [];

  const renderFilePreview = (file, url, part) => {
    if (!file && !url) return null;

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <i className="fas fa-file-image text-primary text-xl"></i>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">{part}</p>
          {file && (
            <p className="text-xs text-gray-500">
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
          {url && !file && (
            <p className="text-xs text-gray-500 truncate">{url}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Review & Submit
        </h2>
        <p className="text-gray-600">
          Review your details before submitting
        </p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-clipboard-list text-primary"></i>
          Summary
        </h3>

        <div className="space-y-4">
          {/* Selected Parts */}
          <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
            <i className="fas fa-tshirt text-primary mt-1"></i>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Selected Parts</p>
              <p className="text-sm text-gray-600 mt-1">
                {parts.length > 0 ? parts.map((part) => part.part).join(", ") : "None"}
              </p>
            </div>
          </div>

          {/* Design Files */}
          {parts.length > 0 && (
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
              <i className="fas fa-images text-primary mt-1"></i>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-3">Design Files</p>
                <div className="space-y-2">
                  {parts.map((part) => (
                    <React.Fragment key={part.key}>
                      {renderFilePreview(
                        part.image_file,
                        part.image_link || part.existing_image_url,
                        `${part.part} Design`,
                      ) || (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <i className="fas fa-file-circle-xmark text-gray-400 text-xl"></i>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">{part.part} Design</p>
                            <p className="text-xs text-gray-500">No file or URL provided</p>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Colors */}
          {parts.length > 0 && (
            <div className="flex items-start gap-3">
              <i className="fas fa-palette text-primary mt-1"></i>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Print Colors</p>
                {parts.map((part) => (
                  <p key={part.key} className="text-sm text-gray-600 mt-1">
                    {part.part}: {part.color_count || 1} color{Number(part.color_count || 1) > 1 ? "s" : ""}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step4Overview;
