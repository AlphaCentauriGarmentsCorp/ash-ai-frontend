import React, { useState } from "react";

const Input = ({
  label,
  name,
  type = "text",
  placeholder = "",
  value = "",
  onChange,
  required = false,
  disabled = false,
  readOnly = false,
  error = "",
  icon = null,
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = name || label.toLowerCase().replace(/\s+/g, "-");

  const inputType = type === "password" && showPassword ? "text" : type;

  const getInputClasses = () => {
    let classes =
      "text-sm mt-1 border rounded-lg py-2 px-4 w-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary";

    if (disabled || readOnly) {
      classes += " bg-light2 placeholder-primary/80 cursor-not-allowed";
    } else {
      classes += " bg-white text-gray-800 ";
    }

    if (error) {
      classes += " border-red-500";
    } else if (disabled || readOnly) {
      classes += " border-gray-300";
    } else {
      classes += " border-gray-300 hover:border-gray-400";
    }

    if (icon || type === "password") {
      classes += " pr-10";
    }

    if (icon) {
      classes += " pl-9";
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

      <div className="relative mt-2">
        {icon && (
          <div className="absolute left-3 top-3 transform  text-gray-400">
            {icon}
          </div>
        )}

        {type === "password" && (
          <button
            type="button"
            className="absolute right-3 top-3 transform text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled || readOnly}
          >
            {showPassword ? (
              <i className="fa-solid fa-eye-slash text-sm"></i>
            ) : (
              <i className="fa-solid fa-eye text-sm"></i>
            )}
          </button>
        )}

        <input
          id={inputId}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          className={getInputClasses()}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center">
          <i className="fa-solid fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}

      {type === "text" && props.maxLength && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          {value.length}/{props.maxLength}
        </div>
      )}
    </div>
  );
};

export default Input;
