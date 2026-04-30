import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { quotationService } from "../../services/quotationService";
import { quotationApi } from "../../api/quotationApi";
import { clientApi } from "../../api/clientApi";
import { apparelPartsApi } from "../../api/apparelPartsApi";
import { apparelNecklineApi } from "../../api/apparelNecklineApi";
import { printMethodApi } from "../../api/printMethodApi";
import FileUpload from "../../components/form/FileUpload";

const DEFAULT_SIZE_OPTIONS = [
  { id: 1, name: "XS" },
  { id: 2, name: "S" },
  { id: 3, name: "M" },
  { id: 4, name: "L" },
  { id: 5, name: "XL" },
  { id: 6, name: "2XL" },
  { id: 7, name: "3XL" },
];

const normalizeSizeName = (value) => String(value || "").trim().toLowerCase();

const getDefaultSizeUnitPrice = (sizeName) => {
  const normalizedSize = normalizeSizeName(sizeName);

  if (normalizedSize === "l" || normalizedSize === "xl") {
    return 10;
  }

  if (normalizedSize === "2xl" || normalizedSize === "3xl") {
    return 30;
  }

  return 0;
};

const toNullableId = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const buildDefaultSizeRows = ({
  sizeOptions,
  selectedApparelPattern,
  existingItems = [],
}) => {
  return sizeOptions.map((option, index) => {
    const sizeName = option.name;
    const matchedExisting = existingItems.find(
      (item) =>
        Number(item.size_id) === Number(option.id) ||
        normalizeSizeName(item.size_label || item.size) === normalizeSizeName(sizeName),
    );

    return {
      id: index + 1,
      size_id: matchedExisting?.size_id || option.id,
      size_label: matchedExisting?.size_label || matchedExisting?.size || option.name,
      quantity: matchedExisting?.quantity ?? 1,
      unit_price: matchedExisting?.unit_price ?? getDefaultSizeUnitPrice(sizeName),
      price_per_piece: matchedExisting?.price_per_piece ?? 0,
      apparel_pattern_price_id:
        matchedExisting?.apparel_pattern_price_id || selectedApparelPattern?.id || null,
      apparel_type_id:
        matchedExisting?.apparel_type_id || selectedApparelPattern?.apparelTypeId || null,
      pattern_type_id:
        matchedExisting?.pattern_type_id || selectedApparelPattern?.patternTypeId || null,
    };
  });
};

const normalizeClientBrands = (client) => {
  if (!Array.isArray(client?.brands)) return [];

  return client.brands
    .map((brand) => {
      if (typeof brand === "string") return brand.trim();
      return String(brand?.name || "").trim();
    })
    .filter(Boolean);
};

