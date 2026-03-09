import React from "react";

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

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (onSubmit && !isSubmitting) {
      onSubmit();
    }
  };

  const handleReset = (e) => {
    e?.preventDefault();
    if (onReset && !isSubmitting) {
      onReset();
    }
  };

  const handleCancel = (e) => {
    e?.preventDefault();
    if (onCancel && !isSubmitting) {
      onCancel();
    }
  };

  return (
    <div className={`mt-5 border-gray-300 ${containerClass}`}>
      <div className={`flex gap-3 ${getAlignmentClass()}`}>
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

        {customButtons}
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
