import React, { useEffect } from "react";
import {
  OrderStages,
  getStageGroups,
} from "../../constants/formOptions/orderStages";
import { useOrderStages } from "./hooks/useOrderStages";

const OrderStage = ({ order, onStagesUpdated }) => {
  const {
    stages,
    handleCheckboxChange,
    handleGroupSelectAll,
    handleSelectAll,
    handleClearAll,
    handleSubmit,
    getSelectedCount,
    stats,
    isLoading,
    error,
    submitSuccess,
    resetSubmissionState,
  } = useOrderStages(order, onStagesUpdated);

  const groups = getStageGroups();

  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        resetSubmissionState();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, resetSubmissionState]);

  const hasSelectedStages = stats.selectedStages > 0;

  const renderStageGroup = (groupName) => {
    const groupStages = OrderStages.filter(
      (stage) => stage.group === groupName,
    );
    const selectedCount = getSelectedCount(groupName);

    return (
      <div
        key={groupName}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">{groupName}</h3>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {selectedCount}/{groupStages.length}
              </span>
            </div>

            <button
              onClick={() => handleGroupSelectAll(groupStages)}
              disabled={isLoading}
              className="text-xs text-primary hover:text-primary/90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {groupStages.every((stage) => stages[stage.value])
                ? "Clear All"
                : "Select All"}
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {groupStages.map((stage) => (
              <label
                key={stage.value}
                className={`
                  flex items-center gap-3 p-2 rounded-md cursor-pointer
                  transition-all duration-150
                  ${
                    stages[stage.value]
                      ? "bg-light/70 border border-blue-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <input
                  type="checkbox"
                  id={stage.value}
                  checked={stages[stage.value]}
                  onChange={() => handleCheckboxChange(stage.value)}
                  disabled={isLoading}
                  className="
                    w-4 h-4 text-blue-600 
                    rounded border-gray-300 
                    focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                    cursor-pointer shrink-0
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
                <span
                  className={`
                  text-sm flex-1
                  ${stages[stage.value] ? "text-primary/90 font-medium" : "text-gray-600"}
                  ${isLoading ? "opacity-50" : ""}
                `}
                >
                  {stage.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const selectedStagesList = Object.entries(stages)
    .filter(([_, value]) => value)
    .map(([key]) => key);

  return (
    <section className="flex flex-col gap-y-6">
      {}
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle text-green-500"></i>
            <span>Order stages saved successfully!</span>
          </div>
          <button
            onClick={resetSubmissionState}
            className="text-green-700 hover:text-green-900"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <i className="fas fa-exclamation-circle text-red-500"></i>
            <span>{error}</span>
          </div>
          <button
            onClick={resetSubmissionState}
            className="text-red-700 hover:text-red-900"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              Order Stages
            </h1>
            {}
            {!hasSelectedStages && !isLoading && (
              <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full flex items-center gap-1">
                <i className="fas fa-exclamation-triangle text-xs"></i>
                No stages selected
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 sm:line-clamp-1">
            Select the stages this order will go through
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <div className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
            <span className="font-semibold text-gray-900">
              {stats.selectedStages}
            </span>{" "}
            of {stats.totalStages} stages selected
            <span className="ml-2 text-xs text-gray-400">
              ({stats.completionPercentage}%)
            </span>
          </div>
        </div>
      </div>

      {}
      {!hasSelectedStages && !isLoading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
          <i className="fas fa-info-circle text-amber-500 text-sm"></i>
          <p className="text-xs text-amber-700">
            Please select at least one stage before saving.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {groups.map((groupName) => renderStageGroup(groupName))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={isLoading || !hasSelectedStages}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleSubmit(order)}
          disabled={!order?.id || isLoading || !hasSelectedStages}
          className={`
            cursor-pointer px-6 py-2 flex items-center gap-2 text-sm font-medium 
            text-white rounded-md transition-colors focus:outline-none shadow-sm
            ${
              !order?.id || isLoading || !hasSelectedStages
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            }
          `}
          title={
            !hasSelectedStages
              ? "Select at least one stage to save"
              : !order?.id
                ? "Order ID is missing"
                : ""
          }
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i>
              {order?.orderStages?.length > 0 ? "Update Stages" : "Save Stages"}
            </>
          )}
        </button>
      </div>
    </section>
  );
};

export default OrderStage;
