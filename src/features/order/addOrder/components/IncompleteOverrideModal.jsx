import React, { useEffect, useState } from "react";

/**
 * Superadmin "Save anyway" confirmation for an incomplete order.
 *
 * Lists the still-blank recommended fields and, on confirm, lets the caller
 * submit the order with the incomplete-override flag. Styling mirrors
 * DeleteConfirmationDialog so it feels native to the app (amber/warning here
 * rather than red/destructive).
 */
const IncompleteOverrideModal = ({
  isOpen,
  onClose,
  onConfirm,
  fields = [],
  isLoading = false,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isAnimating && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={isLoading ? undefined : onClose}
      />

      <div
        className={`relative bg-white rounded-xl p-4 sm:p-6 w-full shadow-2xl transform transition-all duration-300 ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        } max-w-[90%] xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md`}
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="hidden sm:block absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <i className="fas fa-triangle-exclamation text-2xl sm:text-3xl text-amber-600"></i>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-center text-gray-900 mb-2">
          Save with missing details?
        </h3>

        <p className="text-sm sm:text-base text-gray-600 text-center mb-3">
          This order is missing some recommended information. As a superadmin
          you can save it now and complete it later — it will be flagged as
          <span className="font-semibold text-amber-700"> Incomplete</span>.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 max-h-44 overflow-auto">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">
            Missing fields ({fields.length})
          </p>
          <ul className="space-y-1">
            {fields.map((label) => (
              <li
                key={label}
                className="text-sm text-gray-700 flex items-center gap-2"
              >
                <i className="fas fa-circle text-[6px] text-amber-500"></i>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 sm:gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <i className="fas fa-pen"></i>
            <span>Go back &amp; fill in</span>
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] text-sm sm:text-base"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <i className="fas fa-floppy-disk"></i>
                <span>Save anyway</span>
              </>
            )}
          </button>
        </div>

        <p className="text-center mt-4 sm:hidden text-xs text-gray-400">
          Tap outside to go back
        </p>
      </div>
    </div>
  );
};

export default IncompleteOverrideModal;
