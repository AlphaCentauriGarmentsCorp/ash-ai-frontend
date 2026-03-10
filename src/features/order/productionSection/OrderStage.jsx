import React, { useState } from "react";
import {
  OrderStages,
  getStageGroups,
} from "../../../constants/formOptions/orderStages";

const OrderStage = ({ order }) => {
  const [stages, setStages] = useState(() => {
    const initialState = {};
    OrderStages.forEach((stage) => {
      initialState[stage.value] = true;
    });
    return initialState;
  });

  const handleCheckboxChange = (stageValue) => {
    setStages((prevState) => ({
      ...prevState,
      [stageValue]: !prevState[stageValue],
    }));
  };

  const groups = getStageGroups();

  const getSelectedCount = (groupName) => {
    const groupStages = OrderStages.filter(
      (stage) => stage.group === groupName,
    );
    return groupStages.filter((stage) => stages[stage.value]).length;
  };

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
              onClick={() => {
                const allSelected = groupStages.every(
                  (stage) => stages[stage.value],
                );
                const newState = { ...stages };
                groupStages.forEach((stage) => {
                  newState[stage.value] = !allSelected;
                });
                setStages(newState);
              }}
              className="text-xs text-primary hover:text-primary/90 font-medium transition-colors"
            >
              {groupStages.every((stage) => stages[stage.value])
                ? "Clear All"
                : "Select All"}
            </button>
          </div>
        </div>

        {}
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
                `}
              >
                <input
                  type="checkbox"
                  id={stage.value}
                  checked={stages[stage.value]}
                  onChange={() => handleCheckboxChange(stage.value)}
                  className="
                    w-4 h-4 text-blue-600 
                    rounded border-gray-300 
                    focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                    cursor-pointer shrink-0
                  "
                />
                <span
                  className={`
                  text-sm flex-1
                  ${stages[stage.value] ? "text-primary/90 font-medium" : "text-gray-600"}
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

  const totalStages = OrderStages.length;
  const selectedStages = Object.values(stages).filter(Boolean).length;

  return (
    <section className="flex flex-col gap-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            Order Stages
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2 sm:line-clamp-1">
            Select the stages this order will go through
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <div className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
            <span className="font-semibold text-gray-900">
              {selectedStages}
            </span>{" "}
            of {totalStages} stages selected
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {groups.map((groupName) => renderStageGroup(groupName))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              const newState = {};
              OrderStages.forEach((stage) => {
                newState[stage.value] = true;
              });
              setStages(newState);
            }}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => {
              const newState = {};
              OrderStages.forEach((stage) => {
                newState[stage.value] = false;
              });
              setStages(newState);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
          >
            Clear All
          </button>
        </div>

        {}
        <button
          type="button"
          className="cursor-pointer px-6 py-2 flex items-center gap-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors focus:outline-none  shadow-sm"
        >
          <i className="fas fa-save"></i>
          Save Stages
        </button>
      </div>
    </section>
  );
};

export default OrderStage;
