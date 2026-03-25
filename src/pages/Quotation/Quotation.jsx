import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";

const Quotation = () => {
  // State for all editable tables (keeping existing state)
  const [tshirtTypes, setTshirtTypes] = useState([
    { id: 1, name: "BOXY", base_price: 350 },
    { id: 2, name: "REGULAR", base_price: 300 },
    { id: 3, name: "OVERSIZED", base_price: 400 },
  ]);

  const [necklines, setNecklines] = useState([
    { id: 1, name: "STANDARD", base_price: 0 },
    { id: 2, name: "CREW NECK", base_price: 10 },
    { id: 3, name: "V-NECK", base_price: 15 },
    { id: 4, name: "TURTLENECK", base_price: 20 },
    { id: 5, name: "MOCK NECK", base_price: 12 },
  ]);

  const [sizes, setSizes] = useState([
    { id: 1, name: "SMALL" },
    { id: 2, name: "MEDIUM" },
    { id: 3, name: "LARGE" },
    { id: 4, name: "XL" },
    { id: 5, name: "2XL" },
    { id: 6, name: "3XL" },
  ]);

  const [sizePrices, setSizePrices] = useState([
    { id: 1, tshirt_type_id: 1, size_id: 1, price: 0 },
    { id: 2, tshirt_type_id: 1, size_id: 2, price: 10 },
    { id: 3, tshirt_type_id: 1, size_id: 3, price: 20 },
    { id: 4, tshirt_type_id: 1, size_id: 4, price: 30 },
    { id: 5, tshirt_type_id: 1, size_id: 5, price: 40 },
    { id: 6, tshirt_type_id: 1, size_id: 6, price: 50 },
    { id: 7, tshirt_type_id: 2, size_id: 1, price: 0 },
    { id: 8, tshirt_type_id: 2, size_id: 2, price: 10 },
    { id: 9, tshirt_type_id: 2, size_id: 3, price: 20 },
    { id: 10, tshirt_type_id: 2, size_id: 4, price: 30 },
    { id: 11, tshirt_type_id: 2, size_id: 5, price: 40 },
    { id: 12, tshirt_type_id: 2, size_id: 6, price: 50 },
    { id: 13, tshirt_type_id: 3, size_id: 1, price: 0 },
    { id: 14, tshirt_type_id: 3, size_id: 2, price: 10 },
    { id: 15, tshirt_type_id: 3, size_id: 3, price: 20 },
    { id: 16, tshirt_type_id: 3, size_id: 4, price: 30 },
    { id: 17, tshirt_type_id: 3, size_id: 5, price: 40 },
    { id: 18, tshirt_type_id: 3, size_id: 6, price: 50 },
  ]);

  const [printTypes, setPrintTypes] = useState([
    { id: 1, name: "SILKSCREEN (WATERBASED)", base_price: 50 },
    { id: 2, name: "SILKSCREEN (PLASTISOL)", base_price: 50 },
    { id: 3, name: "DTG", base_price: 100 },
    { id: 4, name: "EMBROIDERY", base_price: 150 },
  ]);

  const [printColors, setPrintColors] = useState([
    // WATERBASED (id: 1)
    { id: 1, print_type_id: 1, color_count: 1, price: 20 },
    { id: 2, print_type_id: 1, color_count: 2, price: 30 },
    { id: 3, print_type_id: 1, color_count: 3, price: 40 },
    { id: 4, print_type_id: 1, color_count: 4, price: 60 },
    { id: 5, print_type_id: 1, color_count: 5, price: 80 },
    { id: 6, print_type_id: 1, color_count: 6, price: 100 },

    // PLASTISOL (id: 2)
    { id: 7, print_type_id: 2, color_count: 1, price: 30 },
    { id: 8, print_type_id: 2, color_count: 2, price: 50 },
    { id: 9, print_type_id: 2, color_count: 3, price: 70 },
    { id: 10, print_type_id: 2, color_count: 4, price: 90 },
    { id: 11, print_type_id: 2, color_count: 5, price: 110 },
    { id: 12, print_type_id: 2, color_count: 6, price: 130 },

    // DTG (id: 3)
    { id: 13, print_type_id: 3, color_count: 1, price: 10 },
    { id: 14, print_type_id: 3, color_count: 2, price: 20 },
    { id: 15, print_type_id: 3, color_count: 3, price: 30 },
    { id: 16, print_type_id: 3, color_count: 4, price: 40 },
    { id: 17, print_type_id: 3, color_count: 5, price: 50 },
    { id: 18, print_type_id: 3, color_count: 6, price: 60 },

    // EMBROIDERY (id: 4)
    { id: 19, print_type_id: 4, color_count: 1, price: 30 },
    { id: 20, print_type_id: 4, color_count: 2, price: 40 },
    { id: 21, print_type_id: 4, color_count: 3, price: 50 },
    { id: 22, print_type_id: 4, color_count: 4, price: 60 },
    { id: 23, print_type_id: 4, color_count: 5, price: 70 },
    { id: 24, print_type_id: 4, color_count: 6, price: 80 },
  ]);

  const [printPatterns, setPrintPatterns] = useState([
    { id: 1, name: "STANDARD", additional_price: 0 },
    { id: 2, name: "ALL-OVER PRINT", additional_price: 200 },
    { id: 3, name: "SLEEVE PRINT", additional_price: 100 },
    { id: 4, name: "BACK PRINT", additional_price: 150 },
  ]);

  const [addonCategories, setAddonCategories] = useState([
    { id: 1, name: "PACKAGING" },
    { id: 2, name: "LABELING" },
    { id: 3, name: "EMBELLISHMENT" },
    { id: 4, name: "TEST" },
  ]);

  const [addons, setAddons] = useState([
    {
      id: 1,
      category_id: 4,
      name: "STICKERS",
      price_type: "free",
      price: 0,
      is_active: true,
    },
    {
      id: 2,
      category_id: 1,
      name: "PAPER BAG",
      price_type: "per_piece",
      price: 20,
      is_active: true,
    },
    {
      id: 3,
      category_id: 1,
      name: "PLASTIC BAG",
      price_type: "per_piece",
      price: 10,
      is_active: true,
    },
    {
      id: 4,
      category_id: 2,
      name: "CUSTOM HANG TAG",
      price_type: "per_piece",
      price: 15,
      is_active: true,
    },
    {
      id: 5,
      category_id: 2,
      name: "BRAND LABEL",
      price_type: "per_piece",
      price: 25,
      is_active: true,
    },
    {
      id: 6,
      category_id: 3,
      name: "RHINESTONES",
      price_type: "per_piece",
      price: 50,
      is_active: true,
    },
    {
      id: 7,
      category_id: 3,
      name: "SEQUINS",
      price_type: "per_piece",
      price: 45,
      is_active: true,
    },
  ]);

  // Quotation items (selected sizes with quantities)
  const [quotationItems, setQuotationItems] = useState([
    {
      id: 1,
      size_id: 1,
      quantity: 1,
      tshirt_type_id: 1,
      print_type_id: 1,
      print_pattern_id: 1,
      neckline_id: 1,
    },
    {
      id: 2,
      size_id: 2,
      quantity: 1,
      tshirt_type_id: 1,
      print_type_id: 1,
      print_pattern_id: 1,
      neckline_id: 1,
    },
    {
      id: 3,
      size_id: 3,
      quantity: 1,
      tshirt_type_id: 1,
      print_type_id: 1,
      print_pattern_id: 1,
      neckline_id: 1,
    },
    {
      id: 4,
      size_id: 4,
      quantity: 1,
      tshirt_type_id: 1,
      print_type_id: 1,
      print_pattern_id: 1,
      neckline_id: 1,
    },
    {
      id: 5,
      size_id: 5,
      quantity: 1,
      tshirt_type_id: 1,
      print_type_id: 1,
      print_pattern_id: 1,
      neckline_id: 1,
    },
    {
      id: 6,
      size_id: 6,
      quantity: 1,
      tshirt_type_id: 1,
      print_type_id: 1,
      print_pattern_id: 1,
      neckline_id: 1,
    },
  ]);

  // Selected addons (applied to all items)
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [isCostBreakdownOpen, setIsCostBreakdownOpen] = useState(false);

  // Discount state
  const [discount, setDiscount] = useState({
    type: "percentage", // "percentage" or "fixed"
    value: 0,
  });

  const [orderInfo, setOrderInfo] = useState({
    brand: "",
    shirt_color: "",
    free_items: "",
    notes: "",
  });

  const [selectedTshirtType, setSelectedTshirtType] = useState(1);
  const [selectedPrintType, setSelectedPrintType] = useState(1);
  const [selectedPrintPattern, setSelectedPrintPattern] = useState(1);
  const [selectedNeckline, setSelectedNeckline] = useState(1);
  const [selectedColorCount, setSelectedColorCount] = useState(2);

  // Helper functions to get prices
  const getSizePrice = (tshirtTypeId, sizeId) => {
    const priceRecord = sizePrices.find(
      (sp) => sp.tshirt_type_id === tshirtTypeId && sp.size_id === sizeId,
    );
    return priceRecord?.price || 0;
  };

  const getCombinedSizePrice = (tshirtTypeId, sizeId) => {
    const tshirtBasePrice = getTshirtTypeBasePrice(tshirtTypeId);
    const sizePrice = getSizePrice(tshirtTypeId, sizeId);
    return tshirtBasePrice + sizePrice;
  };

  const getPrintColorPrice = (printTypeId, colorCount) => {
    const colorRecord = printColors.find(
      (pc) => pc.print_type_id === printTypeId && pc.color_count === colorCount,
    );
    return colorRecord?.price || 0;
  };

  const getPrintPatternPrice = (patternId) => {
    const pattern = printPatterns.find((p) => p.id === patternId);
    return pattern?.additional_price || 0;
  };

  const getAddonPrice = (addonId) => {
    const addon = addons.find((a) => a.id === addonId);
    return addon?.price_type === "free" ? 0 : addon?.price || 0;
  };

  const getTshirtTypeBasePrice = (tshirtTypeId) => {
    const type = tshirtTypes.find((t) => t.id === tshirtTypeId);
    return type?.base_price || 0;
  };

  const getPrintTypeBasePrice = (printTypeId) => {
    const type = printTypes.find((t) => t.id === printTypeId);
    return type?.base_price || 0;
  };

  const getNecklinePrice = (necklineId) => {
    const neckline = necklines.find((n) => n.id === necklineId);
    return neckline?.base_price || 0;
  };

  // Calculate amount for a single item
  const calculateItemAmount = (item) => {
    const combinedSizePrice = getCombinedSizePrice(
      item.tshirt_type_id,
      item.size_id,
    );
    const printTypeBasePrice = getPrintTypeBasePrice(item.print_type_id);
    const printColorPrice = getPrintColorPrice(
      item.print_type_id,
      selectedColorCount,
    );
    const printPatternPrice = getPrintPatternPrice(item.print_pattern_id);
    const necklinePrice = getNecklinePrice(item.neckline_id);

    const pricePerPiece =
      combinedSizePrice +
      printTypeBasePrice +
      printColorPrice +
      printPatternPrice +
      necklinePrice;
    const total = pricePerPiece * item.quantity;

    return { pricePerPiece, total };
  };

  // Calculate discount amount
  const calculateDiscountAmount = (subtotal) => {
    if (discount.value <= 0) return 0;
    if (discount.type === "percentage") {
      return subtotal * (discount.value / 100);
    }
    return discount.value;
  };

  // Apply selected tshirt type to all items
  const applyTshirtTypeToAll = (tshirtTypeId) => {
    setQuotationItems(
      quotationItems.map((item) => ({ ...item, tshirt_type_id: tshirtTypeId })),
    );
  };

  // Apply selected neckline to all items
  const applyNecklineToAll = (necklineId) => {
    setQuotationItems(
      quotationItems.map((item) => ({ ...item, neckline_id: necklineId })),
    );
  };

  // Apply selected print type to all items
  const applyPrintTypeToAll = (printTypeId) => {
    setQuotationItems(
      quotationItems.map((item) => ({ ...item, print_type_id: printTypeId })),
    );
  };

  // Apply selected print pattern to all items
  const applyPrintPatternToAll = (patternId) => {
    setQuotationItems(
      quotationItems.map((item) => ({ ...item, print_pattern_id: patternId })),
    );
  };

  // Apply selected color count to all items
  const applyColorCountToAll = (colorCount) => {
    setSelectedColorCount(colorCount);
  };

  // Toggle addon selection (applies to all items)
  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId],
    );
  };

  // Calculate addon totals
  const calculateAddonTotals = () => {
    const totalQuantity = quotationItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const addonDetails = selectedAddons.map((addonId) => {
      const addon = addons.find((a) => a.id === addonId);
      const addonPrice = getAddonPrice(addonId);
      const total = addonPrice * totalQuantity;
      return {
        id: addon.id,
        name: addon.name,
        price_per_piece: addonPrice,
        quantity: totalQuantity,
        total: total,
      };
    });

    const totalAddons = addonDetails.reduce(
      (sum, addon) => sum + addon.total,
      0,
    );
    return { addonDetails, totalAddons };
  };

  // Calculate totals
  const totals = quotationItems.reduce(
    (acc, item) => {
      const { pricePerPiece, total } = calculateItemAmount(item);
      return {
        totalAmount: acc.totalAmount + total,
        totalQuantity: acc.totalQuantity + item.quantity,
      };
    },
    { totalAmount: 0, totalQuantity: 0 },
  );

  const { addonDetails, totalAddons } = calculateAddonTotals();

  const subtotal = totals.totalAmount + totalAddons;
  const discountAmount = calculateDiscountAmount(subtotal);
  const grandTotal = subtotal - discountAmount;
  const downPayment = grandTotal * 0.6;
  const balance = grandTotal * 0.4;

  // Add new size item
  const addQuotationItem = () => {
    const newId = Math.max(...quotationItems.map((i) => i.id), 0) + 1;
    setQuotationItems([
      ...quotationItems,
      {
        id: newId,
        size_id: sizes[0]?.id || 1,
        quantity: 1,
        tshirt_type_id: selectedTshirtType,
        print_type_id: selectedPrintType,
        print_pattern_id: selectedPrintPattern,
        neckline_id: selectedNeckline,
      },
    ]);
  };

  // Remove size item
  const removeQuotationItem = (id) => {
    setQuotationItems(quotationItems.filter((item) => item.id !== id));
  };

  // Update item field
  const updateItemField = (id, field, value) => {
    setQuotationItems(
      quotationItems.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      }),
    );
  };

  return (
    <AdminLayout
      pageTitle="Add Quotation"
      path="/quotations"
      links={[
        { label: "Home", href: "/" },
        {
          label: "Quotations",
          href: "/quotation",
          icon: "fa-solid fa-file-invoice",
        },
      ]}
    >
      <section className="flex flex-col gap-y-3 sm:gap-y-4 font-poppins p-3 sm:p-4 max-w-full mx-auto bg-light rounded-lg border border-gray-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-primary flex items-center gap-2">
              <i className="fas fa-file-invoice-dollar"></i>
              Quotation
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Create and manage quotations with editable pricing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-light text-primary px-3 py-1.5 rounded-full">
              <i className="fas fa-calculator mr-1"></i>
              Total: ₱{grandTotal.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Order Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
            <h2 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
              <i className="fas fa-info-circle"></i>
              Order Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3.75">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={orderInfo.client_name}
                  onChange={(e) =>
                    setOrderInfo({ ...orderInfo, client_name: e.target.value })
                  }
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={orderInfo.brand}
                  onChange={(e) =>
                    setOrderInfo({ ...orderInfo, brand: e.target.value })
                  }
                  placeholder="Enter brand name"
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Shirt Color
                </label>
                <input
                  type="text"
                  placeholder="Enter shirt color"
                  value={orderInfo.shirt_color}
                  onChange={(e) =>
                    setOrderInfo({ ...orderInfo, shirt_color: e.target.value })
                  }
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Free Items
                </label>
                <input
                  type="text"
                  value={orderInfo.free_items}
                  placeholder="Enter free items"
                  onChange={(e) =>
                    setOrderInfo({ ...orderInfo, free_items: e.target.value })
                  }
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Global Configuration Dropdowns */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
            <h2 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
              <i className="fas fa-sliders-h"></i>
              Global Configuration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tshirt Type
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedTshirtType}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setSelectedTshirtType(value);
                        applyTshirtTypeToAll(value);
                      }}
                      className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                    >
                      {tshirtTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} (₱{type.base_price})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => applyTshirtTypeToAll(selectedTshirtType)}
                      className="px-2 py-1 bg-light text-primary text-xs rounded-lg hover:bg-light2 transition-colors"
                      title="Apply to all items"
                    >
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Neckline
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedNeckline}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setSelectedNeckline(value);
                        applyNecklineToAll(value);
                      }}
                      className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                    >
                      {necklines.map((neckline) => (
                        <option key={neckline.id} value={neckline.id}>
                          {neckline.name} (₱{neckline.base_price})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => applyNecklineToAll(selectedNeckline)}
                      className="px-2 py-1 bg-light text-primary text-xs rounded-lg hover:bg-light2 transition-colors"
                      title="Apply to all items"
                    >
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Print Type
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedPrintType}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setSelectedPrintType(value);
                      applyPrintTypeToAll(value);
                    }}
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                  >
                    {printTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} (₱{type.base_price})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => applyPrintTypeToAll(selectedPrintType)}
                    className="px-2 py-1 bg-light text-primary text-xs rounded-lg hover:bg-light2 transition-colors"
                    title="Apply to all items"
                  >
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Print Colors
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedColorCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setSelectedColorCount(value);
                      applyColorCountToAll(value);
                    }}
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                  >
                    {printColors
                      .filter((pc) => pc.print_type_id === selectedPrintType)
                      .map((pc) => (
                        <option key={pc.id} value={pc.color_count}>
                          {pc.color_count} color{pc.color_count > 1 ? "s" : ""}{" "}
                          (₱
                          {pc.price})
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => applyColorCountToAll(selectedColorCount)}
                    className="px-2 py-1 bg-light text-primary text-xs rounded-lg hover:bg-light2 transition-colors"
                    title="Apply to all items"
                  >
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Print Pattern
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedPrintPattern}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setSelectedPrintPattern(value);
                      applyPrintPatternToAll(value);
                    }}
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                  >
                    {printPatterns.map((pattern) => (
                      <option key={pattern.id} value={pattern.id}>
                        {pattern.name} (₱{pattern.additional_price})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => applyPrintPatternToAll(selectedPrintPattern)}
                    className="px-2 py-1 bg-light text-primary text-xs rounded-lg hover:bg-light2 transition-colors"
                    title="Apply to all items"
                  >
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quotation Items Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-primary/5 border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <i className="fas fa-tshirt"></i>
              Quotation Items
            </h3>
            <button
              onClick={addQuotationItem}
              className="px-2 py-1 bg-primary text-white text-xs rounded-lg hover:bg-secondary transition-colors flex items-center gap-1"
            >
              <i className="fas fa-plus text-xs"></i>
              Add Size
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-light/50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-2 py-2 text-left">Size</th>
                  <th className="px-2 py-2 text-right w-20">Qty</th>
                  <th className="px-2 py-2 text-right w-20">Size Price</th>
                  <th className="px-2 py-2 text-center w-20">Price/Piece</th>
                  <th className="px-2 py-2 text-center w-20">Amount</th>
                  <th className="px-2 py-2 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotationItems.map((item) => {
                  const { pricePerPiece, total } = calculateItemAmount(item);
                  return (
                    <tr key={item.id} className="hover:bg-light/30">
                      <td className="px-2 py-1.5">
                        <select
                          value={item.size_id}
                          onChange={(e) =>
                            updateItemField(
                              item.id,
                              "size_id",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full px-1 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                        >
                          {sizes.map((size) => (
                            <option key={size.id} value={size.id}>
                              {size.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemField(
                              item.id,
                              "quantity",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-full px-1 py-1 text-xs text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono">
                        ₱
                        {getCombinedSizePrice(
                          item.tshirt_type_id,
                          item.size_id,
                        ).toLocaleString()}
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono">
                        ₱{pricePerPiece.toLocaleString()}
                      </td>
                      <td className="px-2 py-1.5 text-right font-semibold text-primary">
                        ₱{total.toLocaleString()}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <button
                          onClick={() => removeQuotationItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove size"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Addons Section - Simple selection */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-primary/5 border-gray-200">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <i className="fas fa-plus-circle text-xs"></i>
              Addons (Applied to all sizes)
            </h3>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {addonCategories.map((category) => (
                <div key={category.id}>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">
                    {category.name}
                  </h4>
                  <div className="space-y-2">
                    {addons
                      .filter(
                        (a) => a.category_id === category.id && a.is_active,
                      )
                      .map((addon) => (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`w-full p-2 rounded-lg border transition-all text-left ${
                            selectedAddons.includes(addon.id)
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-gray-700 border-gray-200 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium">
                              {addon.name}
                            </span>
                            {selectedAddons.includes(addon.id) && (
                              <i className="fas fa-check-circle text-xs"></i>
                            )}
                          </div>
                          <p className="text-[10px] mt-0.5 opacity-80">
                            {addon.price_type === "free"
                              ? "Free"
                              : `₱${addon.price} per piece`}
                          </p>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cost Breakdown - Collapsible */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setIsCostBreakdownOpen(!isCostBreakdownOpen)}
            className="w-full px-4 py-3 bg-primary/5 border-gray-200 flex justify-between items-center hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <i
                className={`fas fa-chevron-${isCostBreakdownOpen ? "down" : "right"} text-primary text-xs transition-transform`}
              ></i>
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <i className="fas fa-receipt text-xs"></i>
                Cost Breakdown
              </h3>
            </div>
            <span className="text-sm font-bold text-primary">
              ₱{totals.totalAmount.toLocaleString()}
            </span>
          </button>

          {isCostBreakdownOpen && (
            <div className="p-4">
              {/* Size Cost Breakdown Table */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Size Cost Breakdown
                  </h4>
                  <span className="text-[10px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                    {quotationItems.length} size(s) · {totals.totalQuantity}{" "}
                    total pcs
                  </span>
                </div>
                <div className="bg-light/30 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-light/50 border-b border-gray-200">
                      <tr className="text-left">
                        <th className="px-3 py-2">Size</th>
                        <th className="px-3 py-2 text-center">Qty</th>
                        <th className="px-3 py-2 text-center">Tshirt Cost</th>
                        <th className="px-3 py-2 text-center">Neckline</th>
                        <th className="px-3 py-2 text-center">Print Color</th>
                        <th className="px-3 py-2 text-center">Pattern</th>
                        <th className="px-3 py-2 text-center">Print Type</th>
                        <th className="px-3 py-2 text-center">Price/Pc</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {quotationItems.map((item) => {
                        const sizeName = sizes.find(
                          (s) => s.id === item.size_id,
                        )?.name;
                        const { pricePerPiece, total } =
                          calculateItemAmount(item);
                        const combinedSizePrice = getCombinedSizePrice(
                          item.tshirt_type_id,
                          item.size_id,
                        );
                        const printColorPrice = getPrintColorPrice(
                          item.print_type_id,
                          selectedColorCount,
                        );
                        const printPatternPrice = getPrintPatternPrice(
                          item.print_pattern_id,
                        );
                        const printTypeBasePrice = getPrintTypeBasePrice(
                          item.print_type_id,
                        );
                        const necklinePrice = getNecklinePrice(
                          item.neckline_id,
                        );
                        return (
                          <tr key={item.id} className="hover:bg-white/50">
                            <td className="px-3 py-2 font-medium text-primary">
                              {sizeName}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-2 text-center">
                              ₱{combinedSizePrice.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-center">
                              ₱{necklinePrice.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-center">
                              ₱{printColorPrice.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-center">
                              ₱{printPatternPrice.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-center">
                              ₱{printTypeBasePrice.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-center font-semibold">
                              ₱{pricePerPiece.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-primary">
                              ₱{total.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-primary/5 border-t border-gray-200">
                      <tr>
                        <td
                          colSpan="8"
                          className="px-3 py-2 text-right font-semibold text-gray-700"
                        >
                          Subtotal (Sizes)
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-primary">
                          ₱{totals.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Addons Breakdown Table - Separate */}
              {addonDetails.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Addons Breakdown
                    </h4>
                    <span className="text-[10px] text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                      {addonDetails.length} addon(s)
                    </span>
                  </div>
                  <div className="bg-light/30 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-light/50 border-b border-gray-200">
                        <tr className="text-left">
                          <th className="px-3 py-2">Addon</th>
                          <th className="px-3 py-2 text-right">Price/Pc</th>
                          <th className="px-3 py-2 text-right">Quantity</th>
                          <th className="px-3 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {addonDetails.map((addon) => (
                          <tr key={addon.id} className="hover:bg-white/50">
                            <td className="px-3 py-2">
                              <i className="fas fa-tag text-primary/60 mr-2"></i>
                              {addon.name}
                            </td>
                            <td className="px-3 py-2 text-right">
                              ₱{addon.price_per_piece.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {addon.quantity}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-primary">
                              ₱{addon.total.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-primary/5 border-t border-gray-200">
                        <tr>
                          <td
                            colSpan="3"
                            className="px-3 py-2 text-right font-semibold text-gray-700"
                          >
                            Subtotal (Addons)
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-primary">
                            ₱{totalAddons.toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Grand Total */}
              <div className="mt-4 pt-2 border-t-2 border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-primary">
                    GRAND TOTAL
                  </span>
                  <span className="text-xl font-bold text-primary">
                    ₱{(totals.totalAmount + totalAddons).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Discount Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <h2 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
            <i className="fas fa-tag"></i>
            Discount
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Discount Type
              </label>
              <select
                value={discount.type}
                onChange={(e) =>
                  setDiscount({ ...discount, type: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₱)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Discount Value
              </label>
              <input
                type="number"
                min="0"
                step={discount.type === "percentage" ? "1" : "0.01"}
                value={discount.value}
                onChange={(e) =>
                  setDiscount({
                    ...discount,
                    value: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                placeholder={
                  discount.type === "percentage" ? "e.g., 10" : "e.g., 500"
                }
              />
            </div>
            {discount.value > 0 && (
              <div className="flex-1 flex items-end">
                <div className="w-full bg-green-50 rounded-lg p-2 border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-green-700">
                      Discount Applied:
                    </span>
                    <span className="text-sm font-semibold text-green-700">
                      - ₱{discountAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <i className="fas fa-receipt text-xs"></i>
              Payment Summary
            </h3>
          </div>
          <div className="p-4">
            {/* Receipt Style Summary */}
            <div className="space-y-3">
              {/* Subtotal Section */}
              <div className="space-y-2 pb-2 border-b border-dashed border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Subtotal (Sizes)
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    ₱{totals.totalAmount.toLocaleString()}
                  </span>
                </div>
                {totalAddons > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Addons</span>
                    <span className="text-sm font-medium text-gray-700">
                      ₱{totalAddons.toLocaleString()}
                    </span>
                  </div>
                )}

                {discount.value > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Discount (
                      {discount.type === "percentage"
                        ? `${discount.value}%`
                        : "Fixed"}
                      )
                    </span>
                    <span className="text-sm font-medium text-red-600">
                      - ₱{discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Total Amount */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-base font-bold text-primary">TOTAL</span>
                <span className="text-2xl font-bold text-primary">
                  ₱{grandTotal.toLocaleString()}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-300 my-2"></div>

              {/* Payment Breakdown */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                    <span className="text-[11px] text-gray-500">
                      Downpayment (60%)
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    ₱{downPayment.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    <span className="text-[11px] text-gray-500">
                      Balance (40%)
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    ₱{balance.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Terms Note */}
              <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
                  <i className="fas fa-clock"></i>
                  <span>Balance due upon delivery/pickup</span>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="text-center mt-2">
                <div className="inline-flex items-center gap-1 text-[9px] text-gray-400">
                  <i className="fas fa-receipt"></i>
                  <span>Official quotation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
            <i className="fas fa-pencil-alt"></i>
            Notes
          </h2>
          <textarea
            value={orderInfo.notes}
            onChange={(e) =>
              setOrderInfo({ ...orderInfo, notes: e.target.value })
            }
            rows={3}
            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary resize-y"
            placeholder="Additional notes or special instructions..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => {
              setQuotationItems([
                {
                  id: 1,
                  size_id: 1,
                  quantity: 1,
                  tshirt_type_id: 1,
                  print_type_id: 1,
                  print_pattern_id: 1,
                  neckline_id: 1,
                },
                {
                  id: 2,
                  size_id: 2,
                  quantity: 1,
                  tshirt_type_id: 1,
                  print_type_id: 1,
                  print_pattern_id: 1,
                  neckline_id: 1,
                },
                {
                  id: 3,
                  size_id: 3,
                  quantity: 1,
                  tshirt_type_id: 1,
                  print_type_id: 1,
                  print_pattern_id: 1,
                  neckline_id: 1,
                },
                {
                  id: 4,
                  size_id: 4,
                  quantity: 1,
                  tshirt_type_id: 1,
                  print_type_id: 1,
                  print_pattern_id: 1,
                  neckline_id: 1,
                },
                {
                  id: 5,
                  size_id: 5,
                  quantity: 1,
                  tshirt_type_id: 1,
                  print_type_id: 1,
                  print_pattern_id: 1,
                  neckline_id: 1,
                },
                {
                  id: 6,
                  size_id: 6,
                  quantity: 1,
                  tshirt_type_id: 1,
                  print_type_id: 1,
                  print_pattern_id: 1,
                  neckline_id: 1,
                },
              ]);
              setSelectedAddons([]);
              setDiscount({ type: "percentage", value: 0 });
              setOrderInfo({
                brand: "WhiteLies",
                shirt_color: "White and Black",
                free_items: "STICKERS",
                sample_fee: 1000,

                notes: "",
              });
            }}
            className="px-3 py-1.5 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            <i className="fas fa-undo text-gray-400 text-xs"></i>
            Reset
          </button>
          <button className="px-3 py-1.5 rounded-md bg-primary text-white hover:bg-secondary transition-colors text-xs flex items-center gap-1">
            <i className="fas fa-save text-xs"></i>
            Save Quotation
          </button>
        </div>
      </section>
    </AdminLayout>
  );
};

export default Quotation;
