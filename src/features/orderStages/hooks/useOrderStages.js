import { useState, useCallback, useMemo, useEffect } from "react";
import { OrderStages } from "../../../constants/formOptions/orderStages";
import { transformStagesForSubmit } from "../utlis/orderStageUtils";
import { orderStagesApi } from "../../../api/orderStagesApi";

export const useOrderStages = (initialOrder = null, onSuccess = null) => {
  const [stages, setStages] = useState(() => {
    const initialState = {};

    OrderStages.forEach((stage) => {
      initialState[stage.value] = false;
    });

    return initialState;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (initialOrder?.orderStages && Array.isArray(initialOrder.orderStages)) {
      const existingStages = initialOrder.orderStages.map(
        (stageObj) => stageObj.stage,
      );

      setStages((prevState) => {
        const newState = { ...prevState };

        existingStages.forEach((stageValue) => {
          if (newState.hasOwnProperty(stageValue)) {
            newState[stageValue] = true;
          }
        });
        return newState;
      });
    }
  }, [initialOrder]);

  const handleCheckboxChange = useCallback((stageValue) => {
    setStages((prevState) => ({
      ...prevState,
      [stageValue]: !prevState[stageValue],
    }));
    setSubmitSuccess(false);
    setError(null);
  }, []);

  const handleGroupSelectAll = useCallback((groupStages) => {
    setStages((prevState) => {
      const allSelected = groupStages.every((stage) => prevState[stage.value]);
      const newState = { ...prevState };
      groupStages.forEach((stage) => {
        newState[stage.value] = !allSelected;
      });
      return newState;
    });
    setSubmitSuccess(false);
    setError(null);
  }, []);

  const handleSelectAll = useCallback(() => {
    setStages((prevState) => {
      const newState = {};
      OrderStages.forEach((stage) => {
        newState[stage.value] = true;
      });
      return newState;
    });
    setSubmitSuccess(false);
    setError(null);
  }, []);

  const handleClearAll = useCallback(() => {
    setStages((prevState) => {
      const newState = {};
      OrderStages.forEach((stage) => {
        newState[stage.value] = false;
      });
      return newState;
    });
    setSubmitSuccess(false);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (orderData = null) => {
      if (!orderData?.id) {
        setError("Order ID is required");
        return { error: "Order ID is required" };
      }

      setIsLoading(true);
      setError(null);

      try {
        const stagesForSubmit = transformStagesForSubmit(stages);

        const submitData = {
          order_id: orderData.id,
          stages: stagesForSubmit,
        };

        console.log("Submitting Order Stages: ", submitData);

        const response = await orderStagesApi.create(submitData);

        setSubmitSuccess(true);

        if (onSuccess) {
          onSuccess(response.data);
        }

        return response.data;
      } catch (error) {
        console.error("Failed to save order stages:", error);
        setError(error.message || "Failed to save order stages");
        return { error: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    [stages, onSuccess],
  );

  const handleSubmitWithOrderId = useCallback(() => {
    return handleSubmit(initialOrder);
  }, [handleSubmit, initialOrder]);

  const getSelectedCount = useCallback(
    (groupName) => {
      const groupStages = OrderStages.filter(
        (stage) => stage.group === groupName,
      );
      return groupStages.filter((stage) => stages[stage.value]).length;
    },
    [stages],
  );

  const isGroupAllSelected = useCallback(
    (groupStages) => {
      return groupStages.every((stage) => stages[stage.value]);
    },
    [stages],
  );

  const stats = useMemo(() => {
    const selectedStages = Object.values(stages).filter(Boolean).length;
    const totalStages = OrderStages.length;

    return {
      totalStages,
      selectedStages,
      completionPercentage: Math.round((selectedStages / totalStages) * 100),
      selectedGroups: OrderStages.reduce((acc, stage) => {
        if (!acc[stage.group]) {
          acc[stage.group] = {
            total: 0,
            selected: 0,
          };
        }
        acc[stage.group].total++;
        if (stages[stage.value]) {
          acc[stage.group].selected++;
        }
        return acc;
      }, {}),
    };
  }, [stages]);

  const resetSubmissionState = useCallback(() => {
    setSubmitSuccess(false);
    setError(null);
  }, []);

  return {
    stages,
    setStages,
    isLoading,
    error,
    submitSuccess,
    handleCheckboxChange,
    handleGroupSelectAll,
    handleSelectAll,
    handleClearAll,
    handleSubmit,
    handleSubmitWithOrderId,
    getSelectedCount,
    isGroupAllSelected,
    stats,
    resetSubmissionState,
  };
};

export default useOrderStages;
