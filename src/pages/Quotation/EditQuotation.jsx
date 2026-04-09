import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { quotationService } from "../../services/quotationService";
import { quotationApi } from "../../api/quotationApi";

const EditQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [isCostBreakdownOpen, setIsCostBreakdownOpen] = useState(false);
  const [colorCount, setColorCount] = useState(null);
  const [discount, setDiscount] = useState({ type: "percentage", value: 0 });

  // Selected IDs for global config
  const [selectedTshirtType, setSelectedTshirtType] = useState(null);
  const [selectedPrintType, setSelectedPrintType] = useState(null);
  const [selectedPrintPattern, setSelectedPrintPattern] = useState(null);
  const [selectedNeckline, setSelectedNeckline] = useState(null);

  const [formData, setOrderInfo] = useState({
    client_name: "",
    client_email: "",
    brand: "",
    shirt_color: "",
    free_items: "",
    notes: "",
  });

  // Fetch all data and quotation on mount
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch both master data and quotation data
      const [quotationData, masterData] = await Promise.all([
        quotationApi.show(id),
        quotationService.fetchAll(),
      ]);
      
      setData(masterData);
      
      // Populate form with existing quotation data
      const quotation = quotationData.data || quotationData;
      setOrderInfo({
        client_name: quotation.client_name || "",
        client_email: quotation.client_email || "",
        brand: quotation.client_brand || "",
        shirt_color: quotation.shirt_color || "",
        free_items: quotation.free_items || "",
        notes: quotation.notes || "",
      });
      
      // Set discount
      setDiscount({
        type: quotation.discount_type || "percentage",
        value: quotation.discount_price || 0,
      });
      
      // Parse and set items
      let parsedItems = [];
      let parsedAddons = [];
      
      if (quotation.items_json && typeof quotation.items_json === 'string') {
        parsedItems = JSON.parse(quotation.items_json);
      } else if (quotation.items) {
        parsedItems = quotation.items;
      }
      
      if (quotation.addons_json && typeof quotation.addons_json === 'string') {
        parsedAddons = JSON.parse(quotation.addons_json);
      } else if (quotation.addons) {
        parsedAddons = quotation.addons;
      }
      
      // Convert items to internal format
      const internalItems = parsedItems.map((item, index) => ({
        id: index + 1,
        size_id: item.size_id,
        quantity: item.quantity,
        tshirt_type_id: item.tshirt_type_id,
        print_type_id: item.print_type_id,
        print_pattern_id: item.print_pattern_id,
        neckline_id: item.neckline_id,
      }));
      
      setItems(internalItems);
      
      // Extract configuration from first item if exists
      if (internalItems.length > 0) {
        const firstItem = internalItems[0];
        setSelectedTshirtType(firstItem.tshirt_type_id);
        setSelectedPrintType(firstItem.print_type_id);
        setSelectedPrintPattern(firstItem.print_pattern_id);
        setSelectedNeckline(firstItem.neckline_id);
      }
      
      // Set selected addons
      const addonIds = parsedAddons.map(addon => {
        const found = masterData.addons?.find(a => a.name === addon.name);
        return found?.id;
      }).filter(id => id);
      
      setSelectedAddons(addonIds);
      
      // Try to determine color count from breakdown or first item
      if (quotation.breakdown_json) {
        let breakdown = quotation.breakdown_json;
        if (typeof breakdown === 'string') {
          breakdown = JSON.parse(breakdown);
        }
        if (breakdown.items && breakdown.items.length > 0) {
          const printColorPrice = breakdown.items[0].print_color_price;
          // Try to find matching color count
          if (masterData.printColors && selectedPrintType) {
            const matchingColor = masterData.printColors.find(
              pc => pc.print_type_id === selectedPrintType && pc.price === printColorPrice
            );
            if (matchingColor) {
              setColorCount(matchingColor.color_count);
            }
          }
        }
      }
      
      // If color count still not set, set default
      if (!colorCount && selectedPrintType && masterData.printColors) {
        const colors = quotationService.getColorOptions(masterData.printColors, selectedPrintType);
        if (colors.length > 0) {
          setColorCount(colors[0].color_count);
        }
      }
      
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Failed to load quotation data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate all totals when dependencies change
  const { itemDetails, addonDetails, totalAmount, totalAddons, totalQuantity } =
    data && items.length > 0
      ? quotationService.calculateTotals(
          data,
          items,
          colorCount || 1,
          selectedAddons,
        )
      : {
          itemDetails: [],
          addonDetails: [],
          totalAmount: 0,
          totalAddons: 0,
          totalQuantity: 0,
        };

  const subtotal = totalAmount + totalAddons;
  const discountAmount = quotationService.applyDiscount(subtotal, discount);
  const grandTotal = subtotal - discountAmount;
  const downPayment = grandTotal * 0.6;
  const balance = grandTotal * 0.4;

  // Apply global configurations to all items
  const applyToAll = (field, value) => {
    if (value === null) return;
    setItems(items.map((item) => ({ ...item, [field]: value })));
  };

  const handleTshirtTypeChange = (value) => {
    setSelectedTshirtType(value);
    if (items.length > 0) {
      applyToAll("tshirt_type_id", value);
    }
  };

  const handleNecklineChange = (value) => {
    setSelectedNeckline(value);
    if (items.length > 0) {
      applyToAll("neckline_id", value);
    }
  };

  const handlePrintTypeChange = (value) => {
    setSelectedPrintType(value);
    if (items.length > 0) {
      applyToAll("print_type_id", value);
    }
    // Reset color count to first available
    if (value !== null && data?.printColors) {
      const colors = quotationService.getColorOptions(data.printColors, value);
      if (colors.length > 0) {
        setColorCount(colors[0].color_count);
      }
    }
  };

  const handlePrintPatternChange = (value) => {
    setSelectedPrintPattern(value);
    if (items.length > 0) {
      applyToAll("print_pattern_id", value);
    }
  };

  const handleColorCountChange = (value) => {
    setColorCount(value);
  };

  // Item management
  const addItem = () => {
    if (
      selectedTshirtType === null ||
      selectedPrintType === null ||
      selectedPrintPattern === null ||
      selectedNeckline === null ||
      colorCount === null
    ) {
      alert("Please select all configuration options first");
      return;
    }
    const newId = Math.max(...items.map((i) => i.id), 0) + 1;
    setItems([
      ...items,
      {
        id: newId,
        size_id: data.sizes[0]?.id || 1,
        quantity: 1,
        tshirt_type_id: selectedTshirtType,
        print_type_id: selectedPrintType,
        print_pattern_id: selectedPrintPattern,
        neckline_id: selectedNeckline,
      },
    ]);
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  // Addon management
  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId],
    );
  };

  const formattedItems = items.map((item) => {
    const { pricePerPiece, total } = quotationService.calculateItem(
      data,
      item,
      colorCount || 1,
    );

    return {
      id: item.id,
      size_id: item.size_id,
      quantity: item.quantity,
      tshirt_type_id: item.tshirt_type_id,
      print_type_id: item.print_type_id,
      print_pattern_id: item.print_pattern_id,
      neckline_id: item.neckline_id,
      
      tshirt_type: data.tshirtTypes.find(t => t.id === item.tshirt_type_id)?.name || null,
      neckline: data.necklines.find(n => n.id === item.neckline_id)?.name || null,
      print_type: data.printTypes.find(p => p.id === item.print_type_id)?.name || null,
      print_pattern: data.printPatterns.find(p => p.id === item.print_pattern_id)?.name || null,
      size: data.sizes.find(s => s.id === item.size_id)?.name || null,
      
      price_per_piece: pricePerPiece,
      total_amount: total,
    };
  });

  const breakdown = {
    items: itemDetails.map((item) => {
      const sizeName = data.sizes.find((s) => s.id === item.size_id)?.name || "Unknown";
      return {
        size: sizeName,
        quantity: item.quantity,
        price_per_piece: item.pricePerPiece,
        total: item.total,
        tshirt_price: quotationService.getTshirtPrice(data.tshirtTypes, item.tshirt_type_id),
        size_price: quotationService.getSizePrice(data.sizePrices, item.tshirt_type_id, item.size_id),
        neckline_price: quotationService.getNecklinePrice(data.necklines, item.neckline_id),
        print_type_price: quotationService.getPrintTypePrice(data.printTypes, item.print_type_id),
        print_color_price: quotationService.getPrintColorPrice(data.printColors, item.print_type_id, colorCount || 1),
        print_pattern_price: quotationService.getPrintPatternPrice(data.printPatterns, item.print_pattern_id),
      };
    }),
  };

  const formattedAddons = selectedAddons.map((id) => {
    const addon = data.addons.find((a) => a.id === id);
    return {
      name: addon?.name || "Unknown",
      price: addon?.price_type === "Free" ? 0 : quotationService.toNumber(addon?.price),
    };
  });

  const handleUpdate = async () => {
    if (
      selectedTshirtType === null ||
      selectedPrintType === null ||
      selectedPrintPattern === null ||
      selectedNeckline === null
    ) {
      alert("Please select all configuration options");
      return;
    }
    
    setSaving(true);
    
    const quotationData = {
      client_name: formData.client_name,
      client_email: formData.client_email,
      client_brand: formData.brand,
      shirt_color: formData.shirt_color,
      free_items: formData.free_items,
      notes: formData.notes,
      items_json: formattedItems,
      addons_json: formattedAddons,
      discount_type: discount.type,
      discount_price: discount.value,
      subtotal,
      breakdown_json: breakdown,
      grand_total: grandTotal,
    };

    try {
    await quotationApi.update(id, quotationData);
      navigate("/quotations");
    } catch (error) {
        console.error("Error saving quotation:", error);
        alert("An error occurred while saving the quotation. Please try again.");
    } finally {
        setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Edit Quotation">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-600 text-sm font-medium">
              Loading quotation data...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  const colorOptions = selectedPrintType
    ? quotationService.getColorOptions(data.printColors, selectedPrintType)
    : [];

  const hasSelections =
    selectedTshirtType !== null &&
    selectedPrintType !== null &&
    selectedPrintPattern !== null &&
    selectedNeckline !== null &&
    colorCount !== null;

  return (
    <AdminLayout
      pageTitle="Edit Quotation"
      path="/quotations"
      links={[
        { label: "Home", href: "/" },
        {
          label: "Quotations",
          href: "/quotations",
          icon: "fa-solid fa-file-invoice-dollar",
        },
        {
          label: `Edit #${id}`,
          href: "#",
        },
      ]}
    >
      <section className="flex flex-col gap-y-3 sm:gap-y-4 font-poppins p-3 sm:p-4 max-w-full mx-auto bg-light rounded-lg border border-gray-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-primary flex items-center gap-2">
              <i className="fas fa-edit"></i>
              Edit Quotation #{id}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Modify quotation details and pricing
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
                  Client Name *
                </label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) =>
                    setOrderInfo({ ...formData, client_name: e.target.value })
                  }
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter client name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Client Email
                </label>
                <input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) =>
                    setOrderInfo({ ...formData, client_email: e.target.value })
                  }
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter client email"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) =>
                    setOrderInfo({ ...formData, brand: e.target.value })
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
                  value={formData.shirt_color}
                  onChange={(e) =>
                    setOrderInfo({ ...formData, shirt_color: e.target.value })
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
                  value={formData.free_items}
                  placeholder="Enter free items"
                  onChange={(e) =>
                    setOrderInfo({ ...formData, free_items: e.target.value })
                  }
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Global Configuration */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
            <h2 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
              <i className="fas fa-sliders-h"></i>
              Global Configuration
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tshirt Type *
                </label>
                <select
                  value={selectedTshirtType === null ? "" : selectedTshirtType}
                  onChange={(e) =>
                    handleTshirtTypeChange(parseInt(e.target.value))
                  }
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
                >
                  <option value="" disabled>
                    Select Tshirt Type
                  </option>
                  {data.tshirtTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} (₱{type.base_price})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Neckline *
                </label>
                <select
                  value={selectedNeckline === null ? "" : selectedNeckline}
                  onChange={(e) =>
                    handleNecklineChange(parseInt(e.target.value))
                  }
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
                >
                  <option value="" disabled>
                    Select Neckline
                  </option>
                  {data.necklines.map((neckline) => (
                    <option key={neckline.id} value={neckline.id}>
                      {neckline.name} (₱{neckline.base_price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Print Type *
                </label>
                <select
                  value={selectedPrintType === null ? "" : selectedPrintType}
                  onChange={(e) =>
                    handlePrintTypeChange(parseInt(e.target.value))
                  }
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
                >
                  <option value="" disabled>
                    Select Print Type
                  </option>
                  {data.printTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} (₱{type.base_price})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Print Colors *
                </label>
                <select
                  value={colorCount === null ? "" : colorCount}
                  onChange={(e) =>
                    handleColorCountChange(parseInt(e.target.value))
                  }
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
                  disabled={!selectedPrintType}
                >
                  <option value="" disabled>
                    Select Color Count
                  </option>
                  {colorOptions.map((opt) => (
                    <option key={opt.color_count} value={opt.color_count}>
                      {opt.color_count} color{opt.color_count > 1 ? "s" : ""} (₱
                      {opt.price})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Print Pattern *
                </label>
                <select
                  value={
                    selectedPrintPattern === null ? "" : selectedPrintPattern
                  }
                  onChange={(e) =>
                    handlePrintPatternChange(parseInt(e.target.value))
                  }
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
                >
                  <option value="" disabled>
                    Select Print Pattern
                  </option>
                  {data.printPatterns.map((pattern) => (
                    <option key={pattern.id} value={pattern.id}>
                      {pattern.name} (+₱
                      {quotationService
                        .toNumber(pattern.base_price)
                        .toLocaleString()}
                      )
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Quotation Items Table */}
       
       
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-primary/5 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-primary">
                  <i className="fas fa-tshirt mr-2"></i>Quotation Items
                </h3>
                <button
                  onClick={addItem}
                  className="px-2 py-1 bg-primary text-white text-xs rounded-lg hover:bg-secondary"
                >
                  <i className="fas fa-plus text-xs mr-1"></i>Add Size
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-light/50 border-b border-gray-200">
                    <tr>
                      <th className="px-2 py-2 text-left">Size</th>
                      <th className="px-2 py-2 text-right w-20">Qty</th>
                      <th className="px-2 py-2 text-right w-20">Price/Pc</th>
                      <th className="px-2 py-2 text-right w-20">Amount</th>
                      <th className="px-2 py-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item) => {
                      const { pricePerPiece, total } =
                        quotationService.calculateItem(
                          data,
                          item,
                          colorCount || 1,
                        );
                      return (
                        <tr key={item.id} className="hover:bg-light/30">
                          <td className="px-2 py-1.5">
                            <select
                              value={item.size_id}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "size_id",
                                  parseInt(e.target.value),
                                )
                              }
                              className="w-full px-1 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                            >
                              {data.sizes.map((size) => (
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
                                updateItem(
                                  item.id,
                                  "quantity",
                                  parseInt(e.target.value) || 0,
                                )
                              }
                              className="w-full px-1 py-1 text-xs text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                            />
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono">
                            ₱{(pricePerPiece || 0).toLocaleString()}
                          </td>
                          <td className="px-2 py-1.5 text-right font-semibold text-primary">
                            ₱{(total || 0).toLocaleString()}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-primary/5 border-t border-gray-200">
                    <tr>
                      <td colSpan="3" className="px-2 py-2 text-right font-semibold">
                        Total:
                      </td>
                      <td className="px-2 py-2 text-right font-bold text-primary">
                        ₱{totalAmount.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Addons Section */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-primary/5">
                <h3 className="text-sm font-semibold text-primary">
                  <i className="fas fa-plus-circle mr-2"></i>Addons (Applied to all sizes)
                </h3>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.addonCategories.map((category) => (
                    <div key={category.id}>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">
                        {category.name}
                      </h4>
                      <div className="space-y-2">
                        {data.addons
                          .filter((a) => a.category_id === category.id)
                          .map((addon) => (
                            <button
                              key={addon.id}
                              onClick={() => toggleAddon(addon.id)}
                              className={`w-full p-2 rounded-lg border transition-all text-left ${selectedAddons.includes(addon.id) ? "bg-primary text-white border-primary" : "bg-white text-gray-700 border-gray-200"}`}
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
                                {addon.price_type === "Free"
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

            {/* Cost Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setIsCostBreakdownOpen(!isCostBreakdownOpen)}
                className="w-full px-4 py-3 bg-primary/5 flex justify-between items-center hover:bg-primary/10"
              >
                <div className="flex items-center gap-2">
                  <i
                    className={`fas fa-chevron-${isCostBreakdownOpen ? "down" : "right"} text-primary text-xs`}
                  ></i>
                  <h3 className="text-sm font-semibold text-primary">
                    <i className="fas fa-receipt mr-2"></i>Cost Breakdown
                  </h3>
                </div>
                <span className="text-sm font-bold text-primary">
                  ₱{totalAmount.toLocaleString()}
                </span>
              </button>

              {isCostBreakdownOpen && (
                <div className="p-4">
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-gray-700 mb-3">
                      Items Breakdown
                    </h4>
                    <div className="bg-light/30 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-light/50 border-b border-gray-200">
                            <tr className="text-left">
                              <th className="px-3 py-2">Size</th>
                              <th className="px-3 py-2 text-center">Qty</th>
                              <th className="px-3 py-2 text-right">Tshirt</th>
                              <th className="px-3 py-2 text-right">Size+</th>
                              <th className="px-3 py-2 text-right">Neckline</th>
                              <th className="px-3 py-2 text-right">Print Type</th>
                              <th className="px-3 py-2 text-right">Print Color</th>
                              <th className="px-3 py-2 text-right">Pattern</th>
                              <th className="px-3 py-2 text-right">Price/Pc</th>
                              <th className="px-3 py-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {itemDetails.map((item) => {
                              const sizeName =
                                data.sizes.find((s) => s.id === item.size_id)
                                  ?.name || "Unknown";
                              return (
                                <tr key={item.id} className="hover:bg-white/50">
                                  <td className="px-3 py-2 font-medium text-primary">
                                    {sizeName}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {item.quantity}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    ₱{quotationService.getTshirtPrice(data.tshirtTypes, item.tshirt_type_id).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    ₱{quotationService.getSizePrice(data.sizePrices, item.tshirt_type_id, item.size_id).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    ₱{quotationService.getNecklinePrice(data.necklines, item.neckline_id).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    ₱{quotationService.getPrintTypePrice(data.printTypes, item.print_type_id).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    ₱{quotationService.getPrintColorPrice(data.printColors, item.print_type_id, colorCount || 1).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    ₱{quotationService.getPrintPatternPrice(data.printPatterns, item.print_pattern_id).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right font-semibold">
                                    ₱{item.pricePerPiece.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right font-bold text-primary">
                                    ₱{item.total.toLocaleString()}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {addonDetails.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs font-semibold text-gray-700 mb-3">
                        Addons Breakdown
                      </h4>
                      <div className="bg-light/30 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
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
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Discount Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
              <h2 className="text-sm font-medium text-primary mb-3">
                <i className="fas fa-tag mr-2"></i>Discount
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
              <div className="px-4 py-3 bg-gradient-to-r from-primary/5 to-primary/10">
                <h3 className="text-sm font-semibold text-primary">
                  <i className="fas fa-receipt mr-2"></i>Payment Summary
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="space-y-2 pb-2 border-b border-dashed border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Subtotal (Items)</span>
                      <span className="text-sm font-medium">₱{totalAmount.toLocaleString()}</span>
                    </div>
                    {totalAddons > 0 && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Addons</span>
                        <span className="text-sm font-medium">₱{totalAddons.toLocaleString()}</span>
                      </div>
                    )}
                    {discount.value > 0 && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">
                          Discount ({discount.type === "percentage" ? `${discount.value}%` : "Fixed"})
                        </span>
                        <span className="text-sm font-medium text-red-600">
                          - ₱{discountAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-base font-bold text-primary">TOTAL</span>
                    <span className="text-2xl font-bold text-primary">₱{grandTotal.toLocaleString()}</span>
                  </div>

                  <div className="border-t border-dashed border-gray-300 my-2"></div>

                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                        <span className="text-[11px] text-gray-500">Downpayment (60%)</span>
                      </div>
                      <span className="text-sm font-semibold">₱{downPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                        <span className="text-[11px] text-gray-500">Balance (40%)</span>
                      </div>
                      <span className="text-sm font-semibold">₱{balance.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-center mt-2">
                    <div className="inline-flex items-center gap-1 text-[9px] text-gray-400">
                      <i className="fas fa-clock"></i>
                      <span>Balance due upon delivery/pickup</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                <i className="fas fa-pencil-alt"></i>
                Notes
              </h2>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setOrderInfo({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary resize-y"
                placeholder="Additional notes or special instructions..."
              />
            </div>
       
    

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
            <span className="text-sm text-yellow-700">
              Please select all configuration options above to edit the quotation.
            </span>
          </div>
      

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => navigate("/quotations")}
            className="px-3 py-1.5 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-gray-50"
          >
            <i className="fas fa-times mr-1"></i>Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={saving }
            className="px-3 py-1.5 rounded-md bg-primary text-white hover:bg-secondary text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin mr-1"></i>Updating...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-1"></i>Update Quotation
              </>
            )}
          </button>
        </div>
      </section>
    </AdminLayout>
  );
};

export default EditQuotation;