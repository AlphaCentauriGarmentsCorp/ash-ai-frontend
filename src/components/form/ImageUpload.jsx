// components/ImageUpload.jsx (Alternative - Single Line)
import React, { useRef } from "react";

const ImageUpload = ({
  label,
  name,
  onChange,
  required = false,
  disabled = false,
  readOnly = false,
  error = "",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  className = "",
  multiple = false,
  ...props
}) => {
  const fileInputRef = useRef(null);
  const inputId =
    name || label?.toLowerCase().replace(/\s+/g, "-") || "image-upload";

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > maxSize) {
        alert(
          `File "${file.name}" exceeds maximum size of ${maxSize / (1024 * 1024)}MB`,
        );
        continue;
      }

      if (!file.type.startsWith("image/")) {
        alert(`File "${file.name}" is not a valid image file`);
        continue;
      }

      validFiles.push(file);
    }

    if (onChange && validFiles.length > 0) {
      if (multiple) {
        onChange(validFiles);
      } else {
        onChange(validFiles[0]);
      }
    }
  };

  const handleContainerClick = () => {
    if (!disabled && !readOnly && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Get button classes (matching your input styling)
  const getButtonClasses = () => {
    let classes =
      "text-sm mt-3 border rounded py-2 px-4 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-blue-400 ";

    if (disabled || readOnly) {
      classes += "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed";
    } else {
      classes +=
        "bg-white text-gray-700 border-gray-300 hover:border-gray-400 cursor-pointer";
    }

    if (error) {
      classes += " border-red-500";
    }

    return classes;
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-primary text-sm font-semibold flex items-center"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="mt-2">
        <input
          ref={fileInputRef}
          id={inputId}
          name={name}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          required={required}
          disabled={disabled || readOnly}
          multiple={multiple}
          className="hidden"
          {...props}
        />

        <div className={getButtonClasses()} onClick={handleContainerClick}>
          <div className="flex items-center justify-between">
            <span
              className={
                disabled || readOnly ? "text-gray-500" : "text-gray-700"
              }
            >
              <i className="fa-solid fa-paperclip mr-2 text-xs"></i>
              Choose Files
            </span>
            <span className="text-gray-400 text-sm ml-4">
              {fileInputRef.current?.files?.length
                ? `${fileInputRef.current.files.length} file(s) selected`
                : "No files chosen"}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center">
          <i className="fa-solid fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
