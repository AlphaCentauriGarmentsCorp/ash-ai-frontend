import React, { useRef, useState } from "react";

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
  // Stable, unique id so the <label htmlFor> reliably targets THIS input even
  // when several ImageUpload instances are on the same page.
  const inputId = `image-upload-${name || label?.toLowerCase().replace(/\s+/g, "-") || "field"}`;
  const [selectedNames, setSelectedNames] = useState([]);

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

    // Reflect the selection in state so the label re-renders (reading
    // fileInputRef.current.files directly never triggers a re-render).
    setSelectedNames(validFiles.map((f) => f.name));

    if (onChange && validFiles.length > 0) {
      onChange(multiple ? validFiles : validFiles[0]);
    }

    // Allow re-selecting the same file again (onChange won't fire otherwise).
    e.target.value = "";
  };

  const getButtonClasses = () => {
    let classes =
      "text-sm mt-3 border rounded-lg py-2 px-4 transition-colors duration-200 block ";

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

  const isDisabled = disabled || readOnly;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <span className="text-primary text-sm font-semibold flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
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
          disabled={isDisabled}
          multiple={multiple}
          className="sr-only"
          {...props}
        />

        {/* A <label> bound to the input opens the picker natively — no JS
            click() call that a browser could silently block. This is the fix
            for the "dead Choose Files button". */}
        <label htmlFor={inputId} className={getButtonClasses()}>
          <span className="flex items-center justify-between">
            <span className={isDisabled ? "text-gray-500" : "text-gray-700"}>
              <i className="fa-solid fa-paperclip mr-2 text-xs"></i>
              Choose {multiple ? "Files" : "File"}
            </span>
            <span className="text-gray-400 text-sm ml-4 truncate max-w-[55%]">
              {selectedNames.length
                ? multiple
                  ? `${selectedNames.length} file(s) selected`
                  : selectedNames[0]
                : "No file chosen"}
            </span>
          </span>
        </label>
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