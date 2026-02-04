// components/FileUpload.jsx
import React, { useState, useRef } from "react";

const FileUpload = ({
  label = "Additional Files",
  name,
  onChange,
  value = [],
  acceptedTypes = "image/*,.ai,.psd",
  maxSize = 25 * 1024 * 1024, // 25MB in bytes
  multiple = true,
  disabled = false,
  error = "",
  required = false,
  className = "",
  ...props
}) => {
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (files) => {
    if (disabled) return;

    const fileList = Array.from(files);
    const validFiles = [];

    fileList.forEach((file) => {
      // Validate file size
      if (file.size > maxSize) {
        alert(`File ${file.name} exceeds maximum size of 25MB`);
        return;
      }

      // Validate file type
      const acceptedTypesArray = acceptedTypes
        .split(",")
        .map((type) => type.trim());
      const isTypeValid = acceptedTypesArray.some((type) => {
        if (type.startsWith(".")) {
          // Extension check
          return file.name
            .toLowerCase()
            .endsWith(type.toLowerCase().replace("*", ""));
        } else if (type.includes("/*")) {
          // MIME type check with wildcard
          const mainType = type.split("/*")[0];
          return file.type.startsWith(`${mainType}/`);
        } else {
          // Exact MIME type check
          return file.type === type;
        }
      });

      if (!isTypeValid) {
        alert(
          `File type not supported for ${file.name}. Accepted types: ${acceptedTypes}`,
        );
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      const updatedFiles = multiple
        ? [...value, ...validFiles]
        : [...validFiles];
      onChange?.({ target: { name, value: updatedFiles } });
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
      // Reset input value to allow selecting same file again
      e.target.value = null;
    }
  };

  // Handle remove file
  const handleRemoveFile = (indexToRemove, e) => {
    e.stopPropagation();
    const updatedFiles = value.filter((_, index) => index !== indexToRemove);
    onChange?.({ target: { name, value: updatedFiles } });
  };

  // Handle upload area click
  const handleUploadAreaClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " Bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Get file icon based on type
  const getFileIcon = (file) => {
    if (file.type.startsWith("image/")) {
      return <i className="fa-regular fa-image"></i>;
    } else if (file.type.includes("pdf")) {
      return <i className="fa-regular fa-file-pdf"></i>;
    } else if (file.name.endsWith(".ai")) {
      return <i className="fa-brands fa-adobe"></i>;
    } else if (file.name.endsWith(".psd")) {
      return <i className="fa-brands fa-adobe"></i>;
    } else {
      return <i className="fa-regular fa-file"></i>;
    }
  };

  return (
    <div className={`px-6 ${className}`}>
      {/* Label */}
      <label
        htmlFor={name}
        className="text-primary text-sm font-semibold flex items-center"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        multiple={multiple}
        accept={acceptedTypes}
        onChange={handleFileInputChange}
        disabled={disabled}
        className="hidden"
        {...props}
      />

      {/* Upload Area - EXACT same UI as provided */}
      <div
        className="mt-3 flex justify-center items-center w-full bg-white border border-gray-300 py-7 text-gray cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleUploadAreaClick}
      >
        <div className="text-center gap-y-3">
          <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-300 mb-3"></i>
          <p className="text-gray-400 text-sm">Upload Additional Files</p>
          <p className="text-gray-300 text-xs mt-1">
            {acceptedTypes
              .split(",")
              .map((t) => t.trim())
              .join(", ")}{" "}
            
          </p>
        </div>
      </div>

      {/* Uploaded Files Preview Area - EXACT same UI structure */}
      <div className="mt-3 w-full bg-white border border-gray-300 p-3 text-gray min-h-25">
        <span className="text-xs">Uploaded files</span>

        {value.length > 0 ? (
          <div className="mt-2 space-y-2">
            {value.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-gray-400">{getFileIcon(file)}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={(e) => handleRemoveFile(index, e)}
                  title="Remove file"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center gap-y-3 flex justify-center items-center h-20">
            <p className="font-light text-xs">Preview will show here</p>
          </div>
        )}
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

export default FileUpload;
