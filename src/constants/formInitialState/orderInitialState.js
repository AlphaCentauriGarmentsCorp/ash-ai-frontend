import { options } from "../formOptions/orderOptions";
import { defaultSize } from "../formOptions/orderOptions";

export const orderInitialState = {
  // Order Information
  client: "",
  deadline: "", // will be set dynamically to default +14 days in the component
  company: "",
  brand: "",
  priority: "",

  // Courier Information
  courier: "",
  method: "", // matches your formData name
  receiver_name: "",
  contact_number: "",
  street_address: "",
  province_address: "",
  city_address: "",
  barangay_address: "",
  postal_address: "",

  // Product Details
  design_name: "",
  apparel_type: "",
  pattern_type: "",
  service_type: "",
  print_method: "",
  print_service: "",
  special_print: "",
  print_area: "Regular",
  // Per-method print configuration, mirrors the Quotation form's methodConfig.
  // Used by embroidery / sublimation pricing (wired into the engine in the
  // order pricing task). Silkscreen uses special_print + print_area above.
  print_method_config: {
    embroidery_size: "small",
    embroidery_manual_price: 0,
    sublimation_type: "partial",
    sublimation_manual_price: 0,
  },
  // Per-placement print configuration that feeds the pricing engine.
  // Silkscreen: { part, unitCount, fullUnitCount }. DTF: { part, width,
  // height, pieces }. Empty for embroidery/sublimation (flat/manual).
  print_parts: [],
  size_label: "",
  print_label_placement: "",

  // Fabric Details
  fabric_type: "",
  fabric_supplier: "",
  fabric_color: "",
  same_fabric_color: false,
  thread_color: "",
  ribbing_color: "",

  // Options
  options: "",
  option_color: "",
  livesOnSite: false,
  selectedOptions: [],

  // Sizes (populated dynamically)
  sizes: defaultSize.map((size) => ({
    id: Date.now() + Math.random(),
    name: size.size,
    costPrice: size.cost_price,
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0,
  })),

  // Design Files & Mockups
  design_files: [],
  design_mockup: [],
  size_label_files: [],
  placement_measurements: "",
  notes: "",

  // Freebies
  freebie_items: "",
  freebie_color: "",
  freebie_others: "",
  freebies_files: [],

  // Pricing & Payment Control
  deposit_percentage: 60, 
  remaining_balance: 0,
  payment_plan: "", 
  payment_method: "",
  estimated_total: 0,
  payments: [],

  summary: {
    totalQuantity: 0,
    averageUnitPrice: 0,
    totalAmount: 0,
    totalCost: 0,
  },
};
