export const OrderStages = [
  // Pre-Production Stages
  {
    group: "Pre-Production",
    value: "graphic_editing",
    label: "Graphic Editing",
  },
  {
    group: "Pre-Production",
    value: "screen_making",
    label: "Screen Making",
  },
  {
    group: "Pre-Production",
    value: "screen_checking",
    label: "Screen Checking",
  },

  // Sample Production Stages
  {
    group: "Sample Production",
    value: "sample_material_preparation",
    label: "Sample Material Preparation",
  },
  {
    group: "Sample Production",
    value: "sample_material_receiving",
    label: "Sample Material Receiving",
  },
  {
    group: "Sample Production",
    value: "sample_cutting",
    label: "Sample Cutting",
  },
  {
    group: "Sample Production",
    value: "sample_printing",
    label: "Sample Printing",
  },
  {
    group: "Sample Production",
    value: "sample_sewing",
    label: "Sample Sewing",
  },
  {
    group: "Sample Production",
    value: "sample_quality_assurance",
    label: "Sample Quality Assurance",
  },
  {
    group: "Sample Production",
    value: "sample_approval",
    label: "Sample Approval",
  },

  // Stages
  {
    group: "Mass Production",
    value: "production_material_preparation",
    label: "Material Preparation",
  },
  {
    group: "Mass Production",
    value: "production_material_receiving",
    label: "Material Receiving",
  },
  {
    group: "Mass Production",
    value: "production_cutting",
    label: "Material Cutting",
  },
  {
    group: "Mass Production",
    value: "production_printing",
    label: "Printing",
  },
  {
    group: "Mass Production",
    value: "production_sewing",
    label: "Sewing",
  },
  {
    group: "Mass Production",
    value: "production_revision",
    label: "Revision",
  },
  {
    group: "Mass Production",
    value: "production_quality_assurance",
    label: "Quality Assurance",
  },

  // Delivery Stage
  {
    group: "Delivery",
    value: "delivery",
    label: "Delivery",
  },
];

// Helper function to get stages by group
export const getStagesByGroup = (group) => {
  return OrderStages.filter((stage) => stage.group === group);
};

// Get all unique groups
export const getStageGroups = () => {
  return [...new Set(OrderStages.map((stage) => stage.group))];
};
