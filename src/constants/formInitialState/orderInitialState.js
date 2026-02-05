import { options } from "../formOptions/orderOptions";

export const orderInitialState = {
  // Order Information
  client: "",
  deadline: "",
  company: "",
  brand: "",
  priority: "",

  // Courier Information
  courier: "",
  shipping_method: "",
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
  size_label: "",
  print_label_placement: "",

  // Fabric Details
  fabric_type: "",
  fabric_supplier: "",
  fabric_color: "",
  same_fabric_color: false,
  thread_color: "",
  ribbing_color: "",

  // Options (for the Add Options section)
  options: "",
  option_color: "",
  livesOnSite: false,
  selectedOptions: [],

  // Sizes (will be populated dynamically)
  sizes: [],

  // Design Files & Mockups
  design_files: [],
  design_mockup: [],
  placement_measurements: "",
  notes: "",

  // Freebies
  freebie_items: "",
  freebie_color: "",
  freebie_others: "",

  // Pricing & Payment Control
  deposit_percentage: "",
  payment_method: "",
  estimated_total: "",
  payments: [],

  // Summary (will be calculated)
  summary: {
    totalQuantity: 0,
    averageUnitPrice: 0,
    totalAmount: 0,
    totalCost: 0,
  },
};
