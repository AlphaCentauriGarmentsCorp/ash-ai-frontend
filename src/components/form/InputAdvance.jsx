// components/InputAdvanced.jsx
import React, { useState } from "react";

const InputAdvanced = ({
  label,
  name,
  type = "text",
  placeholder = "",
  value = "",
  onChange,
  onBlur,
  required = false,
  disabled = false,
  readOnly = false,
  error = "",
  success = "",
  helperText = "",
  icon = null,
  className = "",
  containerClassName = "",
  labelClassName = "",
  inputClassName = "",
  showCharacterCount = false,
  maxLength,
  min,
  max,
  pattern,
  autoComplete = "off",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputId =
    name ||
    label?.toLowerCase().replace(/\s+/g, "-") ||
    `input-${Math.random().toString(36).substr(2, 9)}`;

  // Determine input type for password toggle
  const inputType = type === "password" && showPassword ? "text" : type;

  // Determine input classes based on state
  const getInputClasses = () => {
    let classes =
      "text-sm mt-1 border rounded py-2.5 px-4 w-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2";

    // State-based classes
    if (disabled || readOnly) {
      classes += " bg-gray-50 text-gray-500 cursor-not-allowed border-gray-300";
    } else if (error) {
      classes +=
        " bg-white text-gray-800 border-red-500 focus:ring-red-500 focus:border-red-500";
    } else if (success) {
      classes +=
        " bg-white text-gray-800 border-green-500 focus:ring-green-500 focus:border-green-500";
    } else if (isFocused) {
      classes +=
        " bg-white text-gray-800 border-blue-500 focus:ring-blue-500 focus:border-blue-500";
    } else {
      classes +=
        " bg-white text-gray-800 border-gray-300 hover:border-gray-400 focus:ring-blue-500 focus:border-blue-500";
    }

    // Add icon padding if icon exists
    if (icon || type === "password") {
      classes += " pl-10";
    }

    if (type === "password") {
      classes += " pr-10";
    }

    // Add custom input classes
    if (inputClassName) {
      classes += ` ${inputClassName}`;
    }

    return classes;
  };

  // Determine container classes
  const getContainerClasses = () => {
    let classes = "mb-5";

    if (containerClassName) {
      classes += ` ${containerClassName}`;
    }

    return classes;
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      {/* Label with optional required asterisk */}
      {label && (
        <label
          htmlFor={inputId}
          className={`text-gray-700 text-sm font-medium flex items-center ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {helperText && (
            <span className="ml-2 text-xs text-gray-500 font-normal">
              ({helperText})
            </span>
          )}
        </label>
      )}

      {/* Input Container with icon */}
      <div className="relative mt-1">
        {/* Icon */}
        {icon && (
          <div
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              error
                ? "text-red-500"
                : success
                  ? "text-green-500"
                  : isFocused
                    ? "text-blue-500"
                    : "text-gray-400"
            }`}
          >
            {icon}
          </div>
        )}

        {/* Password toggle icon */}
        {type === "password" && (
          <button
            type="button"
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none ${
              disabled || readOnly
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled || readOnly}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <i className="fa-solid fa-eye-slash text-sm"></i>
            ) : (
              <i className="fa-solid fa-eye text-sm"></i>
            )}
          </button>
        )}

        {/* Success icon */}
        {success && !error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
            <i className="fa-solid fa-check-circle text-sm"></i>
          </div>
        )}

        {/* Error icon (only if no password toggle) */}
        {error && type !== "password" && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
            <i className="fa-solid fa-exclamation-circle text-sm"></i>
          </div>
        )}

        {/* Input Field */}
        <input
          id={inputId}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          min={min}
          max={max}
          pattern={pattern}
          autoComplete={autoComplete}
          className={getInputClasses()}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : success
                ? `${inputId}-success`
                : undefined
          }
          {...props}
        />
      </div>

      {/* Helper text area */}
      <div className="mt-1">
        {/* Error Message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-red-500 flex items-center"
            role="alert"
          >
            <i className="fa-solid fa-exclamation-circle mr-1.5 text-xs"></i>
            {error}
          </p>
        )}

        {/* Success Message */}
        {success && !error && (
          <p
            id={`${inputId}-success`}
            className="text-xs text-green-500 flex items-center"
          >
            <i className="fa-solid fa-check-circle mr-1.5 text-xs"></i>
            {success}
          </p>
        )}

        {/* Character count */}
        {showCharacterCount && maxLength && (
          <div className="text-xs text-gray-500 text-right mt-1">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputAdvanced;
