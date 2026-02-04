// components/Select.jsx
import React, { useState, useRef, useEffect } from "react";

const Select = ({
  label,
  name,
  options = [],
  value = "",
  onChange,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  error = "",
  icon = null,
  className = "",
  multiple = false,
  searchable = false,
  clearable = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const inputId = name || label?.toLowerCase().replace(/\s+/g, "-");

  // Filter options based on search term
  const filteredOptions = searchable
    ? options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.value.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : options;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens and searchable is true
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || filteredOptions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0) {
            handleOptionSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSearchTerm("");
          setHighlightedIndex(-1);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, highlightedIndex, filteredOptions]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const optionElements =
        dropdownRef.current.querySelectorAll(".select-option");
      if (optionElements[highlightedIndex]) {
        optionElements[highlightedIndex].scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  // Get selected label(s)
  const getSelectedLabel = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option = options.find((opt) => opt.value === value[0]);
        return option?.label || value[0];
      }
      return `${value.length} selected`;
    } else {
      const option = options.find((opt) => opt.value === value);
      return option?.label || value || placeholder;
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (disabled) return;

    if (multiple) {
      const newValue = Array.isArray(value) ? [...value] : [];
      const index = newValue.indexOf(option.value);

      if (index > -1) {
        newValue.splice(index, 1);
      } else {
        newValue.push(option.value);
      }

      onChange?.({ target: { name, value: newValue } });
    } else {
      onChange?.({ target: { name, value: option.value } });
      setIsOpen(false);
      setSearchTerm("");
      setHighlightedIndex(-1);
    }
  };

  // Check if option is selected
  const isSelected = (optionValue) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  // Handle clear selection
  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.({ target: { name, value: multiple ? [] : "" } });
    if (!multiple) {
      setIsOpen(false);
    }
  };

  // Determine container classes
  const getContainerClasses = () => {
    let classes =
      "text-sm mt-3 border rounded py-2 px-4 w-full transition-colors duration-200 cursor-pointer flex items-center justify-between";

    if (disabled) {
      classes += " bg-gray-100 text-gray-500 cursor-not-allowed";
    } else if (isOpen) {
      classes += " bg-white border-blue-500 ring-1 ring-primary/20";
    } else if (error) {
      classes += " bg-white border-red-500 hover:border-red-600";
    } else {
      classes += " bg-white border-gray-300 hover:border-gray-400";
    }

    return classes;
  };

  return (
    <div className={`mb-4 relative ${className}`} ref={selectRef}>
      {/* Label with optional required asterisk */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-primary text-sm font-semibold flex items-center"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Container */}
      <div
        className={getContainerClasses()}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setHighlightedIndex(
                filteredOptions.findIndex((opt) => isSelected(opt.value)),
              );
            }
          }
        }}
      >
        <div className="flex items-center flex-1 overflow-hidden">
          {/* Icon */}
          {icon && <div className="mr-3 text-gray-400">{icon}</div>}

          {/* Selected Value Display */}
          <span
            className={`truncate ${!value || (multiple && value.length === 0) ? "text-gray-400" : "text-gray-800"}`}
          >
            {getSelectedLabel()}
          </span>
        </div>

        {/* Clear and Dropdown Icons */}
        <div className="flex items-center space-x-2 ml-2">
          {/* Clear Button */}
          {clearable && value && !disabled && (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={handleClear}
              disabled={disabled}
            >
              <i className="fa-solid fa-times text-sm"></i>
            </button>
          )}

          {/* Dropdown Icon */}
          <div
            className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <i className="fa-solid fa-chevron-down text-sm text-gray-400"></i>
          </div>
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {/* Search Input for searchable select */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1);
                }}
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-blue-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options List */}
          <div className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`select-option px-4 py-2 text-sm cursor-pointer transition-colors duration-150 flex items-center ${
                    isSelected(option.value)
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50 text-gray-700"
                  } ${index === highlightedIndex ? "bg-gray-100" : ""}`}
                  onClick={() => handleOptionSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {/* Checkbox for multiple select */}
                  {multiple && (
                    <div
                      className={`mr-3 w-4 h-4 border rounded flex items-center justify-center ${
                        isSelected(option.value)
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected(option.value) && (
                        <i className="fa-solid fa-check text-xs text-white"></i>
                      )}
                    </div>
                  )}

                  {/* Option Icon */}
                  {option.icon && (
                    <span className="mr-2 text-gray-400">{option.icon}</span>
                  )}

                  {/* Option Label */}
                  <span className="flex-1">{option.label}</span>

                  {/* Single select checkmark */}
                  {!multiple && isSelected(option.value) && (
                    <i className="fa-solid fa-check text-blue-500 ml-2"></i>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center">
          <i className="fa-solid fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}
    </div>
  );
};

// PropTypes for better development experience
Select.defaultProps = {
  options: [
    // Example structure:
    // { value: "option1", label: "Option 1", icon: <Icon /> }
  ],
  placeholder: "Select an option",
  required: false,
  disabled: false,
  multiple: false,
  searchable: false,
  clearable: false,
};

export default Select;
