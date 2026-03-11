import React, { useState } from "react";
import Input from "../../../components/form/Input";
import Select from "../../../components/form/Select";

const SampleMaterials = ({ order }) => {
  // Track expanded sections
  const [expandedSections, setExpandedSections] = useState({
    fabrics: true,
    rawMaterials: true,
    purchase: true,
  });

  // Extract order data from props
  const orderData = {
    id: order?.po_code,
    quantity: order?.total_quantity,
    garment: order?.apparel_type,
    color: order?.fabric_color,
    sizes: order?.items?.map((item) => item.size) || [],
    estimatedFabric: "250 meters", // This would need to be calculated or come from API
    estimatedThread: "5000 meters", // This would need to be calculated or come from API
  };

  // Calculate quantities per size for display
  const sizeQuantities = order?.items?.reduce((acc, item) => {
    acc[item.size] = (acc[item.size] || 0) + parseInt(item.quantity);
    return acc;
  }, {});

  // Fabrics data (separate)
  const [fabricsInventory] = useState([
    {
      id: 1,
      name: 'Bulacan 20TC 220-230 GSM 36"',
      color: "White",
      dye_type: "Direct Dye",
      resin_type: "Hard Resin",
      variant: "Normal",
      available: 500,
      unit: "meters",
      location: "FAB-A01",
      price: "180.00",
    },
    {
      id: 2,
      name: 'Bulacan 20TC 220-230 GSM 36"',
      color: "White",
      dye_type: "Direct Dye",
      resin_type: "Hard Resin",
      variant: "Ribbings",
      available: 300,
      unit: "meters",
      location: "FAB-A02",
      price: "195.00",
    },
    {
      id: 3,
      name: 'Bulacan 20TC 220-230 GSM 36"',
      color: "Off White",
      dye_type: "Direct Dye",
      resin_type: "Hard Resin",
      variant: "Normal",
      available: 200,
      unit: "meters",
      location: "FAB-A03",
      price: "180.00",
    },
    {
      id: 4,
      name: 'Cotton Jersey 180 GSM 60"',
      color: "Black",
      dye_type: "Reactive Dye",
      resin_type: "Soft Resin",
      variant: "Normal",
      available: 350,
      unit: "meters",
      location: "FAB-B01",
      price: "220.00",
    },
    {
      id: 5,
      name: 'Cotton Jersey 180 GSM 60"',
      color: "White",
      dye_type: "Reactive Dye",
      resin_type: "Soft Resin",
      variant: "Normal",
      available: 280,
      unit: "meters",
      location: "FAB-B02",
      price: "220.00",
    },
    {
      id: 6,
      name: 'Polyester Mesh 150 GSM 58"',
      color: "Black",
      dye_type: "Disperse Dye",
      resin_type: "None",
      variant: "Normal",
      available: 150,
      unit: "meters",
      location: "FAB-C01",
      price: "190.00",
    },
  ]);

  // Raw materials data (threads, tapes, paints, etc.)
  const [rawMaterialsInventory] = useState([
    {
      id: 1,
      supplier_id: 2,
      supplier: {
        id: 2,
        name: "JJ Dela Rosa",
        contact_person: "JJ Dela Rosa",
        contact_number: "09934077117",
      },
      name: "Polyester Thread Black 40/2",
      material_type: "Thread",
      unit: "cones",
      price: "226.00",
      available: 25,
      location: "THR-C01",
      color: "Black",
      weight: "40/2",
      brand: "Gütermann",
    },
    {
      id: 2,
      supplier_id: 2,
      supplier: {
        id: 2,
        name: "JJ Dela Rosa",
        contact_person: "JJ Dela Rosa",
      },
      name: "Cotton Thread White 50/2",
      material_type: "Thread",
      unit: "cones",
      price: "198.00",
      available: 15,
      location: "THR-C02",
      color: "White",
      weight: "50/2",
      brand: "Coats",
    },
    {
      id: 3,
      supplier_id: 3,
      supplier: {
        id: 3,
        name: "3M Philippines",
        contact_person: "John Smith",
      },
      name: 'Heat Transfer Tape 1" x 50m',
      material_type: "Tape",
      unit: "rolls",
      price: "450.00",
      available: 12,
      location: "TPE-D01",
      width: '1"',
      length: "50m",
      brand: "3M",
    },
    {
      id: 4,
      supplier_id: 3,
      supplier: {
        id: 3,
        name: "3M Philippines",
        contact_person: "John Smith",
      },
      name: 'Double Sided Tape 0.5" x 25m',
      material_type: "Tape",
      unit: "rolls",
      price: "120.00",
      available: 8,
      location: "TPE-D02",
      width: '0.5"',
      length: "25m",
      brand: "Tesa",
    },
    {
      id: 5,
      supplier_id: 4,
      supplier: {
        id: 4,
        name: "Wilflex Inks",
        contact_person: "Jane Doe",
      },
      name: "Screen Printing Ink Black",
      material_type: "Paint",
      unit: "gallons",
      price: "850.00",
      available: 5,
      location: "PNT-F01",
      color: "Black",
      type: "Plastisol",
      brand: "Wilflex",
    },
    {
      id: 6,
      supplier_id: 4,
      supplier: {
        id: 4,
        name: "Wilflex Inks",
        contact_person: "Jane Doe",
      },
      name: "Screen Printing Ink White",
      material_type: "Paint",
      unit: "gallons",
      price: "850.00",
      available: 3,
      location: "PNT-F02",
      color: "White",
      type: "Plastisol",
      brand: "Wilflex",
    },
    {
      id: 7,
      supplier_id: 5,
      supplier: {
        id: 5,
        name: "Chromaline",
        contact_person: "Bob Wilson",
      },
      name: "Dual Cure Emulsion",
      material_type: "Other",
      unit: "gallons",
      price: "450.00",
      available: 4,
      location: "OTH-G01",
      brand: "Chromaline",
    },
  ]);

  // Selected materials from inventory
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  // Items to purchase
  const [purchaseItems, setPurchaseItems] = useState([]);

  // New purchase item form
  const [newPurchaseItem, setNewPurchaseItem] = useState({
    category: "fabric",
    name: "",
    description: "",
    quantity: "",
    unit: "meters",
    estimatedCost: "",
    supplier: "",
    priority: "medium",
    notes: "",
  });

  // Search and filter states
  const [fabricSearch, setFabricSearch] = useState("");
  const [rawSearch, setRawSearch] = useState("");
  const [materialTypeFilter, setMaterialTypeFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  // Quick add quantity
  const [quickAddQty, setQuickAddQty] = useState({});

  // Form errors
  const [purchaseErrors, setPurchaseErrors] = useState({});

  // Material type options for filter
  const materialTypeOptions = [
    { value: "all", label: "All Types" },
    {
      value: "Thread",
      label: "Threads",
      icon: <i className="fas fa-thread mr-2"></i>,
    },
    {
      value: "Tape",
      label: "Tapes",
      icon: <i className="fas fa-tape mr-2"></i>,
    },
    {
      value: "Paint",
      label: "Paints & Inks",
      icon: <i className="fas fa-paint-brush mr-2"></i>,
    },
    {
      value: "Other",
      label: "Other",
      icon: <i className="fas fa-cube mr-2"></i>,
    },
  ];

  // Supplier options for filter
  const supplierOptions = [
    {
      value: "all",
      label: "All Suppliers",
      icon: <i className="fas fa-users mr-2"></i>,
    },
    {
      value: "JJ Dela Rosa",
      label: "JJ Dela Rosa",
      icon: <i className="fas fa-user mr-2"></i>,
    },
    {
      value: "3M Philippines",
      label: "3M Philippines",
      icon: <i className="fas fa-building mr-2"></i>,
    },
    {
      value: "Wilflex Inks",
      label: "Wilflex Inks",
      icon: <i className="fas fa-building mr-2"></i>,
    },
    {
      value: "Chromaline",
      label: "Chromaline",
      icon: <i className="fas fa-building mr-2"></i>,
    },
  ];

  // Category options for purchase form
  const purchaseCategoryOptions = [
    {
      value: "fabric",
      label: "Fabric",
      icon: <i className="fas fa-cut mr-2"></i>,
    },
    {
      value: "thread",
      label: "Thread",
      icon: <i className="fas fa-thread mr-2"></i>,
    },
    {
      value: "tape",
      label: "Tape",
      icon: <i className="fas fa-tape mr-2"></i>,
    },
    {
      value: "paint",
      label: "Paint/Ink",
      icon: <i className="fas fa-paint-brush mr-2"></i>,
    },
    {
      value: "other",
      label: "Other",
      icon: <i className="fas fa-cube mr-2"></i>,
    },
  ];

  // Unit options
  const unitOptions = [
    {
      value: "meters",
      label: "Meters",
      icon: <i className="fas fa-ruler mr-2"></i>,
    },
    {
      value: "yards",
      label: "Yards",
      icon: <i className="fas fa-ruler mr-2"></i>,
    },
    {
      value: "cones",
      label: "Cones",
      icon: <i className="fas fa-cone mr-2"></i>,
    },
    {
      value: "rolls",
      label: "Rolls",
      icon: <i className="fas fa-roll mr-2"></i>,
    },
    {
      value: "gallons",
      label: "Gallons",
      icon: <i className="fas fa-flask mr-2"></i>,
    },
    {
      value: "pieces",
      label: "Pieces",
      icon: <i className="fas fa-cube mr-2"></i>,
    },
  ];

  // Priority options
  const priorityOptions = [
    {
      value: "high",
      label: "High",
      icon: <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>,
    },
    {
      value: "medium",
      label: "Medium",
      icon: (
        <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
      ),
    },
    {
      value: "low",
      label: "Low",
      icon: <i className="fas fa-check-circle text-green-500 mr-2"></i>,
    },
  ];

  // Status options
  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      icon: <i className="fas fa-clock text-gray-500 mr-2"></i>,
    },
    {
      value: "ordered",
      label: "Ordered",
      icon: <i className="fas fa-shopping-cart text-blue-500 mr-2"></i>,
    },
    {
      value: "shipped",
      label: "Shipped",
      icon: <i className="fas fa-truck text-purple-500 mr-2"></i>,
    },
    {
      value: "received",
      label: "Received",
      icon: <i className="fas fa-check-circle text-green-500 mr-2"></i>,
    },
  ];

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter fabrics
  const getFilteredFabrics = () => {
    if (!fabricSearch) return fabricsInventory;

    const term = fabricSearch.toLowerCase();
    return fabricsInventory.filter(
      (fabric) =>
        fabric.name.toLowerCase().includes(term) ||
        fabric.color.toLowerCase().includes(term) ||
        fabric.dye_type.toLowerCase().includes(term) ||
        fabric.variant.toLowerCase().includes(term) ||
        fabric.location.toLowerCase().includes(term),
    );
  };

  // Filter raw materials
  const getFilteredRawMaterials = () => {
    let filtered = rawMaterialsInventory;

    // Apply material type filter
    if (materialTypeFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.material_type === materialTypeFilter,
      );
    }

    // Apply supplier filter
    if (supplierFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.supplier?.name === supplierFilter,
      );
    }

    // Apply search
    if (rawSearch) {
      const term = rawSearch.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          (item.supplier?.name &&
            item.supplier.name.toLowerCase().includes(term)) ||
          (item.color && item.color.toLowerCase().includes(term)) ||
          (item.brand && item.brand.toLowerCase().includes(term)) ||
          item.location.toLowerCase().includes(term),
      );
    }

    return filtered;
  };

  // Handle adding item from fabrics
  const handleAddFabricItem = (fabric, quantity) => {
    const qty = quantity || 1;

    // Check if item already selected
    const existingIndex = selectedMaterials.findIndex(
      (s) => s.id === fabric.id && s.source === "fabric",
    );

    if (existingIndex >= 0) {
      // Update existing selection
      const updated = [...selectedMaterials];
      const newQuantity = updated[existingIndex].selectedQuantity + qty;

      if (newQuantity > fabric.available) {
        alert(`⚠️ Only ${fabric.available} ${fabric.unit} available`);
        return;
      }

      updated[existingIndex] = {
        ...updated[existingIndex],
        selectedQuantity: newQuantity,
      };
      setSelectedMaterials(updated);
    } else {
      // Add new selection
      setSelectedMaterials([
        ...selectedMaterials,
        {
          ...fabric,
          source: "fabric",
          selectedQuantity: qty,
          category: "fabric",
        },
      ]);
    }

    // Clear quick add
    setQuickAddQty((prev) => ({ ...prev, [fabric.id]: "" }));
  };

  // Handle adding item from raw materials
  const handleAddRawMaterialItem = (item, quantity) => {
    const qty = quantity || 1;

    // Check if item already selected
    const existingIndex = selectedMaterials.findIndex(
      (s) => s.id === item.id && s.source === "raw",
    );

    if (existingIndex >= 0) {
      // Update existing selection
      const updated = [...selectedMaterials];
      const newQuantity = updated[existingIndex].selectedQuantity + qty;

      if (newQuantity > item.available) {
        alert(`⚠️ Only ${item.available} ${item.unit} available`);
        return;
      }

      updated[existingIndex] = {
        ...updated[existingIndex],
        selectedQuantity: newQuantity,
      };
      setSelectedMaterials(updated);
    } else {
      // Add new selection
      setSelectedMaterials([
        ...selectedMaterials,
        {
          ...item,
          source: "raw",
          selectedQuantity: qty,
          category: item.material_type?.toLowerCase() || "other",
        },
      ]);
    }

    // Clear quick add
    setQuickAddQty((prev) => ({ ...prev, [item.id]: "" }));
  };

  // Remove selected material
  const handleRemoveSelected = (itemId, source) => {
    setSelectedMaterials(
      selectedMaterials.filter(
        (item) => !(item.id === itemId && item.source === source),
      ),
    );
  };

  // Update selected quantity
  const handleUpdateQuantity = (itemId, source, newQuantity) => {
    const item = selectedMaterials.find(
      (i) => i.id === itemId && i.source === source,
    );
    const numQuantity = parseFloat(newQuantity) || 0;

    if (numQuantity > item.available) {
      alert(`⚠️ Only ${item.available} ${item.unit} available`);
      return;
    }

    if (numQuantity <= 0) {
      handleRemoveSelected(itemId, source);
      return;
    }

    setSelectedMaterials(
      selectedMaterials.map((item) =>
        item.id === itemId && item.source === source
          ? { ...item, selectedQuantity: numQuantity }
          : item,
      ),
    );
  };

  // Add purchase item
  const handleAddPurchaseItem = () => {
    // Validate
    const errors = {};
    if (!newPurchaseItem.name) errors.name = "Item name is required";
    if (
      !newPurchaseItem.quantity ||
      parseFloat(newPurchaseItem.quantity) <= 0
    ) {
      errors.quantity = "Please enter a valid quantity";
    }

    if (Object.keys(errors).length > 0) {
      setPurchaseErrors(errors);
      return;
    }

    setPurchaseItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...newPurchaseItem,
        quantity: parseFloat(newPurchaseItem.quantity),
        estimatedCost: newPurchaseItem.estimatedCost
          ? parseFloat(newPurchaseItem.estimatedCost)
          : null,
        status: "pending",
      },
    ]);

    // Reset form
    setNewPurchaseItem({
      category: "fabric",
      name: "",
      description: "",
      quantity: "",
      unit: "meters",
      estimatedCost: "",
      supplier: "",
      priority: "medium",
      notes: "",
    });
    setPurchaseErrors({});
  };

  // Remove purchase item
  const handleRemovePurchaseItem = (id) => {
    setPurchaseItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Update purchase item status
  const handleUpdatePurchaseStatus = (id, status) => {
    setPurchaseItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

  // Get category badge color
  const getCategoryBadge = (category) => {
    const colors = {
      fabric: "bg-blue-100 text-blue-700",
      thread: "bg-green-100 text-green-700",
      tape: "bg-purple-100 text-purple-700",
      paint: "bg-orange-100 text-orange-700",
      other: "bg-gray-100 text-gray-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  // Get material type badge
  const getMaterialTypeBadge = (type) => {
    const colors = {
      Thread: "bg-green-100 text-green-700",
      Tape: "bg-purple-100 text-purple-700",
      Paint: "bg-orange-100 text-orange-700",
      Other: "bg-gray-100 text-gray-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  // Get priority class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get icon for material type
  const getMaterialIcon = (type) => {
    switch (type) {
      case "Thread":
        return <i className="fas fa-thread text-primary"></i>;
      case "Tape":
        return <i className="fas fa-tape text-primary"></i>;
      case "Paint":
        return <i className="fas fa-paint-brush text-primary"></i>;
      default:
        return <i className="fas fa-cube text-primary"></i>;
    }
  };

  return (
    <section className="flex flex-col gap-y-4 sm:gap-y-6 font-poppins">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-xl font-semibold text-primary truncate flex items-center gap-2">
            <i className="fas fa-clipboard-list"></i>
            Material Preparation
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            Select materials from inventory or add items to purchase for order #
            {orderData.id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm text-gray flex items-center shrink-0 bg-light px-3 py-1.5 rounded-full">
            <i className="fas fa-cubes mr-1.5 text-primary"></i>
            {selectedMaterials.length} items selected
          </span>
          <span className="text-xs sm:text-sm text-green-600 flex items-center shrink-0 bg-green-50 px-3 py-1.5 rounded-full">
            <i className="fas fa-shopping-cart mr-1.5"></i>
            {purchaseItems.length} to purchase
          </span>
        </div>
      </div>

      {/* Order Summary Card - Updated to use order.items */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 transition-shadow">
        <h2 className="text-sm sm:text-base font-medium text-primary mb-3 flex items-center gap-2">
          <i className="fas fa-clipboard-list"></i>
          Order Summary
        </h2>

        {/* Main Order Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-light/50 p-3 rounded">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <i className="fas fa-hashtag text-gray-400"></i>
              Order ID
            </p>
            <p className="text-sm font-medium">{orderData.id}</p>
          </div>
          <div className="bg-light/50 p-3 rounded">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <i className="fas fa-cubes text-gray-400"></i>
              Total Quantity
            </p>
            <p className="text-sm font-medium">{orderData.quantity} pcs</p>
          </div>
          <div className="bg-light/50 p-3 rounded">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <i className="fas fa-tshirt text-gray-400"></i>
              Garment
            </p>
            <p className="text-sm font-medium">{orderData.garment}</p>
          </div>
          <div className="bg-light/50 p-3 rounded">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <i className="fas fa-palette text-gray-400"></i>
              Fabric Color
            </p>
            <p className="text-sm font-medium">{orderData.color}</p>
          </div>
        </div>

        {/* Items Breakdown from order.items */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-2">
            <i className="fas fa-list-ul"></i>
            Items Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {order?.items?.map((item) => (
              <div
                key={item.id}
                className="bg-light/50 p-2 rounded-lg border border-gray-100"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {item.sku}
                  </span>
                  <span className="text-xs text-gray-500">
                    Qty: {item.quantity}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-ruler text-gray-400"></i>
                    {item.size}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-palette text-gray-400"></i>
                    {item.color}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estimated Materials (if available from API) */}
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-light/50 p-3 rounded">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <i className="fas fa-cut text-gray-400"></i>
                Est. Fabric
              </p>
              <p className="text-sm font-medium">{orderData.estimatedFabric}</p>
            </div>
            <div className="bg-light/50 p-3 rounded">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <i className="fas fa-thread text-gray-400"></i>
                Est. Thread
              </p>
              <p className="text-sm font-medium">{orderData.estimatedThread}</p>
            </div>
            <div className="bg-light/50 p-3 rounded">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <i className="fas fa-calendar text-gray-400"></i>
                Deadline
              </p>
              <p className="text-sm font-medium">
                {order?.deadline || "Not set"}
              </p>
            </div>
            <div className="bg-light/50 p-3 rounded">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <i className="fas fa-flag text-gray-400"></i>
                Priority
              </p>
              <p className="text-sm font-medium capitalize">
                {order?.priority || "normal"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fabrics Section - Enhanced Search */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden transition-shadow">
        <button
          onClick={() => toggleSection("fabrics")}
          className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-light border-b border-gray-200 hover:bg-light/80 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <i
              className={`fas fa-chevron-${expandedSections.fabrics ? "down" : "right"} text-primary text-sm`}
            ></i>
            <h3 className="text-sm sm:text-base font-medium text-primary flex items-center gap-2">
              <i className="fas fa-cut"></i>
              Fabrics
            </h3>
            <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full flex items-center gap-1">
              <i className="fas fa-check-circle"></i>
              {
                selectedMaterials.filter(
                  (m) => m.category === "fabric" && m.source === "fabric",
                ).length
              }{" "}
              selected
            </span>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <i className="fas fa-boxes"></i>
            {getFilteredFabrics().length} available
          </div>
        </button>

        {expandedSections.fabrics && (
          <div className="p-5 sm:p-6">
            {/* Search Bar */}
            <div className="mb-5">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                <Input
                  label="Search Fabrics"
                  name="fabricSearch"
                  value={fabricSearch}
                  onChange={(e) => setFabricSearch(e.target.value)}
                  placeholder="Search by name, color, dye type, variant, location..."
                  type="text"
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            {/* Fabrics Grid */}
            <div className="space-y-3">
              {getFilteredFabrics().map((fabric) => {
                const selected = selectedMaterials.find(
                  (s) => s.id === fabric.id && s.source === "fabric",
                );
                const quickQty = quickAddQty[fabric.id] || "";

                return (
                  <div
                    key={fabric.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-light rounded-lg border border-gray-200 hover:border-primary/30 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-sm font-semibold text-primary truncate max-w-md">
                          {fabric.name}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                          <i className="fas fa-palette text-xs"></i>
                          {fabric.color}
                        </span>
                        {fabric.variant && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                            <i className="fas fa-tag"></i>
                            {fabric.variant}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-flask text-gray-400"></i>
                          {fabric.dye_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-cog text-gray-400"></i>
                          {fabric.resin_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-map-marker-alt text-gray-400"></i>
                          {fabric.location}
                        </span>
                        {fabric.price && (
                          <span className="flex items-center gap-1 text-green-600">
                            <i className="fas fa-tag"></i>₱{fabric.price}/
                            {fabric.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                        <i className="fas fa-boxes text-gray-400 text-xs"></i>
                        <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                          {fabric.available} {fabric.unit}
                        </span>
                      </div>

                      {selected ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-20">
                            <Input
                              label=""
                              type="number"
                              value={selected.selectedQuantity}
                              onChange={(e) =>
                                handleUpdateQuantity(
                                  fabric.id,
                                  "fabric",
                                  e.target.value,
                                )
                              }
                              min="0"
                              max={fabric.available}
                              step="0.1"
                              placeholder="Qty"
                              className="text-xs h-8"
                            />
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveSelected(fabric.id, "fabric")
                            }
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <i className="fas fa-trash-alt text-xs"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="w-16">
                            <Input
                              label=""
                              type="number"
                              value={quickQty}
                              onChange={(e) =>
                                setQuickAddQty((prev) => ({
                                  ...prev,
                                  [fabric.id]: e.target.value,
                                }))
                              }
                              min="0"
                              max={fabric.available}
                              step="0.1"
                              placeholder="Qty"
                              className="text-xs h-8"
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && quickQty) {
                                  handleAddFabricItem(
                                    fabric,
                                    parseFloat(quickQty),
                                  );
                                }
                              }}
                            />
                          </div>
                          <button
                            onClick={() =>
                              handleAddFabricItem(
                                fabric,
                                quickQty ? parseFloat(quickQty) : 1,
                              )
                            }
                            className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-secondary transition-colors flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <i className="fas fa-plus"></i>
                            <span>Add</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {getFilteredFabrics().length === 0 && (
                <div className="text-center py-10 bg-light/50 rounded-lg">
                  <i className="fas fa-search text-3xl text-gray-300 mb-2"></i>
                  <p className="text-sm text-gray-500">
                    No fabrics found matching your search
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Raw Materials Section - Optimized */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden transition-shadow">
        <button
          onClick={() => toggleSection("rawMaterials")}
          className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-light border-b border-gray-200 hover:bg-light/80 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <i
              className={`fas fa-chevron-${expandedSections.rawMaterials ? "down" : "right"} text-primary text-sm`}
            ></i>
            <h3 className="text-sm sm:text-base font-medium text-primary flex items-center gap-2">
              <i className="fas fa-cubes"></i>
              Raw Materials
            </h3>
            <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full flex items-center gap-1">
              <i className="fas fa-check-circle"></i>
              {selectedMaterials.filter((m) => m.source === "raw").length}{" "}
              selected
            </span>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <i className="fas fa-boxes"></i>
            {getFilteredRawMaterials().length} available
          </div>
        </button>

        {expandedSections.rawMaterials && (
          <div className="p-5 sm:p-6">
            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                <Input
                  label=""
                  name="rawSearch"
                  value={rawSearch}
                  onChange={(e) => setRawSearch(e.target.value)}
                  placeholder="Search by name, supplier, color, brand..."
                  type="text"
                  className="pl-10 text-sm"
                />
              </div>

              <Select
                label=""
                name="materialTypeFilter"
                options={materialTypeOptions}
                value={materialTypeFilter}
                onChange={(e) => setMaterialTypeFilter(e.target.value)}
                placeholder="Filter by type"
                className="text-sm"
              />

              <Select
                label=""
                name="supplierFilter"
                options={supplierOptions}
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                placeholder="Filter by supplier"
                className="text-sm"
              />
            </div>

            {/* Materials Grid */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {getFilteredRawMaterials().map((item) => {
                const selected = selectedMaterials.find(
                  (s) => s.id === item.id && s.source === "raw",
                );
                const quickQty = quickAddQty[item.id] || "";

                return (
                  <div
                    key={item.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-light rounded-lg border border-gray-200 hover:border-primary/30 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-sm font-semibold text-primary flex items-center gap-1.5 truncate max-w-md">
                          {item.material_type === "Thread" && (
                            <i className="fas fa-thread text-primary text-xs"></i>
                          )}
                          {item.material_type === "Tape" && (
                            <i className="fas fa-tape text-primary text-xs"></i>
                          )}
                          {item.material_type === "Paint" && (
                            <i className="fas fa-paint-brush text-primary text-xs"></i>
                          )}
                          {item.material_type === "Other" && (
                            <i className="fas fa-cube text-primary text-xs"></i>
                          )}
                          <span className="truncate">{item.name}</span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${getMaterialTypeBadge(item.material_type)}`}
                        >
                          {item.material_type}
                        </span>
                        {item.color && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1">
                            <i className="fas fa-palette"></i>
                            {item.color}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-truck text-gray-400"></i>
                          {item.supplier?.name || "No supplier"}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-map-marker-alt text-gray-400"></i>
                          {item.location}
                        </span>
                        {item.weight && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-weight-hanging text-gray-400"></i>
                            {item.weight}
                          </span>
                        )}
                        {item.width && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-arrows-alt-h text-gray-400"></i>
                            {item.width}
                          </span>
                        )}
                        {item.price && (
                          <span className="flex items-center gap-1 text-green-600">
                            <i className="fas fa-tag"></i>₱{item.price}/
                            {item.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                        <i className="fas fa-boxes text-gray-400 text-xs"></i>
                        <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                          {item.available} {item.unit}
                        </span>
                      </div>

                      {selected ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-20">
                            <Input
                              label=""
                              type="number"
                              value={selected.selectedQuantity}
                              onChange={(e) =>
                                handleUpdateQuantity(
                                  item.id,
                                  "raw",
                                  e.target.value,
                                )
                              }
                              min="0"
                              max={item.available}
                              step="0.1"
                              placeholder="Qty"
                              className="text-xs h-8"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveSelected(item.id, "raw")}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <i className="fas fa-trash-alt text-xs"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="">
                            <Input
                              label=""
                              type="number"
                              value={quickQty}
                              onChange={(e) =>
                                setQuickAddQty((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                              min="0"
                              max={item.available}
                              step="0.1"
                              placeholder="0"
                              className="text-xs h-8"
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && quickQty) {
                                  handleAddRawMaterialItem(
                                    item,
                                    parseFloat(quickQty),
                                  );
                                }
                              }}
                            />
                          </div>
                          <button
                            onClick={() =>
                              handleAddRawMaterialItem(
                                item,
                                quickQty ? parseFloat(quickQty) : 1,
                              )
                            }
                            className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-secondary transition-colors flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <i className="fas fa-plus"></i>
                            <span>Add</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {getFilteredRawMaterials().length === 0 && (
                <div className="text-center py-10 bg-light/50 rounded-lg">
                  <i className="fas fa-search text-3xl text-gray-300 mb-2"></i>
                  <p className="text-sm text-gray-500">
                    No raw materials found matching your filters
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Items to Purchase Section */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden transition-shadow">
        <button
          onClick={() => toggleSection("purchase")}
          className="w-full px-5 sm:px-6 py-3.5 sm:py-4 bg-light border-b border-gray-200 hover:bg-light/80 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <i
              className={`fas fa-chevron-${expandedSections.purchase ? "down" : "right"} text-primary text-sm`}
            ></i>
            <h2 className="text-sm sm:text-base font-medium text-primary flex items-center gap-2">
              <i className="fas fa-shopping-cart"></i>
              Items to Purchase
            </h2>
            <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full flex items-center gap-1">
              <i className="fas fa-box"></i>
              {purchaseItems.length} items
            </span>
          </div>
        </button>

        {expandedSections.purchase && (
          <div className="p-5 sm:p-6">
            {/* Add New Purchase Item Form */}
            <div className="mb-5 p-4 bg-light rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                <i className="fas fa-plus-circle text-primary"></i>
                Add Item to Purchase
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select
                  label="Category"
                  name="category"
                  options={purchaseCategoryOptions}
                  value={newPurchaseItem.category}
                  onChange={(e) =>
                    setNewPurchaseItem({
                      ...newPurchaseItem,
                      category: e.target.value,
                    })
                  }
                />

                <Input
                  label="Item Name *"
                  name="name"
                  value={newPurchaseItem.name}
                  onChange={(e) =>
                    setNewPurchaseItem({
                      ...newPurchaseItem,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g., Black Cotton Jersey"
                  error={purchaseErrors.name}
                  className="text-sm"
                />

                <Input
                  label="Description"
                  name="description"
                  value={newPurchaseItem.description}
                  onChange={(e) =>
                    setNewPurchaseItem({
                      ...newPurchaseItem,
                      description: e.target.value,
                    })
                  }
                  placeholder="e.g., 100% Cotton, 60\ width"
                  className="text-sm"
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Quantity *"
                    name="quantity"
                    type="number"
                    value={newPurchaseItem.quantity}
                    onChange={(e) =>
                      setNewPurchaseItem({
                        ...newPurchaseItem,
                        quantity: e.target.value,
                      })
                    }
                    placeholder="0"
                    min="0"
                    step="0.1"
                    error={purchaseErrors.quantity}
                    className="text-sm"
                  />

                  <Select
                    label="Unit"
                    name="unit"
                    options={unitOptions}
                    value={newPurchaseItem.unit}
                    onChange={(e) =>
                      setNewPurchaseItem({
                        ...newPurchaseItem,
                        unit: e.target.value,
                      })
                    }
                  />
                </div>

                <Input
                  label="Est. Cost (per unit)"
                  name="estimatedCost"
                  type="number"
                  value={newPurchaseItem.estimatedCost}
                  onChange={(e) =>
                    setNewPurchaseItem({
                      ...newPurchaseItem,
                      estimatedCost: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="text-sm"
                />

                <Input
                  label="Supplier"
                  name="supplier"
                  value={newPurchaseItem.supplier}
                  onChange={(e) =>
                    setNewPurchaseItem({
                      ...newPurchaseItem,
                      supplier: e.target.value,
                    })
                  }
                  placeholder="Supplier name"
                  className="text-sm"
                />

                <Select
                  label="Priority"
                  name="priority"
                  options={priorityOptions}
                  value={newPurchaseItem.priority}
                  onChange={(e) =>
                    setNewPurchaseItem({
                      ...newPurchaseItem,
                      priority: e.target.value,
                    })
                  }
                />

                <div className="lg:col-span-3">
                  <Input
                    label="Notes"
                    name="notes"
                    value={newPurchaseItem.notes}
                    onChange={(e) =>
                      setNewPurchaseItem({
                        ...newPurchaseItem,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Additional notes..."
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleAddPurchaseItem}
                  disabled={!newPurchaseItem.name || !newPurchaseItem.quantity}
                  className={`px-4 py-2 rounded-md text-sm flex items-center gap-2 ${
                    newPurchaseItem.name && newPurchaseItem.quantity
                      ? "bg-primary text-white hover:bg-secondary"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <i className="fas fa-plus"></i>
                  Add to Purchase List
                </button>
              </div>
            </div>

            {/* Purchase Items List */}
            {purchaseItems.length > 0 ? (
              <div className="space-y-2">
                {purchaseItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-light rounded-lg border border-gray-200 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-primary">
                          {item.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${getPriorityClass(item.priority)} flex items-center gap-1`}
                        >
                          {item.priority === "high" && (
                            <i className="fas fa-exclamation-circle"></i>
                          )}
                          {item.priority === "medium" && (
                            <i className="fas fa-exclamation-triangle"></i>
                          )}
                          {item.priority === "low" && (
                            <i className="fas fa-check-circle"></i>
                          )}
                          {item.priority}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${getCategoryBadge(item.category)} flex items-center gap-1`}
                        >
                          {item.category === "fabric" && (
                            <i className="fas fa-cut"></i>
                          )}
                          {item.category === "thread" && (
                            <i className="fas fa-thread"></i>
                          )}
                          {item.category === "tape" && (
                            <i className="fas fa-tape"></i>
                          )}
                          {item.category === "paint" && (
                            <i className="fas fa-paint-brush"></i>
                          )}
                          {item.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-cubes"></i>
                          Qty: {item.quantity} {item.unit}
                        </span>
                        {item.supplier && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-truck"></i>
                            {item.supplier}
                          </span>
                        )}
                        {item.estimatedCost && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-tag"></i>₱{item.estimatedCost}/
                            {item.unit}
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-xs text-gray-400 mt-1 italic flex items-center gap-1">
                          <i className="fas fa-pencil-alt"></i>
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        label=""
                        name="status"
                        options={statusOptions}
                        value={item.status}
                        onChange={(e) =>
                          handleUpdatePurchaseStatus(item.id, e.target.value)
                        }
                        className="w-28 text-xs"
                      />

                      <button
                        onClick={() => handleRemovePurchaseItem(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-light/50 rounded-lg">
                <i className="fas fa-shopping-cart text-3xl text-gray-300 mb-2"></i>
                <p className="text-sm text-gray-500">No items to purchase</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Materials Summary */}
      {selectedMaterials.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden transition-shadow">
          <div className="px-5 sm:px-6 py-3 bg-light border-b border-gray-200">
            <h2 className="text-sm font-medium text-primary flex items-center gap-2">
              <i className="fas fa-check-circle"></i>
              Selected Materials Summary
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedMaterials.map((item) => (
                <div
                  key={`${item.source}-${item.id}`}
                  className="flex items-center justify-between p-2 bg-light rounded-lg border border-gray-200 hover:border-primary/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-primary truncate flex items-center gap-1">
                        {item.source === "fabric" ? (
                          <i className="fas fa-cut"></i>
                        ) : (
                          getMaterialIcon(item.material_type)
                        )}
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] ${getCategoryBadge(item.category)}`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <i className="fas fa-cubes"></i>
                        {item.selectedQuantity} {item.unit}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fas fa-map-marker-alt"></i>
                        {item.location}
                      </span>
                      {item.supplier?.name && (
                        <span className="flex items-center gap-1">
                          <i className="fas fa-truck"></i>
                          {item.supplier.name}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveSelected(item.id, item.source)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                    title="Remove"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button className="px-4 py-2 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
          <i className="fas fa-save text-gray-400"></i>
          Save Draft
        </button>
        <button className="px-4 py-2 rounded-md bg-primary text-white hover:bg-secondary transition-colors text-sm flex items-center gap-2">
          <i className="fas fa-check"></i>
          Submit Material Request
        </button>
      </div>
    </section>
  );
};

export default SampleMaterials;
