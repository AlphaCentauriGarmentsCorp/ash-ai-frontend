// components/Textarea.jsx
import React from "react";

const Textarea = ({
  label,
  name,
  placeholder = "",
  value = "",
  onChange,
  required = false,
  disabled = false,
  readOnly = false,
  error = "",
  rows = 4,
  maxLength,
  resizable = false, // Default to false (non-resizable)
  showCounter = true,
  className = "",
  ...props
}) => {
  const textareaId = name || label.toLowerCase().replace(/\s+/g, "-");

  // Determine textarea classes based on state
  const getTextareaClasses = () => {
    let classes =
      "text-sm mt-3 border rounded py-2 px-4 w-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-blue-400";

    // Resize control - FIXED
    classes += resizable ? " resize-y" : " resize-none";

    // State-based classes
    if (disabled || readOnly) {
      classes += " bg-gray-100 text-gray-500 cursor-not-allowed";
    } else {
      classes += " bg-white text-gray-800";
    }

    // Error state
    if (error) {
      classes += " border-red-500";
    } else if (disabled || readOnly) {
      classes += " border-gray-300";
    } else {
      classes += " border-gray-300 hover:border-gray-400";
    }

    return classes;
  };

  const handleChange = (e) => {
    if (maxLength && e.target.value.length > maxLength) {
      return;
    }
    if (onChange) {
      onChange(e);
    }
  };

  const remainingChars = maxLength ? maxLength - value.length : 0;
  const isNearLimit = maxLength && remainingChars <= 10;

  return (
    <div className={`mb-4 ${className}`}>
      {/* Label with optional required asterisk */}
      {label && (
        <div className="flex justify-between items-center">
          <label
            htmlFor={textareaId}
            className="text-primary text-sm font-semibold flex items-center"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {maxLength && showCounter && (
            <span
              className={`text-xs ${isNearLimit ? "text-amber-600" : "text-gray-500"}`}
            >
              {remainingChars} characters remaining
            </span>
          )}
        </div>
      )}

      {/* Textarea Field */}
      <textarea
        id={textareaId}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        rows={rows}
        maxLength={maxLength}
        className={getTextareaClasses()}
        {...props}
      />

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center">
          <i className="fa-solid fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}

      {/* Character count (when label doesn't show counter) */}
      {maxLength && !label && showCounter && (
        <div className="mt-1 flex justify-between items-center">
          {error && (
            <p className="text-xs text-red-500 flex items-center">
              <i className="fa-solid fa-exclamation-circle mr-1"></i>
              {error}
            </p>
          )}
          <div
            className={`text-xs ml-auto ${isNearLimit ? "text-amber-600" : "text-gray-500"}`}
          >
            {value.length}/{maxLength}
          </div>
        </div>
      )}
    </div>
  );
};

export default Textarea;
