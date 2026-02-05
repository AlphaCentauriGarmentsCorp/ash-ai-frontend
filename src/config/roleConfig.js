export const roleColors = {
  admin: "bg-[#000000]",
  general_manager: "bg-[#0078d7]",
  csr: "bg-[#008080]",
  graphic_artist: "bg-[#886ce4]",
  finance: "bg-[#fff100]",
  purchasing: "bg-[#f7630c]",
  cutter: "bg-indigo-500",
  driver: "bg-[#0078d7]",
  printer: "bg-[#1c5079]",
  sewer: "bg-[#16c60c]",
  quality_assurance: "bg-[#e81224]",
  packer: "bg-[#8e562e]",
  warehouse_manager: "bg-[#113f0e]",
  screen_maker: "bg-[#8368dd]",
  sample_maker: "bg-[#e84c5b]",
  subcontract: "bg-[#9c9c9c]",
};

export const roleDisplayNames = {
  admin: "Administrator",
  general_manager: "General Manager",
  csr: "Customer Support",
  graphic_artist: "Graphic Artist",
  finance: "Finance",
  purchasing: "Purchasing",
  cutter: "Cutter",
  driver: "Driver",
  printer: "Printer",
  sewer: "Sewer",
  quality_assurance: "Quality Assurance",
  packer: "Packer",
  warehouse_manager: "Warehouse Manager",
  screen_maker: "Screen Maker",
  sample_maker: "Sample Maker",
  subcontract: "Subcontract",
};

export const allRoles = [
  "admin",
  "general_manager",
  "csr",
  "graphic_artist",
  "finance",
  "purchasing",
  "cutter",
  "driver",
  "printer",
  "sewer",
  "qa",
  "packer",
  "warehouse_manager",
  "screen_maker",
  "sample_maker",
  "subcontract",
];

export const getRoleColor = (role) => {
  return roleColors[role] || "bg-gray-500";
};

export const getRoleDisplayName = (role) => {
  return roleDisplayNames[role] || role?.replace("_", " ") || "User";
};
