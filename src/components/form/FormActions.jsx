import React from "react";

/**
 * FormActions Component
 * A reusable component for form action buttons (Submit, Reset, Cancel, etc.)
 *
 * @param {Object} props
 * @param {function} props.onSubmit - Submit button click handler
 * @param {function} props.onReset - Reset button click handler (optional)
 * @param {function} props.onCancel - Cancel button click handler (optional)
 * @param {boolean} props.isSubmitting - Loading state for submit button
 * @param {string} props.submitText - Text for submit button (default: "Save")
 * @param {string} props.resetText - Text for reset button (default: "Reset")
 * @param {string} props.cancelText - Text for cancel button (default: "Cancel")
 * @param {string} props.submittingText - Text for submit button when loading (default: "Saving...")
 * @param {string} props.alignment - Button alignment: "center", "left", "right", "between" (default: "center")
 * @param {boolean} props.showReset - Show reset button (default: true)
 * @param {boolean} props.showCancel - Show cancel button (default: false)
 * @param {string} props.submitButtonClass - Additional classes for submit button
 * @param {string} props.resetButtonClass - Additional classes for reset button
 * @param {string} props.cancelButtonClass - Additional classes for cancel button
 * @param {string} props.containerClass - Additional classes for container
 * @param {React.ReactNode} props.customButtons - Custom buttons to render
 */
const FormActions = ({
  onSubmit,
  onReset,
  onCancel,
  isSubmitting = false,
  submitText = "Save",
  resetText = "Reset",
  cancelText = "Cancel",
  submittingText = "Saving...",
  alignment = "center",
  showReset = true,
  showCancel = false,
  submitButtonClass = "",
  resetButtonClass = "",
  cancelButtonClass = "",
  containerClass = "",
  customButtons,
}) => {
  // Determine alignment classes
  const getAlignmentClass = () => {
    switch (alignment) {
      case "left":
        return "justify-start";
      case "right":
        return "justify-end";
      case "between":
        return "justify-between";
      case "center":
      default:
        return "justify-center";
    }
  };

  // Handle submit
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (onSubmit && !isSubmitting) {
      onSubmit();
    }
  };

  // Handle reset
  const handleReset = (e) => {
    e?.preventDefault();
    if (onReset && !isSubmitting) {
      onReset();
    }
  };

  // Handle cancel
  const handleCancel = (e) => {
    e?.preventDefault();
    if (onCancel && !isSubmitting) {
      onCancel();
    }
  };

  return (
    <div className={`mt-5 border-gray-300 ${containerClass}`}>
      <div className={`flex gap-3 ${getAlignmentClass()}`}>
        {/* Cancel Button (optional) */}
        {showCancel && onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className={`px-8 py-2.5 border rounded-lg border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors ${cancelButtonClass}`}
            disabled={isSubmitting}
          >
            {cancelText}
          </button>
        )}

        {/* Reset Button (optional) */}
        {showReset && onReset && (
          <button
            type="button"
            onClick={handleReset}
            className={`px-8 py-2.5 border rounded-lg border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors ${resetButtonClass}`}
            disabled={isSubmitting}
          >
            {resetText}
          </button>
        )}

        {/* Custom Buttons */}
        {customButtons}

        {/* Submit Button */}
        <button
          type="submit"
          onClick={handleSubmit}
          className={`px-8 py-2.5 bg-primary font-medium text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${submitButtonClass}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <i className="fa-solid fa-spinner fa-spin mr-2"></i>
              {submittingText}
            </>
          ) : (
            submitText
          )}
        </button>
      </div>
    </div>
  );
};

export default FormActions;
