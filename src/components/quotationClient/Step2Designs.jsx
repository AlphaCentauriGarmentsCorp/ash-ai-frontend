import React, { useState } from "react";

const Step2Designs = ({ formData, onChange, errors }) => {
  const [showUrlInputByPart, setShowUrlInputByPart] = useState({});
  const parts = Array.isArray(formData.parts) ? formData.parts : [];

  const updatePart = (partKey, patch) => {
    const updatedParts = parts.map((part) =>
      String(part.key) === String(partKey)
        ? { ...part, ...patch }
        : part,
    );
    onChange({ target: { name: "parts", value: updatedParts } });
  };

  const toggleUrlInput = (partKey, visible) => {
    setShowUrlInputByPart((prev) => ({
      ...prev,
      [partKey]: visible,
    }));
  };

  const renderUploadSection = (part) => {
    const showUrlInput = !!showUrlInputByPart[part.key];
    const designError = errors[`design_${part.key}`];
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {part.part} Design Upload
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose File
            </label>
            <input
              type="file"
              accept="image/*,.pdf,.ai,.psd"
              onChange={(e) =>
                updatePart(part.key, {
                  image_file: e.target.files?.[0] || null,
                  image_link: e.target.files?.[0] ? "" : part.image_link,
                  image_input_type: "file",
                })
              }
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            {part.image_file && (
              <p className="mt-2 text-sm text-green-600 flex items-center gap-2">
                <i className="fas fa-check-circle"></i>
                {part.image_file.name}
              </p>
            )}
          </div>

          {!showUrlInput ? (
            <button
              type="button"
              onClick={() => toggleUrlInput(part.key, true)}
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-2"
            >
              <i className="fas fa-link"></i>
              Or upload via URL
            </button>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Design URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/design.png"
                value={part.image_link || ""}
                onChange={(e) =>
                  updatePart(part.key, {
                    image_link: e.target.value,
                    image_file: null,
                    image_input_type: "link",
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="button"
                onClick={() => {
                  toggleUrlInput(part.key, false);
                  updatePart(part.key, { image_link: "" });
                }}
                className="text-sm text-gray-500 hover:text-gray-700 mt-2"
              >
                Cancel URL input
              </button>
            </div>
          )}

          {!part.image_file && part.existing_image_url && (
            <div className="rounded-lg border border-gray-200 p-2 bg-gray-50">
              <p className="text-[11px] text-gray-500 mb-2">Current uploaded image</p>
              <a
                href={part.existing_image_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2"
              >
                <img
                  src={part.existing_image_url}
                  alt={part.part || "Part design"}
                  className="h-14 w-14 rounded border border-gray-200 object-cover bg-white"
                />
                <span className="text-xs text-primary hover:underline">View image</span>
              </a>
            </div>
          )}

          {designError && (
            <p className="mt-1 text-xs text-red-500 flex items-center">
              <i className="fa-solid fa-exclamation-circle mr-1"></i>
              {designError}
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
          Design Upload
        </h2>
        <p className="text-gray-600">
          Upload your design files or provide links for each shared part
        </p>
      </div>

      {parts.length > 0 ? (
        <div className="space-y-4">
          {parts.map((part) => (
            <React.Fragment key={part.key}>{renderUploadSection(part)}</React.Fragment>
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

export default Step2Designs;
