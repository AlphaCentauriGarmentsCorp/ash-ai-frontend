export const quotationClientInitialState = {
  // Step 1: Front and Back
  hasFrontDesign: false,
  hasBackDesign: false,
  frontDesignFile: null,
  backDesignFile: null,
  frontDesignNotes: "",
  backDesignNotes: "",

  // Step 2: Designs
  designType: "", // "upload" or "template"
  uploadedDesigns: [],
  selectedTemplate: null,
  designNotes: "",

  // Step 3: Colors
  tshirtColor: "",
  printColors: [],
  colorCount: 1,
  colorNotes: "",

  // Client Information
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  clientCompany: "",

  // Additional Notes
  additionalNotes: "",
  urgency: "normal", // "normal", "urgent", "rush"
  preferredDeliveryDate: "",
};
