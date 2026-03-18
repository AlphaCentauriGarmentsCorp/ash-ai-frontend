import { OrderStages } from "../../../constants/formOptions/orderStages";

export const transformStagesForSubmit = (stages) => {
  return Object.entries(stages)
    .filter(([_, value]) => value)
    .map(([key]) => key);
};

export const formatStagesData = (stages, orderData = null) => {
  const selectedStages = transformStagesForSubmit(stages);
  const selectedCount = selectedStages.length;
  const totalStages = OrderStages.length;

  const stagesByGroup = OrderStages.reduce((acc, stage) => {
    if (!acc[stage.group]) {
      acc[stage.group] = {
        total: 0,
        selected: 0,
        stages: [],
      };
    }
    acc[stage.group].total++;
    if (stages[stage.value]) {
      acc[stage.group].selected++;
      acc[stage.group].stages.push(stage.value);
    }
    return acc;
  }, {});

  return {
    selectedStages,
    selectedCount,
    totalStages,
    completionPercentage: Math.round((selectedCount / totalStages) * 100),
    stagesByGroup,
    ...(orderData && { order: orderData }),
    lastUpdated: new Date().toISOString(),
  };
};

export const validateStages = (stages, requirements = {}) => {
  const selectedStages = transformStagesForSubmit(stages);
  const selectedCount = selectedStages.length;
  const errors = [];

  if (selectedCount === 0) {
    errors.push("At least one stage must be selected");
  }

  if (requirements.requiredStages) {
    requirements.requiredStages.forEach((requiredStage) => {
      if (!stages[requiredStage]) {
        errors.push(`Stage "${requiredStage}" is required`);
      }
    });
  }

  if (requirements.minStages && selectedCount < requirements.minStages) {
    errors.push(`At least ${requirements.minStages} stages must be selected`);
  }

  if (requirements.maxStages && selectedCount > requirements.maxStages) {
    errors.push(
      `No more than ${requirements.maxStages} stages can be selected`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    selectedCount,
    selectedStages,
  };
};

export const getStageDetails = (stageValue) => {
  return OrderStages.find((stage) => stage.value === stageValue) || null;
};

export const getStagesGrouped = () => {
  return OrderStages.reduce((acc, stage) => {
    if (!acc[stage.group]) {
      acc[stage.group] = [];
    }
    acc[stage.group].push(stage);
    return acc;
  }, {});
};

export const isStageInGroup = (stageValue, groupName) => {
  const stage = getStageDetails(stageValue);
  return stage ? stage.group === groupName : false;
};
