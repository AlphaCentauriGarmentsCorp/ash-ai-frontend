import React, { useEffect, useState } from "react";

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  itemName = "",
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
        onClick={onClose}
      />

      <div
        className={`relative bg-white rounded-xl p-4 sm:p-6 w-full shadow-2xl transform transition-all duration-300 ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        } ${"max-w-[90%] xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md"}`}
      >
        <button
          onClick={onClose}
          className="hidden sm:block absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-100 flex items-center justify-center animate-bounce">
            <i className="fas fa-exclamation-triangle text-2xl sm:text-3xl text-red-600"></i>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-center text-gray-900 mb-2">
          Confirm Delete
        </h3>

        <div className="text-center mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600 wrap-break-word">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900 block sm:inline mt-1 sm:mt-0">
              "{itemName}"
            </span>
            ?
          </p>
          <p className="text-xs sm:text-sm text-red-500 mt-2 flex items-center justify-center gap-1">
            <i className="fas fa-exclamation-circle"></i>
            <span>This action cannot be undone</span>
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 sm:gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <i className="fas fa-times"></i>
            <span>Cancel</span>
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] text-sm sm:text-base"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <i className="fas fa-trash-alt"></i>
                <span>Delete</span>
              </>
            )}
          </button>
        </div>

        <p className="text-center mt-4 sm:hidden text-xs text-gray-400">
          Tap outside to cancel
        </p>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;
