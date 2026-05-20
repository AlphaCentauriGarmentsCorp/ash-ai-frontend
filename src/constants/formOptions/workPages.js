/**
 * ASH AI – Work Pages.
 *
 * "Work pages" are role-specific input UIs rendered inside an Order's
 * "Production" tab. They are DISTINCT from workflow stages:
 *
 *   - A workflow STAGE is a milestone in the 14-step production pipeline
 *     (e.g. "Graphic Artwork", "Sample Creation", "Mass Production").
 *     See constants/formOptions/orderStages.js + backend WorkflowStages.
 *
 *   - A work PAGE is a hands-on screen for a specific role to do their
 *     job (e.g. the Sample Cutter logging fabric used + waste, the Mass
 *     Printer logging ink used + reject photos).
 *
 * Multiple work pages can roll up into a single workflow stage.
 * (e.g. graphic_editing, screen_making, screen_checking → "Graphic Artwork"
 *  + "Screen Making" workflow stages; the sample_* pages → "Sample Creation"
 *  workflow stage; mass_* pages → "Mass Production" workflow stage.)
 *
 * NOTE: in Phase 5 most of these will move to dedicated /portal/* routes.
 * For now they remain accessible inside OrderDetails.
 */
export const WorkPages = [
  // Pre-Sample
  {
    id: "graphic_editing",
    label: "Graphic Editing",
    icon: "fa-pencil-ruler",
    rollupStage: "graphic_artwork",
  },
  {
    id: "screen_making",
    label: "Screen Making",
    icon: "fa-th-large",
    rollupStage: "screen_making",
  },
  {
    id: "screen_checking",
    label: "Screen Checking",
    icon: "fa-eye",
    rollupStage: "screen_making",
  },

  // Sample
  {
    id: "sample_material_preparation",
    label: "Sample Material Preparation",
    icon: "fa-boxes",
    rollupStage: "sample_creation",
  },
  {
    id: "sample_cutting",
    label: "Sample Cutting",
    icon: "fa-scissors",
    rollupStage: "sample_creation",
  },
  {
    id: "sample_printing",
    label: "Sample Printing",
    icon: "fa-print",
    rollupStage: "sample_creation",
  },
  {
    id: "sample_sewing",
    label: "Sample Sewing",
    icon: "fa-hand-sparkles",
    rollupStage: "sample_creation",
  },

  // Mass production
  {
    id: "production_material_preparation",
    label: "Mass Material Preparation",
    icon: "fa-boxes-stacked",
    rollupStage: "mass_production",
  },
  {
    id: "production_cutting",
    label: "Mass Cutting",
    icon: "fa-scissors",
    rollupStage: "mass_production",
  },
  {
    id: "production_printing",
    label: "Mass Printing",
    icon: "fa-print",
    rollupStage: "mass_production",
  },
  {
    id: "production_sewing",
    label: "Mass Sewing",
    icon: "fa-hand-sparkles",
    rollupStage: "mass_production",
  },
  {
    id: "production_quality_assurance",
    label: "QA Check",
    icon: "fa-magnifying-glass",
    rollupStage: "quality_control",
  },
  {
    id: "packing",
    label: "Packing",
    icon: "fa-box",
    rollupStage: "packing",
  },
];

export const findWorkPage = (id) => WorkPages.find((p) => p.id === id) || null;