const Quotation = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [apparelParts, setApparelParts] = useState([]);
  const [necklines, setNecklines] = useState([]);
  const [clients, setClients] = useState([]);
  const [printMethods, setPrintMethods] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [discount, setDiscount] = useState({ type: "percentage", value: 0 });
  const [isCostBreakdownOpen, setIsCostBreakdownOpen] = useState(false);
  const [sampleBreakdown, setSampleBreakdown] = useState({
    unit_price: 1000,
    quantity: 1,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [partSearchTerm, setPartSearchTerm] = useState("");
  const [activeApparelFilter, setActiveApparelFilter] = useState("all");
  const [activePatternFilter, setActivePatternFilter] = useState("all");
  const [selectedApparelPatternId, setSelectedApparelPatternId] = useState(null);

  // Print Information State
  const [selectedPrintMethodId, setSelectedPrintMethodId] = useState(null);
  const [selectedSpecialPrint, setSelectedSpecialPrint] = useState("");
  const [selectedPrintArea, setSelectedPrintArea] = useState("Regular");
  const [silkscreenMethodId, setSilkscreenMethodId] = useState(null);

  const [formData, setOrderInfo] = useState({
    client_name: "",
    client_email: "",
    client_facebook: "",
    brand: "",
    shirt_color: "",
    apparel_neckline_id: "",
    free_items: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [quotationData, clientsRes, apparelPartsRes, necklinesRes, printMethodsRes] = await Promise.all([
        quotationService.fetchAll(),
        clientApi.index(),
        apparelPartsApi.index(),
        apparelNecklineApi.index(),
        printMethodApi.index(),
      ]);

      const clientsData = clientsRes.data || clientsRes || [];
      const apparelPartsData = apparelPartsRes.data || apparelPartsRes || [];
      const necklinesData = necklinesRes.data || necklinesRes || [];
      const printMethodsData = printMethodsRes.data || printMethodsRes || [];

      // Find Silkscreen method and set as default
      const silkscreenMethod = printMethodsData.find(
        (method) => method.name?.toLowerCase().includes("silkscreen")
      );
      if (silkscreenMethod) {
        setSilkscreenMethodId(silkscreenMethod.id);
        setSelectedPrintMethodId(silkscreenMethod.id);
      }

      setData({
        ...quotationData,
        apparelParts: apparelPartsData,
      });
      setApparelParts(apparelPartsData);
      setNecklines(necklinesData);
      setClients(clientsData);
      setPrintMethods(printMethodsData);
      setItems([]);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const sizeOptions = useMemo(() => DEFAULT_SIZE_OPTIONS, []);

  const partOptions = useMemo(() => {
    return (apparelParts || [])
      .map((part) => ({
        id: Number(part.id),
        name: String(part.name || "").trim(),
        description: String(part.description || "").trim(),
      }))
      .filter((part) => part.name);
  }, [apparelParts]);

  const necklineOptions = useMemo(() => {
    return (necklines || [])
      .map((neckline) => ({
        id: Number(neckline.id),
        name: String(neckline.name || "").trim(),
        price: quotationService.toNumber(neckline.price),
      }))
      .filter((neckline) => neckline.id && neckline.name);
  }, [necklines]);

  const apparelPatternOptions = useMemo(() => {
    const rows = data?.apparelPatternPrices || [];

    return rows.map((row) => {
      const apparelName =
        row.apparelType?.name ||
        row.apparel_type?.name ||
        row.apparel_type_name ||
        "Unknown Apparel";

      const patternName =
        row.patternType?.name ||
        row.pattern_type?.name ||
        row.pattern_type_name ||
        "Unknown Pattern";

      return {
        id: Number(row.id),
        apparelTypeId: Number(
          row.apparel_type_id ?? row.apparelType?.id ?? row.apparel_type?.id,
        ),
        patternTypeId: Number(
          row.pattern_type_id ?? row.patternType?.id ?? row.pattern_type?.id,
        ),
        apparelName: String(apparelName).trim(),
        patternName: String(patternName).trim(),
        label: `${String(apparelName).trim()} / ${String(patternName).trim()}`,
        price: quotationService.toNumber(row.price),
      };
    });
  }, [data]);

  const selectedApparelPattern = useMemo(() => {
    return (
      apparelPatternOptions.find(
        (row) => Number(row.id) === Number(selectedApparelPatternId),
      ) || null
    );
  }, [apparelPatternOptions, selectedApparelPatternId]);

  const selectedPrintMethod = useMemo(() => {
    return printMethods.find(
      (method) => Number(method.id) === Number(selectedPrintMethodId),
    ) || null;
  }, [printMethods, selectedPrintMethodId]);

  const filteredPrintMethods = useMemo(() => {
    return printMethods.filter((method) => {
      const name = method.name?.toLowerCase() || "";
      // Exclude Silkscreen, Sublimation, and High Density from the dropdown
      return !name.includes("silkscreen") && 
             !name.includes("sublimation") && 
             !name.includes("high density");
    });
  }, [printMethods]);

  const printMethodLabels = useMemo(() => {
    const methodName = selectedPrintMethod?.name?.toLowerCase() || "";
    const isSilkscreenSelected = Number(selectedPrintMethodId) === Number(silkscreenMethodId);

    if (isSilkscreenSelected) {
      return {
        unitLabel: "Number of Colors",
        priceLabel: "Price/Color",
      };
    }
    
    if (methodName.includes("dtf")) {
      return {
        unitLabel: "Meters",
        priceLabel: "Price/m",
      };
    }
    
    if (methodName.includes("embroidery")) {
      return {
        unitLabel: "Size",
        priceLabel: "Price/size",
      };
    }
    
    return {
      unitLabel: "Number of Units",
      priceLabel: "Price/Unit",
    };
      }, [selectedPrintMethod, selectedPrintMethodId, silkscreenMethodId]);

  const uniqueApparelNames = useMemo(() => {
    return Array.from(
      new Set(apparelPatternOptions.map((row) => row.apparelName)),
    ).sort((a, b) => a.localeCompare(b));
  }, [apparelPatternOptions]);

  const uniquePatternNames = useMemo(() => {
    return Array.from(
      new Set(apparelPatternOptions.map((row) => row.patternName)),
    ).sort((a, b) => a.localeCompare(b));
  }, [apparelPatternOptions]);

  const filteredApparelPatternOptions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return apparelPatternOptions.filter((row) => {
      const matchesSearch = !search || row.label.toLowerCase().includes(search);
      const matchesApparel =
        activeApparelFilter === "all" || row.apparelName === activeApparelFilter;
      const matchesPattern =
        activePatternFilter === "all" || row.patternName === activePatternFilter;

      return matchesSearch && matchesApparel && matchesPattern;
    });
  }, [
    apparelPatternOptions,
    searchTerm,
    activeApparelFilter,
    activePatternFilter,
  ]);

  const filteredApparelParts = useMemo(() => {
    const query = partSearchTerm.trim().toLowerCase();

    return partOptions.filter((part) => {
      const alreadySelected = selectedColors.some(
        (selectedPart) => Number(selectedPart.colorId) === Number(part.id),
      );
      const matchesSearch =
        !query ||
        `${part.name} ${part.description}`.toLowerCase().includes(query);

      return matchesSearch && !alreadySelected;
    });
  }, [partOptions, partSearchTerm, selectedColors]);

  const filteredClients = useMemo(() => {
    const query = clientSearchTerm.trim().toLowerCase();

    if (!query) {
      return clients.slice(0, 8);
    }

    return clients
      .filter((client) => {
        const brands = normalizeClientBrands(client).join(" ").toLowerCase();
        const name = String(client?.name || "").toLowerCase();
        const email = String(client?.email || "").toLowerCase();
        return (
          name.includes(query) || email.includes(query) || brands.includes(query)
        );
      })
      .slice(0, 8);
  }, [clients, clientSearchTerm]);

  const selectedClient = useMemo(() => {
    return clients.find((client) => Number(client.id) === Number(selectedClientId)) || null;
  }, [clients, selectedClientId]);

  const selectedClientBrands = useMemo(() => {
    return normalizeClientBrands(selectedClient);
  }, [selectedClient]);

  useEffect(() => {
    if (!selectedApparelPattern || items.length === 0) return;

    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        apparel_pattern_price_id: selectedApparelPattern.id,
        apparel_type_id: selectedApparelPattern.apparelTypeId,
        pattern_type_id: selectedApparelPattern.patternTypeId,
      })),
    );
  }, [selectedApparelPatternId]);

  useEffect(() => {
    if (!selectedApparelPattern || selectedColors.length === 0 || items.length > 0) {
      return;
    }

    setItems(
      buildDefaultSizeRows({
        sizeOptions,
        selectedApparelPattern,
      }),
    );
  }, [selectedApparelPattern, selectedColors, items.length, sizeOptions]);

  const { itemDetails, addonDetails, totalAmount, totalAddons, totalQuantity } =
    data && items.length > 0
      ? quotationService.calculateTotals(
          { ...data, printColors: data?.apparelParts || [], necklines },
          items,
          selectedColors,
          selectedAddons,
          formData.apparel_neckline_id,
        )
      : {
          itemDetails: [],
          addonDetails: [],
          totalAmount: 0,
          totalAddons: 0,
          totalQuantity: 0,
        };

  const sampleBreakdownTotal =
    quotationService.toNumber(sampleBreakdown.unit_price) *
    quotationService.toNumber(sampleBreakdown.quantity);
  const subtotal = totalAmount + totalAddons + sampleBreakdownTotal;
  const discountAmount = quotationService.applyDiscount(subtotal, discount);
  const grandTotal = subtotal - discountAmount;
  const downPayment = grandTotal * 0.6;
  const balance = grandTotal * 0.4;

  const toggleColor = (part) => {
    const partId = Number(part.id ?? part.colorId ?? part.partId);
    const partName = part.name || part.part || "";
    const partDescription = part.description || part.part_description || "";
    setSelectedColors((prev) => {
      const exists = prev.find((c) => Number(c.colorId) === partId);
      if (exists) {
        return prev.filter((c) => Number(c.colorId) !== partId);
      }
      return [
        ...prev,
        {
          colorId: partId,
          partId,
          part: partName,
          part_description: partDescription,
          file: null,
          imageInputType: "file",
          imageLink: "",
          unitCount: 1,
          pricePerUnit: 20,
          fullUnitCount: 1,
          pricePerFullUnit: 0,
        },
      ];
    });
  };

  const updateColorFile = (colorId, file) => {
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId)
          ? { ...c, file, imageInputType: "file" }
          : c,
      ),
    );
  };

  const updateColorInputType = (colorId, inputType) => {
    setSelectedColors((prev) =>
      prev.map((c) => {
        if (Number(c.colorId) !== Number(colorId)) return c;

        if (inputType === "link") {
          return { ...c, imageInputType: "link", file: null };
        }

        return { ...c, imageInputType: "file", imageLink: "" };
      }),
    );
  };

  const updateColorLink = (colorId, imageLink) => {
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId)
          ? { ...c, imageInputType: "link", imageLink }
          : c,
      ),
    );
  };

  const updateUnitCount = (colorId, count) => {
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId)
          ? { ...c, unitCount: Math.max(1, parseInt(count, 10) || 1) }
          : c,
      ),
    );
  };

  const updateUnitPrice = (colorId, price) => {
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId)
          ? { ...c, pricePerUnit: Math.max(0, parseFloat(price) || 0) }
          : c,
      ),
    );
  };

  const updateFullUnitCount = (colorId, count) => {
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId)
          ? { ...c, fullUnitCount: Math.max(1, parseInt(count, 10) || 1) }
          : c,
      ),
    );
  };

  const updateFullUnitPrice = (colorId, price) => {
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId)
          ? { ...c, pricePerFullUnit: Math.max(0, parseFloat(price) || 0) }
          : c,
      ),
    );
  };

  const handlePartSearchChange = (value) => {
    setPartSearchTerm(value);
  };

  const handleAddPart = (part) => {
    toggleColor(part);
    setPartSearchTerm("");
  };

  const updateItem = (id, field, value) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId],
    );
  };

  const handleClientSearchChange = (value) => {
    setClientSearchTerm(value);

    if (!value.trim()) {
      setSelectedClientId(null);
      setOrderInfo((prev) => ({
        ...prev,
        client_name: "",
        client_email: "",
        client_facebook: "",
        brand: "",
        shirt_color: "",
        apparel_neckline_id: "",
        free_items: "",
      }));
      return;
    }

    if (value !== formData.client_name) {
      setSelectedClientId(null);
      setOrderInfo((prev) => ({
        ...prev,
        client_name: "",
        client_email: "",
        client_facebook: "",
        brand: "",
        shirt_color: "",
        apparel_neckline_id: "",
        free_items: "",
      }));
    }
  };

  const handleSelectClient = (client) => {
    const brands = normalizeClientBrands(client);
    setSelectedClientId(client.id);
    setClientSearchTerm(client.name || "");
    setOrderInfo((prev) => ({
      ...prev,
      client_name: client.name || "",
      client_email: client.email || "",
      client_facebook: client.facebook || "",
      brand: brands[0] || "",
    }));
  };

  const handleReset = () => {
    if (!window.confirm("Are you sure you want to reset all data?")) return;

    setItems([]);
    setSelectedAddons([]);
    setSelectedColors([]);
    setApparelParts(apparelParts);
    setSelectedApparelPatternId(null);
    setSelectedPrintMethodId(silkscreenMethodId);
    setSelectedSpecialPrint("");
    setSelectedPrintArea("Regular");
    setSelectedClientId(null);
    setClientSearchTerm("");
    setSearchTerm("");
    setPartSearchTerm("");
    setActiveApparelFilter("all");
    setActivePatternFilter("all");
    setDiscount({ type: "percentage", value: 0 });
    setSampleBreakdown({ unit_price: 1000, quantity: 1 });
    setOrderInfo({
      client_name: "",
      client_email: "",
      client_facebook: "",
      brand: "",
      shirt_color: "",
      apparel_neckline_id: "",
      free_items: "",
      notes: "",
    });
  };

  const itemConfigPayload = {
    apparel_pattern_price_id: toNullableId(selectedApparelPattern?.id),
    apparel_type_id: toNullableId(selectedApparelPattern?.apparelTypeId),
    pattern_type_id: toNullableId(selectedApparelPattern?.patternTypeId),
  };

  const compactItemsPayload = items.map((item) => ({
    id: item.id,
    size_id: item.size_id,
    size:
      item.size_label ||
      sizeOptions.find((s) => Number(s.id) === Number(item.size_id))?.name ||
      null,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));

  const breakdown = {
    items: itemDetails.map((item) => ({
      size:
        item.size_label ||
        sizeOptions.find((s) => Number(s.id) === Number(item.size_id))?.name ||
        "Unknown",
      quantity: item.quantity,
      price_per_piece: item.pricePerPiece,
      total: item.total,
      apparel_pattern_price: item.apparelPatternPrice,
      neckline_price: item.necklinePrice,
      unit_price: item.unitPrice,
    })),
    sample_breakdown: {
      sample_apparel: selectedApparelPattern?.label || null,
      unit_price: quotationService.toNumber(sampleBreakdown.unit_price),
      quantity: quotationService.toNumber(sampleBreakdown.quantity),
      price_per_piece: sampleBreakdownTotal,
    },
  };

  const formattedAddons = selectedAddons.map((id) => {
    const addon = data?.addons?.find((a) => a.id === id);
    return {
      id: toNullableId(addon?.id || id),
      name: addon?.name || "Unknown",
      price: addon?.price_type === "Free" ? 0 : quotationService.toNumber(addon?.price),
    };
  });

  const handleSave = async () => {
    if (!selectedClientId) {
      alert("Please search and select a client first.");
      return;
    }

    if (!selectedApparelPattern) {
      alert("Please select an Apparel/Pattern option.");
      return;
    }

    if (items.length === 0) {
      alert("Please add at least one item to the quotation.");
      return;
    }

    if (selectedColors.length === 0) {
      alert("Please select at least one apparel part.");
      return;
    }

    setSaving(true);

    try {
      const printParts = selectedColors.map((part) => {
        const partOption = partOptions.find(
          (option) => Number(option.id) === Number(part.colorId),
        );

        const imageInputType = part.imageInputType === "link" ? "link" : "file";
        const imageLink =
          imageInputType === "link" ? String(part.imageLink || "").trim() : "";
        const image = imageInputType === "file" ? part.file : null;

        return {
          part_id: toNullableId(partOption?.id ?? part.colorId),
          part: partOption?.name || part.part || `Part ${part.colorId}`,
          unit_count: part.unitCount,
          price_per_unit: quotationService.toNumber(part.pricePerUnit),
          full_unit_count: part.fullUnitCount || 0,
          price_per_full_unit: quotationService.toNumber(part.pricePerFullUnit || 0),
          image_input_type: imageInputType,
          image_link: imageLink,
          image,
        };
      });

      const formDataToSend = new FormData();
      formDataToSend.append("client_name", formData.client_name);
      formDataToSend.append("client_email", formData.client_email);
      formDataToSend.append("client_facebook", formData.client_facebook);
      formDataToSend.append("client_brand", formData.brand);
      formDataToSend.append("client_id", selectedClientId);
      formDataToSend.append("apparel_type_id", itemConfigPayload.apparel_type_id ?? "");
      formDataToSend.append("pattern_type_id", itemConfigPayload.pattern_type_id ?? "");
      formDataToSend.append("shirt_color", formData.shirt_color);
      formDataToSend.append("apparel_neckline_id", formData.apparel_neckline_id || "");
      formDataToSend.append("free_items", formData.free_items);
      formDataToSend.append("notes", formData.notes);
      formDataToSend.append("print_method_id", selectedPrintMethodId || "");
      formDataToSend.append("special_print", selectedSpecialPrint || "");
      formDataToSend.append("print_area", selectedPrintArea || "");
      formDataToSend.append("item_config_json", JSON.stringify(itemConfigPayload));
      formDataToSend.append("items_json", JSON.stringify(compactItemsPayload));
      formDataToSend.append("addons_json", JSON.stringify(formattedAddons));
      formDataToSend.append("discount_type", discount.type);
      formDataToSend.append("discount_price", discount.value);
      formDataToSend.append("subtotal", subtotal);
      formDataToSend.append("breakdown_json", JSON.stringify(breakdown));
      formDataToSend.append("grand_total", grandTotal);
      formDataToSend.append(
        "print_parts_json",
        JSON.stringify(
          printParts.map((part) => ({
            part_id: part.part_id,
            part: part.part,
            unit_count: part.unit_count,
            price_per_unit: part.price_per_unit,
            full_unit_count: part.full_unit_count,
            price_per_full_unit: part.price_per_full_unit,
            image_input_type: part.image_input_type,
            image_link: part.image_link,
          })),
        ),
      );

      printParts.forEach((part, index) => {
        if (part.image) {
          formDataToSend.append(`print_parts_files[${index}]`, part.image);
        }
      });

      await quotationApi.create(formDataToSend);
      navigate("/quotations", { replace: true });
    } catch (error) {
      console.error("Error saving quotation:", error);
      alert("An error occurred while saving the quotation. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Add Quotation">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-600 text-sm font-medium">Loading quotation data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  const hasSelections = !!selectedApparelPattern && selectedColors.length > 0;

  return (
    <AdminLayout
      pageTitle="Add Quotation"
      path="/quotations"
      links={[
        { label: "Home", href: "/" },
        {
          label: "Quotations",
          href: "/quotations",
          icon: "fa-solid fa-file-invoice-dollar",
        },
      ]}
    >
      <section className="flex flex-col gap-y-3 sm:gap-y-4 font-poppins p-3 sm:p-4 max-w-full mx-auto bg-light rounded-lg border border-gray-300">
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
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
            <h2 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
              <i className="fas fa-info-circle"></i>
              Order Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3.75">
              <div className="relative">
                <label className="block text-xs font-medium text-gray-600 mb-1">Search Client *</label>
                <input
                  type="text"
                  value={clientSearchTerm}
                  onChange={(e) => handleClientSearchChange(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                  placeholder="Search by name, email, or brand"
                />
                {clientSearchTerm.trim() && clientSearchTerm !== formData.client_name && (
                  <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow">
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => {
                        const brands = normalizeClientBrands(client);
                        return (
                          <button
                            type="button"
                            key={client.id}
                            onClick={() => handleSelectClient(client)}
                            className="w-full text-left px-2 py-2 hover:bg-primary/5 border-b border-gray-100 last:border-b-0"
                          >
                            <p className="text-xs font-medium text-gray-800">{client.name}</p>
                            <p className="text-[11px] text-gray-500">{client.email || "No email"}</p>
                            <p className="text-[11px] text-gray-400">
                              {brands.length > 0 ? brands.join(", ") : "No brands"}
                            </p>
                          </button>
                        );
                      })
                    ) : (
                      <p className="px-2 py-2 text-xs text-gray-500">No matching clients found.</p>
                    )}
                  </div>
                )}
              </div>

              {selectedClientId && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Selected Client</label>
                    <p className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                      {formData.client_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Client Email</label>
                    <input
                      type="email"
                      value={formData.client_email}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                      placeholder="Auto-filled from selected client"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Client Facebook</label>
                    <input
                      type="text"
                      value={formData.client_facebook}
                      onChange={(e) =>
                        setOrderInfo((prev) => ({ ...prev, client_facebook: e.target.value }))
                      }
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                      placeholder="Enter Facebook profile or page"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
                    <select
                      value={formData.brand}
                      onChange={(e) =>
                        setOrderInfo((prev) => ({ ...prev, brand: e.target.value }))
                      }
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                    >
                      {selectedClientBrands.length > 0 ? (
                        selectedClientBrands.map((brandName) => (
                          <option key={brandName} value={brandName}>
                            {brandName}
                          </option>
                        ))
                      ) : (
                        <option value="">No brands available</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Shirt Color</label>
                    <input
                      type="text"
                      value={formData.shirt_color}
                      onChange={(e) =>
                        setOrderInfo((prev) => ({ ...prev, shirt_color: e.target.value }))
                      }
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                      placeholder="Enter shirt color"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Free Items</label>
                    <input
                      type="text"
                      value={formData.free_items}
                      onChange={(e) =>
                        setOrderInfo((prev) => ({ ...prev, free_items: e.target.value }))
                      }
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                      placeholder="Enter free items"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
            <h2 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
              <i className="fas fa-sliders-h"></i>
              Apparel Information
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                  Apparel / Pattern Type
                </h3>
              </div>

              <div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                  placeholder="Search apparel or pattern"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Apparel Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveApparelFilter("all")}
                    className={`px-2 py-1 text-[11px] rounded-full border ${activeApparelFilter === "all" ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200"}`}
                  >
                    All Apparel
                  </button>
                  {uniqueApparelNames.map((name) => (
                    <button
                      type="button"
                      key={name}
                      onClick={() => setActiveApparelFilter(name)}
                      className={`px-2 py-1 text-[11px] rounded-full border ${activeApparelFilter === name ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200"}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Pattern Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActivePatternFilter("all")}
                    className={`px-2 py-1 text-[11px] rounded-full border ${activePatternFilter === "all" ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200"}`}
                  >
                    All Pattern
                  </button>
                  {uniquePatternNames.map((name) => (
                    <button
                      type="button"
                      key={name}
                      onClick={() => setActivePatternFilter(name)}
                      className={`px-2 py-1 text-[11px] rounded-full border ${activePatternFilter === name ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200"}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Apparel / Pattern *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {filteredApparelPatternOptions.map((option) => {
                    const isSelected = Number(selectedApparelPatternId) === Number(option.id);

                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => setSelectedApparelPatternId(option.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${isSelected ? "border-primary bg-primary/10" : "border-gray-200 bg-white hover:border-primary/40"}`}
                      >
                        <p className="text-xs font-semibold text-primary">{option.label}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Base: ₱{option.price.toLocaleString()}</p>
                      </button>
                    );
                  })}
                </div>
                {filteredApparelPatternOptions.length === 0 && (
                  <p className="text-xs text-gray-500 mt-2">No Apparel/Pattern combinations found.</p>
                )}
              </div>

              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
                  Print Information
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Print Method</label>
                    <select
                      value={selectedPrintMethodId || ""}
                      onChange={(e) => {
                        const newMethodId = e.target.value ? Number(e.target.value) : silkscreenMethodId;
                        setSelectedPrintMethodId(newMethodId);
                        // Reset special print and print area when changing method
                        if (newMethodId !== silkscreenMethodId) {
                          setSelectedSpecialPrint("");
                          setSelectedPrintArea("Regular");
                        }
                      }}
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value={silkscreenMethodId || ""}>Silkscreen</option>
                      {filteredPrintMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPrintMethodId === silkscreenMethodId && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Special Print (optional)</label>
                        <select
                          value={selectedSpecialPrint}
                          onChange={(e) => setSelectedSpecialPrint(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="">Select special print</option>
                          <option value="Sublimation">Sublimation</option>
                          <option value="High Density">High Density</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Print Area</label>
                        <select
                          value={selectedPrintArea}
                          onChange={(e) => setSelectedPrintArea(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="Regular">Regular</option>
                          <option value="Full">Full</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                  Miscellaneous
                </h3>
                <label className="block text-xs font-medium text-gray-600 mb-1">Necklines</label>
                <select
                  value={formData.apparel_neckline_id}
                  onChange={(e) =>
                    setOrderInfo((prev) => ({ ...prev, apparel_neckline_id: e.target.value }))
                  }
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Select neckline</option>
                  {necklineOptions.map((neckline) => (
                    <option key={neckline.id} value={neckline.id}>
                      {neckline.name} - PHP {neckline.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                  Upload
                </h3>
                <label className="block text-xs font-medium text-gray-600 mb-1">Parts *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={partSearchTerm}
                    onChange={(e) => handlePartSearchChange(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                    placeholder="Search apparel parts"
                  />

                  {partSearchTerm.trim() && (
                    <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                      {filteredApparelParts.length > 0 ? (
                        filteredApparelParts.map((part) => (
                          <button
                            key={part.id}
                            type="button"
                            onClick={() => handleAddPart(part)}
                            className="w-full text-left px-3 py-2 hover:bg-primary/5 border-b border-gray-100 last:border-b-0"
                          >
                            <p className="text-xs font-medium text-gray-800">{part.name}</p>
                            <p className="text-[11px] text-gray-500 line-clamp-2">
                              {part.description || "No description available"}
                            </p>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-xs text-gray-500">No apparel parts found.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-3">
                  {selectedColors.length > 0 ? (
                    selectedColors.map((part) => (
                      <div key={part.colorId} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold text-primary">{part.part}</p>
                            <p className="text-[11px] text-gray-500">
                              {part.part_description || "Selected apparel part"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleColor(part)}
                            className="text-gray-400 hover:text-red-500"
                            title="Remove part"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_150px] gap-3 items-start">
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => updateColorInputType(part.colorId, "file")}
                                className={`px-2 py-1 text-[11px] rounded border ${
                                  (part.imageInputType || "file") === "file"
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white text-gray-600 border-gray-200"
                                }`}
                              >
                                File Upload
                              </button>
                              <button
                                type="button"
                                onClick={() => updateColorInputType(part.colorId, "link")}
                                className={`px-2 py-1 text-[11px] rounded border ${
                                  part.imageInputType === "link"
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white text-gray-600 border-gray-200"
                                }`}
                              >
                                Link
                              </button>
                            </div>

                            {part.imageInputType === "link" ? (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Image Link
                                </label>
                                <input
                                  type="url"
                                  value={part.imageLink || ""}
                                  onChange={(e) => updateColorLink(part.colorId, e.target.value)}
                                  placeholder="https://example.com/image.png"
                                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                                />
                              </div>
                            ) : (
                              <FileUpload
                                label="Upload Image"
                                name={`apparel-part-${part.colorId}`}
                                value={part.file ? [part.file] : []}
                                onChange={(e) => updateColorFile(part.colorId, e.target.value?.[0] || null)}
                                acceptedTypes="image/*"
                                multiple={false}
                                hideUploadWhenHasFiles
                                hidePreviewWhenEmpty
                                className="px-0"
                              />
                            )}
                          </div>

                          <div className="lg:pt-9 space-y-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">{printMethodLabels.unitLabel}</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={part.unitCount || 1}
                              onChange={(e) => updateUnitCount(part.colorId, e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                            />

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">{printMethodLabels.priceLabel}</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={part.pricePerUnit ?? 0}
                                onChange={(e) => updateUnitPrice(part.colorId, e.target.value)}
                                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                              />
                            </div>

                            {selectedPrintMethodId === silkscreenMethodId && selectedPrintArea === "Full" && (
                              <>
                                <div className="pt-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Number of Full Colors</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={part.fullUnitCount || 1}
                                    onChange={(e) => updateFullUnitCount(part.colorId, e.target.value)}
                                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Price/Full Color</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={part.pricePerFullUnit ?? 0}
                                    onChange={(e) => updateFullUnitPrice(part.colorId, e.target.value)}
                                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-xs text-gray-500">
                      Search and select apparel parts to add them here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasSelections && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-primary/5">
                <h3 className="text-sm font-semibold text-primary">
                  <i className="fas fa-tshirt mr-2"></i>Quotation Items
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-light/50 border-b border-gray-200">
                    <tr>
                      <th className="px-2 py-2 text-left">Size</th>
                      <th className="px-2 py-2 text-right w-20">Qty</th>
                      <th className="px-2 py-2 text-right w-28">Unit Price</th>
                      <th className="px-2 py-2 text-right w-28">Price/Pc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item) => {
                      return (
                        <tr key={item.id} className="hover:bg-light/30">
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              value={item.size_label || ""}
                              onChange={(e) =>
                                updateItem(item.id, "size_label", e.target.value)
                              }
                              className="w-full px-1 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="number"
                              min="0"
                              value={item.quantity ?? 0}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "quantity",
                                  Math.max(0, parseInt(e.target.value, 10) || 0),
                                )
                              }
                              className="w-full px-1 py-1 text-xs text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price ?? 0}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "unit_price",
                                  Math.max(0, parseFloat(e.target.value) || 0),
                                )
                              }
                              className="w-full px-1 py-1 text-xs text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={itemDetails.find((detail) => detail.id === item.id)?.pricePerPiece ?? 0}
                              className="w-full px-1 py-1 text-xs text-right border border-gray-200 rounded bg-gray-50 text-gray-600"
                              readOnly
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

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
                      <h4 className="text-xs font-medium text-gray-700 mb-2">{category.name}</h4>
                      <div className="space-y-2">
                        {data.addons
                          .filter((a) => a.category_id === category.id)
                          .map((addon) => (
                            <button
                              type="button"
                              key={addon.id}
                              onClick={() => toggleAddon(addon.id)}
                              className={`w-full p-2 rounded-lg border transition-all text-left ${selectedAddons.includes(addon.id) ? "bg-primary text-white border-primary" : "bg-white text-gray-700 border-gray-200"}`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium">{addon.name}</span>
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

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                type="button"
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
                <span className="text-sm font-bold text-primary">₱{subtotal.toLocaleString()}</span>
              </button>

              {isCostBreakdownOpen && (
                <div className="p-4">
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-gray-700 mb-3">Items Breakdown</h4>
                    <div className="bg-light/30 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-light/50 border-b border-gray-200">
                            <tr className="text-left">
                              <th className="px-3 py-2">Size</th>
                              <th className="px-3 py-2 text-center">Qty</th>
                              <th className="px-3 py-2 text-right">Apparel/Pattern</th>
                              <th className="px-3 py-2 text-right">Neckline</th>
                              <th className="px-3 py-2 text-right">Color Prices</th>
                              <th className="px-3 py-2 text-right">Unit Price</th>
                              <th className="px-3 py-2 text-right">Price/Pc</th>
                              <th className="px-3 py-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {itemDetails.map((item) => {
                              const sizeName =
                                sizeOptions.find((s) => Number(s.id) === Number(item.size_id))
                                  ?.name || "Unknown";

                              return (
                                <tr key={item.id} className="hover:bg-white/50">
                                  <td className="px-3 py-2 font-medium text-primary">{sizeName}</td>
                                  <td className="px-3 py-2 text-center">{item.quantity}</td>
                                  <td className="px-3 py-2 text-right">
                                    ₱
                                    {quotationService
                                      .getApparelPatternPrice(
                                        data.apparelPatternPrices,
                                        item.apparel_pattern_price_id,
                                      )
                                      .toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right">₱{item.necklinePrice.toLocaleString()}</td>
                                  <td className="px-3 py-2 text-right">₱{item.colorPrice.toLocaleString()}</td>
                                  <td className="px-3 py-2 text-right">₱{item.unitPrice.toLocaleString()}</td>
                                  <td className="px-3 py-2 text-right font-semibold">₱{item.pricePerPiece.toLocaleString()}</td>
                                  <td className="px-3 py-2 text-right font-bold text-primary">₱{item.total.toLocaleString()}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 mb-6">
                    <h4 className="text-xs font-semibold text-gray-700 mb-3">Sample Breakdown</h4>
                    <div className="bg-light/30 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-light/50 border-b border-gray-200">
                            <tr className="text-left">
                              <th className="px-3 py-2">Sample Apparel</th>
                              <th className="px-3 py-2 text-right">Unit Price</th>
                              <th className="px-3 py-2 text-right">Quantity</th>
                              <th className="px-3 py-2 text-right">Price/Pc</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            <tr className="hover:bg-white/50">
                              <td className="px-3 py-2 font-medium text-primary">
                                {selectedApparelPattern?.label || "No apparel/pattern selected"}
                              </td>
                              <td className="px-3 py-2 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={sampleBreakdown.unit_price}
                                  onChange={(e) =>
                                    setSampleBreakdown((prev) => ({
                                      ...prev,
                                      unit_price: Math.max(0, parseFloat(e.target.value) || 0),
                                    }))
                                  }
                                  className="w-24 ml-auto px-2 py-1 text-xs text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                                />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  value={sampleBreakdown.quantity}
                                  onChange={(e) =>
                                    setSampleBreakdown((prev) => ({
                                      ...prev,
                                      quantity: Math.max(0, parseInt(e.target.value, 10) || 0),
                                    }))
                                  }
                                  className="w-20 ml-auto px-2 py-1 text-xs text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/20"
                                />
                              </td>
                              <td className="px-3 py-2 text-right font-semibold text-primary">
                                ₱{sampleBreakdownTotal.toLocaleString()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {addonDetails.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs font-semibold text-gray-700 mb-3">Addons Breakdown</h4>
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
                                  <td className="px-3 py-2 text-right">₱{addon.price_per_piece.toLocaleString()}</td>
                                  <td className="px-3 py-2 text-right">{addon.quantity}</td>
                                  <td className="px-3 py-2 text-right font-semibold text-primary">₱{addon.total.toLocaleString()}</td>
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

            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
              <h2 className="text-sm font-medium text-primary mb-3">
                <i className="fas fa-tag mr-2"></i>Discount
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Discount Type</label>
                  <select
                    value={discount.type}
                    onChange={(e) => setDiscount({ ...discount, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₱)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Discount Value</label>
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
                    placeholder={discount.type === "percentage" ? "e.g., 10" : "e.g., 500"}
                  />
                </div>
                {discount.value > 0 && (
                  <div className="flex-1 flex items-end">
                    <div className="w-full bg-green-50 rounded-lg p-2 border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-green-700">Discount Applied:</span>
                        <span className="text-sm font-semibold text-green-700">
                          - ₱{discountAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-linear-to-r from-primary/5 to-primary/10">
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
                        <span className="text-sm font-medium text-red-600">- ₱{discountAmount.toLocaleString()}</span>
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

            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                <i className="fas fa-pencil-alt"></i>
                Notes
              </h2>
              <textarea
                value={formData.notes}
                onChange={(e) => setOrderInfo({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary resize-y"
                placeholder="Additional notes or special instructions..."
              />
            </div>
          </>
        )}

        {!hasSelections && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
            <span className="text-sm text-yellow-700">
              Select an Apparel/Pattern and at least one part to start creating your quotation.
            </span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="px-3 py-1.5 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-undo mr-1"></i>Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasSelections || items.length === 0}
            className="px-3 py-1.5 rounded-md bg-primary text-white hover:bg-secondary text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-1"></i>
                Save Quotation
              </>
            )}
          </button>
        </div>
      </section>
    </AdminLayout>
  );
};

export default Quotation;
