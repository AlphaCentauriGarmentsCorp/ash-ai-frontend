import React, { useEffect, useMemo, useState } from "react";
import useConfirm from "../../hooks/useConfirm";
import { parseApiError } from "../../utils/parseApiError";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { quotationService } from "../../services/quotationService";
import { quotationApi } from "../../api/quotationApi";
import { clientApi } from "../../api/clientApi";
import { apparelPartsApi } from "../../api/apparelPartsApi";
import { apparelNecklineApi } from "../../api/apparelNecklineApi";
import { printMethodApi } from "../../api/printMethodApi";
import { specialPrintApi } from "../../api/specialPrintApi";
import FileUpload from "../../components/form/FileUpload";
import LabelSpecSection, {
  EMPTY_LABEL,
  EMPTY_LABEL_DESIGN,
} from "../../components/quotation/LabelSpecSection";
import OrderInfoSection from "../../components/quotation/OrderInfoSection";
import SwatchPickerModal from "../../components/quotation/SwatchPickerModal";

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
      // Per-size base pricing now lives in admin (Apparel Pattern Prices →
      // per-size grid). The row keeps unit_price only for payload
      // back-compat; it is no longer entered in Add Quotation nor used to
      // price (the backend resolves the base from the pattern's size_prices).
      unit_price: matchedExisting?.unit_price ?? 0,
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

// Per-Color Quantity Breakdown: a colour group owns its own size/qty list. New
// rows seed at qty 0 (the CSR fills them per colour). The size set mirrors the
// apparel pattern's sizes so every colour's list stays consistent.
const buildColorGroup = ({ sizeOptions, color = "" }) => ({
  id: `cg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  color,
  sizes: (sizeOptions || []).map((option) => ({
    id: `${option.id}`,
    size_id: option.id,
    size_label: option.name,
    quantity: 0,
  })),
});

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
  const { confirm, alert, dialog } = useConfirm();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  // Backend-computed totals for the live preview (source of truth).
  const [previewTotals, setPreviewTotals] = useState(null);
  const [saving, setSaving] = useState(false);

  const [colorBreakdowns, setColorBreakdowns] = useState([]);
  const [swatchPickerGroupId, setSwatchPickerGroupId] = useState(null);
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
  // Custom-pattern reference (Issue 6): shown only when the chosen fit is
  // "Custom". File or link, mirroring the print-parts upload.
  const [customPatternImage, setCustomPatternImage] = useState({
    inputType: "file", // "file" | "link"
    file: null,
    link: "",
  });

  // ── Issue 7: Brand Label + Care/Size Label spec + one shared design upload.
  // Two symmetric label specs; the design artwork is a single shared upload.
  const [brandLabel, setBrandLabel] = useState(EMPTY_LABEL);
  const [careLabel, setCareLabel] = useState(EMPTY_LABEL);
  const [labelDesign, setLabelDesign] = useState(EMPTY_LABEL_DESIGN);

  // Print Information State
  const [selectedPrintMethodId, setSelectedPrintMethodId] = useState(null);
  const [selectedSpecialPrint, setSelectedSpecialPrint] = useState("");
  const [specialPrints, setSpecialPrints] = useState([]);
  const [selectedPrintArea, setSelectedPrintArea] = useState("Regular");

  // Method-specific pricing inputs (Addendum 4.2–4.4). Only the fields
  // relevant to the selected print method are shown in the UI; the rest stay
  // at their defaults and are ignored by the backend dispatcher.
  //   embroidery_size: "small" | "large"
  //   embroidery_manual_price: number (large only)
  //   sublimation_type: "jersey_full" | "mesh_shorts_full" | "partial"
  //   sublimation_manual_price: number (partial only)
  //   dtf_rate_per_sq_inch: read-only display of the Superadmin rate
  const [methodConfig, setMethodConfig] = useState({
    embroidery_size: "small",
    embroidery_manual_price: 0,
    sublimation_type: "partial",
    sublimation_manual_price: 0,
  });
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
      const [quotationData, clientsRes, apparelPartsRes, necklinesRes, printMethodsRes, specialPrintsRes] = await Promise.all([
        quotationService.fetchAll(),
        clientApi.index(),
        apparelPartsApi.index(),
        apparelNecklineApi.index(),
        printMethodApi.index(),
        specialPrintApi.index(),
      ]);

      const clientsData = clientsRes.data || clientsRes || [];
      const apparelPartsData = apparelPartsRes.data || apparelPartsRes || [];
      const necklinesData = necklinesRes.data || necklinesRes || [];
      const printMethodsData = printMethodsRes.data || printMethodsRes || [];
      const specialPrintsData = specialPrintsRes.data || specialPrintsRes || [];

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
      setSpecialPrints(specialPrintsData);
      setColorBreakdowns([]);
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

  // True when the chosen fit/pattern is "Custom" — reveals the custom-pattern
  // reference upload (Issue 6). Same detection used for the ₱500 custom fee.
  const isCustomFit = useMemo(
    () => (selectedApparelPattern?.patternName || "").toLowerCase() === "custom",
    [selectedApparelPattern],
  );

  const selectedPrintMethod = useMemo(() => {
    return printMethods.find(
      (method) => Number(method.id) === Number(selectedPrintMethodId),
    ) || null;
  }, [printMethods, selectedPrintMethodId]);

  // Canonical method key, mirroring the backend's
  // QuotationService::resolvePrintMethodKey(). Drives which method-specific
  // input block is shown and which pricing fields are sent.
  const selectedMethodKey = useMemo(() => {
    const name = (selectedPrintMethod?.name || "").toLowerCase();
    if (name.includes("dtf") || name.includes("direct-to-film")) return "dtf";
    if (name.includes("embroid")) return "embroidery";
    if (name.includes("subli")) return "sublimation";
    if (name.includes("silk") || name.includes("screen")) return "silkscreen";
    return name ? name : "silkscreen";
  }, [selectedPrintMethod]);

  const filteredPrintMethods = useMemo(() => {
    return printMethods.filter((method) => {
      const name = method.name?.toLowerCase() || "";
      // Silkscreen has its own hardcoded option above; "high density" is a
      // special-print sub-option, not a standalone method. Sublimation IS a
      // first-class priced method (Addendum 4.4), so it stays selectable.
      return !name.includes("silkscreen") &&
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

  // Per-Color Quantity Breakdown — seed ONE colour group when a pattern is
  // picked and none exist yet. The group is the implicit single colour (blank
  // name) so the form degrades gracefully to the old single-list behaviour
  // until the CSR names colours or adds more.
  useEffect(() => {
    if (!selectedApparelPattern || colorBreakdowns.length > 0) {
      return;
    }

    setColorBreakdowns([buildColorGroup({ sizeOptions })]);
  }, [selectedApparelPattern, colorBreakdowns.length, sizeOptions]);

  // The aggregate size list that DRIVES PRICING. Per-colour is allocation/
  // display only: the engine prices the SUMMED quantity per size across every
  // colour (pooled silkscreen model — garment colour doesn't move the print
  // price). One row per distinct size, carrying the pattern ids + unit_price so
  // the items_json/preview payload shape is byte-for-byte what it was before.
  const items = useMemo(() => {
    const bySize = new Map();
    colorBreakdowns.forEach((group) => {
      (group.sizes || []).forEach((row) => {
        const key = normalizeSizeName(row.size_label);
        if (!key) return;
        const qty = Math.max(0, parseInt(row.quantity, 10) || 0);
        if (bySize.has(key)) {
          bySize.get(key).quantity += qty;
        } else {
          bySize.set(key, {
            id: row.size_id,
            size_id: row.size_id,
            size_label: row.size_label,
            quantity: qty,
            unit_price: 0,
            price_per_piece: 0,
            apparel_pattern_price_id: selectedApparelPattern?.id || null,
            apparel_type_id: selectedApparelPattern?.apparelTypeId || null,
            pattern_type_id: selectedApparelPattern?.patternTypeId || null,
          });
        }
      });
    });
    return Array.from(bySize.values());
  }, [colorBreakdowns, selectedApparelPattern]);

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
  const localSubtotal = totalAmount + totalAddons + sampleBreakdownTotal;
  const localDiscountAmount = quotationService.applyDiscount(localSubtotal, discount);
  const localGrandTotal = localSubtotal - localDiscountAmount;

  // Authoritative totals come from the backend preview endpoint (same pricing
  // engine as save), so the headline figures reflect the selected print method
  // and the Superadmin's rates. Fall back to the local estimate while the
  // preview is loading or unavailable.
  const subtotal = previewTotals?.subtotal ?? localSubtotal;
  const discountAmount = previewTotals?.discount_amount ?? localDiscountAmount;
  const grandTotal = previewTotals?.grand_total ?? localGrandTotal;
  const downPayment = previewTotals?.downpayment ?? grandTotal * 0.6;
  const balance = previewTotals?.balance ?? grandTotal * 0.4;

  // Per-line components for the Payment Summary, sourced from the SAME backend
  // preview as the headline total so every line reconciles with TOTAL. Falls
  // back to the local estimate only while the 350ms preview is in flight.
  const previewBreakdown = previewTotals?.breakdown_json || {};
  const itemsSubtotal = previewTotals
    ? (previewTotals.items_json || []).reduce(
        (sum, it) => sum + (Number(it.total_amount) || 0),
        0,
      )
    : totalAmount;
  const addonsSubtotal = previewTotals
    ? (previewTotals.addons_json || []).reduce(
        (sum, a) => sum + (Number(a.line_total) || 0),
        0,
      )
    : totalAddons;
  const sampleSubtotal = previewTotals
    ? Number(previewBreakdown?.sample_breakdown?.price_per_piece || 0)
    : sampleBreakdownTotal;
  const customPatternFee = Number(previewBreakdown?.custom_pattern_fee || 0);
  const dtfOrderTotal = Number(previewBreakdown?.dtf_order_total || 0);

  // Map the backend preview's per-size computed prices by size name. The
  // Price/Pc column and the cost breakdown read from THIS (the same engine
  // that produces the headline total), so a row's price can never disagree
  // with the total again. The local estimate is only a placeholder while the
  // 350ms-debounced preview is in flight.
  const previewItemsBySize = useMemo(() => {
    const map = {};
    (previewTotals?.items_json || []).forEach((it) => {
      const key = String(it.size ?? "").trim().toLowerCase();
      if (key) map[key] = it;
    });
    return map;
  }, [previewTotals]);

  const sizeNameForItem = (item) =>
    item.size_label ||
    sizeOptions.find((s) => Number(s.id) === Number(item.size_id))?.name ||
    "";

  const previewItemForRow = (item) =>
    previewItemsBySize[sizeNameForItem(item).trim().toLowerCase()] || null;

  // Authoritative per-piece price for a row: backend preview when available,
  // otherwise the local estimate while the preview loads.
  const rowPricePerPiece = (item) => {
    const pv = previewItemForRow(item);
    if (pv && pv.price_per_piece != null) return Number(pv.price_per_piece) || 0;
    return itemDetails.find((d) => d.id === item.id)?.pricePerPiece ?? 0;
  };

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
    // Keep the raw input so the field can be cleared/retyped on mobile without
    // snapping back to 1. Pricing reads via toNumber() (blank -> 0);
    // normalizeUnitCount() clamps to a valid count on blur.
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId) ? { ...c, unitCount: count } : c,
      ),
    );
  };

  const normalizeUnitCount = (colorId) => {
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId)
          ? { ...c, unitCount: Math.max(1, parseInt(c.unitCount, 10) || 1) }
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
    // Keep the raw input so the field can be cleared/retyped on mobile without
    // snapping back to 1. Pricing reads via toNumber() (blank -> 0);
    // normalizeFullUnitCount() clamps to a valid count on blur.
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId) ? { ...c, fullUnitCount: count } : c,
      ),
    );
  };

  const normalizeFullUnitCount = (colorId) => {
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId)
          ? { ...c, fullUnitCount: Math.max(1, parseInt(c.fullUnitCount, 10) || 1) }
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

  // DTF placement dimensions (Addendum 4.2): each placement carries its own
  // design width × height (inches) and piece count. Read by the backend
  // calculateDtfTotal().
  const updateWidth = (colorId, value) => {
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId)
          ? { ...c, width: Math.max(0, parseFloat(value) || 0) }
          : c,
      ),
    );
  };

  const updateHeight = (colorId, value) => {
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId)
          ? { ...c, height: Math.max(0, parseFloat(value) || 0) }
          : c,
      ),
    );
  };

  const updatePieces = (colorId, value) => {
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId)
          ? { ...c, pieces: Math.max(0, parseInt(value, 10) || 0) }
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

  const addColorGroup = () => {
    setColorBreakdowns((prev) => [...prev, buildColorGroup({ sizeOptions })]);
  };

  const removeColorGroup = (groupId) => {
    setColorBreakdowns((prev) =>
      prev.length <= 1 ? prev : prev.filter((g) => g.id !== groupId),
    );
  };

  const updateColorName = (groupId, color) => {
    setColorBreakdowns((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, color } : g)),
    );
  };

  const updateColorSizeQty = (groupId, sizeId, value) => {
    const qty = Math.max(0, parseInt(value, 10) || 0);
    setColorBreakdowns((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              sizes: g.sizes.map((s) =>
                Number(s.size_id) === Number(sizeId)
                  ? { ...s, quantity: qty }
                  : s,
              ),
            }
          : g,
      ),
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

  const handleReset = async () => {
    if (
      !(await confirm({
        title: "Reset quotation?",
        message: "This clears all the data you've entered on this form.",
        confirmLabel: "Reset",
        cancelLabel: "Cancel",
        tone: "danger",
      }))
    )
      return;

    setColorBreakdowns([]);
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
    // Issue 7: clear label spec + design upload
    setBrandLabel(EMPTY_LABEL);
    setCareLabel(EMPTY_LABEL);
    setLabelDesign(EMPTY_LABEL_DESIGN);
  };

  const itemConfigPayload = {
    apparel_pattern_price_id: toNullableId(selectedApparelPattern?.id),
    apparel_type_id: toNullableId(selectedApparelPattern?.apparelTypeId),
    pattern_type_id: toNullableId(selectedApparelPattern?.patternTypeId),

    // --- Print method (required by the backend pricing dispatcher) ---
    // QuotationService.resolvePrintMethodKey() reads print_method_name to
    // pick the silkscreen / dtf / embroidery / sublimation calculator.
    print_method_id: toNullableId(selectedPrintMethodId),
    print_method_name: selectedPrintMethod?.name || null,

    // --- Special Print (Addendum: per-color silkscreen surcharge) ---
    // Included here so the live PREVIEW applies the surcharge exactly like
    // the saved quote (the engine reads special_print from item_config or the
    // top-level field). Silkscreen-only; ignored by other methods.
    special_print: selectedSpecialPrint || null,

    // --- Custom-fit flag (one-time ₱500 pattern fee, Addendum 3.4) ---
    // True when the chosen pattern/fit is "Custom".
    pattern_type_name: selectedApparelPattern?.patternName || null,
    is_custom_fit:
      (selectedApparelPattern?.patternName || "").toLowerCase() === "custom",

    // --- Embroidery fields (Addendum 4.3) ---
    // Small = flat editable rate; Large = manual price entered by CSR.
    embroidery_size: methodConfig.embroidery_size || "small",
    embroidery_is_large: methodConfig.embroidery_size === "large",
    embroidery_manual_price:
      quotationService.toNumber(methodConfig.embroidery_manual_price) || 0,

    // --- Sublimation fields (Addendum 4.4) ---
    // jersey_full / mesh_shorts_full use editable flat rates; otherwise
    // the CSR enters a manual price (partial ~₱200).
    sublimation_type: methodConfig.sublimation_type || "partial",
    sublimation_manual_price:
      quotationService.toNumber(methodConfig.sublimation_manual_price) || 0,
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
      total_amount: item.total,
      apparel_pattern_price: item.apparelPatternPrice,
      neckline_price: item.necklinePrice,
      unit_price: item.unitPrice,
    })),
    // Per-Color Quantity Breakdown (display/allocation only). Sent so the
    // backend stores it in breakdown_json and the PDF renders per-colour
    // tables; pricing stays on the summed items above. Only positive-qty rows
    // are sent (keeps the PDF clean); the backend keeps named-but-empty groups.
    color_breakdowns: colorBreakdowns.map((g) => ({
      color: (g.color || "").trim(),
      sizes: (g.sizes || [])
        .map((s) => ({
          size: s.size_label,
          quantity: Math.max(0, parseInt(s.quantity, 10) || 0),
        }))
        .filter((s) => s.quantity > 0),
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

  // Pricing-relevant print parts for the preview (no images/files needed).
  // Maps over selectedColors — the same source the submit handler uses to
  // build print_parts_json.
  const printPartsPreview = (selectedColors || []).map((part) => {
    // Change 12: collapse the old regular/full colour split into ONE explicit
    // print type + ONE colour count per placement. A "Regular" placement uses
    // the regular colour count; a "Full" placement uses the full colour count.
    // This stops a Regular 1-colour front from being priced as a 2-colour full
    // print (the hidden fullUnitCount default).
    const isFull =
      (part.printSize || selectedPrintArea || "").toLowerCase() === "full";
    const numColors = isFull
      ? quotationService.toNumber(part.fullUnitCount || 0)
      : quotationService.toNumber(part.unitCount || 0);
    return {
      part: part.part || `Part ${part.colorId}`,
      print_type: isFull ? "full_print" : "regular",
      num_colors: numColors,
      color_count: numColors,
      // Legacy fields kept internally consistent (only the active type carries
      // colours) so no downstream reader sees a phantom colour on the other.
      unit_count: isFull ? 0 : numColors,
      full_unit_count: isFull ? numColors : 0,
      print_size: isFull ? "full" : "regular",
      is_full_print: isFull,
      width: quotationService.toNumber(part.width || 0),
      height: quotationService.toNumber(part.height || 0),
      pieces: quotationService.toNumber(part.pieces || 0),
    };
  });

  // Debounced live preview from the backend (single pricing source of truth).
  // Rebuilds whenever any pricing-relevant input changes; 350ms debounce keeps
  // it responsive without spamming the endpoint. Stale responses are ignored
  // via the `cancelled` guard so the last edit always wins.
  useEffect(() => {
    if (!data || items.length === 0 || !selectedApparelPattern) {
      setPreviewTotals(null);
      return;
    }

    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const totals = await quotationApi.preview({
          item_config_json: JSON.stringify(itemConfigPayload),
          items_json: JSON.stringify(compactItemsPayload),
          addons_json: JSON.stringify(formattedAddons),
          print_parts_json: JSON.stringify(printPartsPreview),
          apparel_neckline_id: formData.apparel_neckline_id || null,
          discount_type: discount?.type || null,
          discount_price: discount?.value || 0,
        });
        if (!cancelled) setPreviewTotals(totals);
      } catch (err) {
        // On failure, fall back to the local estimate rather than blocking.
        if (!cancelled) setPreviewTotals(null);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(itemConfigPayload),
    JSON.stringify(compactItemsPayload),
    JSON.stringify(formattedAddons),
    JSON.stringify(printPartsPreview),
    formData.apparel_neckline_id,
    discount?.type,
    discount?.value,
  ]);

  const handleSave = async () => {
    if (!selectedClientId) {
      await alert({
        title: "Select a client first",
        message: "Please search and select a client before saving.",
        tone: "danger",
      });
      return;
    }

    if (!selectedApparelPattern) {
      await alert({
        title: "Select an apparel/pattern",
        message: "Please select an Apparel/Pattern option before saving.",
        tone: "danger",
      });
      return;
    }

    if (items.length === 0) {
      await alert({
        title: "Add at least one item",
        message: "Please add at least one item to the quotation before saving.",
        tone: "danger",
      });
      return;
    }

    // Per-Color Quantity Breakdown must carry at least one piece — a quotation
    // with zero total quantity is meaningless (it prices to zero). Hard-block.
    const totalBreakdownQty = colorBreakdowns.reduce(
      (sum, g) =>
        sum +
        (g.sizes || []).reduce(
          (s, row) => s + (parseInt(row.quantity, 10) || 0),
          0,
        ),
      0,
    );
    if (totalBreakdownQty <= 0) {
      await alert({
        title: "Add quantities first",
        message:
          "Please enter at least one quantity in the Per-Color Quantity Breakdown before creating the quotation.",
        tone: "danger",
      });
      return;
    }

    // Issue 8 — Parts/design upload is now a SOFT requirement. A quotation can
    // be created without any apparel part selected (the backend already treats
    // print_parts_json as nullable). We surface a non-blocking confirm so the
    // CSR is aware, but creation is never hard-blocked on this.
    if (selectedColors.length === 0) {
      const proceed = await confirm({
        title: "No design added yet",
        message:
          "No apparel part / design has been added yet. You can add it later and send it to the Graphic Artist for review. Create the quotation anyway?",
        confirmLabel: "Create anyway",
        cancelLabel: "Go back",
        tone: "primary",
      });
      if (!proceed) return;
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

        // Change 12: one explicit print type + one colour count per placement
        // (mirrors printPartsPreview). Keeps the saved charge in sync with the
        // live preview and stops the Regular-1-colour -> Full-2-colour misprice.
        const isFull =
          (part.printSize || selectedPrintArea || "").toLowerCase() === "full";
        const numColors = isFull
          ? quotationService.toNumber(part.fullUnitCount || 0)
          : quotationService.toNumber(part.unitCount || 0);

        return {
          part_id: toNullableId(partOption?.id ?? part.colorId),
          part: partOption?.name || part.part || `Part ${part.colorId}`,
          print_type: isFull ? "full_print" : "regular",
          num_colors: numColors,
          color_count: numColors,
          unit_count: isFull ? 0 : numColors,
          price_per_unit: quotationService.toNumber(part.pricePerUnit),
          full_unit_count: isFull ? numColors : 0,
          price_per_full_unit: quotationService.toNumber(part.pricePerFullUnit || 0),
          // Per-placement print size flag for the silkscreen Regular/Full
          // rule (Addendum 4.1). Defaults to the order-level print area.
          print_size: isFull ? "full" : "regular",
          is_full_print: isFull,
          // DTF placement dimensions (Addendum 4.2): each placement has its
          // own design size and piece count. Read by calculateDtfTotal().
          width: quotationService.toNumber(part.width || 0),
          height: quotationService.toNumber(part.height || 0),
          pieces: quotationService.toNumber(part.pieces || 0),
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
      // Per-Color: derive shirt_color from the named colour groups (distinct,
      // in order) so the legacy scalar stays in sync; fall back to the typed
      // value when no colour is named. The backend derives the same way.
      const namedColors = [
        ...new Set(
          colorBreakdowns.map((g) => (g.color || "").trim()).filter(Boolean),
        ),
      ];
      formDataToSend.append(
        "shirt_color",
        namedColors.length ? namedColors.join(", ") : formData.shirt_color,
      );
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
            print_type: part.print_type,
            num_colors: part.num_colors,
            color_count: part.color_count,
            unit_count: part.unit_count,
            price_per_unit: part.price_per_unit,
            full_unit_count: part.full_unit_count,
            price_per_full_unit: part.price_per_full_unit,
            print_size: part.print_size,
            is_full_print: part.is_full_print,
            width: part.width,
            height: part.height,
            pieces: part.pieces,
            image_input_type: part.image_input_type,
            image_link: part.image_link,
          })),
        ),
      );

      printParts.forEach((part, index) => {
        if (part.image) {
          // Single file per print part. Matches the validator rule
          // `print_parts_files.*` => `nullable|file|image|...`
          formDataToSend.append(`print_parts_files[${index}]`, part.image);
        }
      });

      // Custom-pattern reference (Issue 6). Only sent when the fit is Custom.
      if (isCustomFit) {
        if (customPatternImage.inputType === "file" && customPatternImage.file) {
          formDataToSend.append("custom_pattern_image_file", customPatternImage.file);
        } else if (customPatternImage.inputType === "link" && customPatternImage.link?.trim()) {
          formDataToSend.append("custom_pattern_image", customPatternImage.link.trim());
        }
      }

      // ── Issue 7: Brand + Care/Size label spec + one shared design upload.
      formDataToSend.append("brand_label_json", JSON.stringify(brandLabel));
      formDataToSend.append("care_label_json", JSON.stringify(careLabel));
      if (labelDesign.inputType === "file" && labelDesign.file) {
        formDataToSend.append("label_design_file", labelDesign.file);
      } else if (labelDesign.inputType === "link" && labelDesign.link?.trim()) {
        formDataToSend.append("label_design_path", labelDesign.link.trim());
      }

      await quotationApi.create(formDataToSend);
      navigate("/quotations", { replace: true });
    } catch (error) {
      console.error("Error saving quotation:", error);

      // Structured-error mapping (Change 13).
      const parsed = parseApiError(error);
      if (parsed.type === "validation" && Object.keys(parsed.fields).length) {
        const lines = Object.entries(parsed.fields).map(
          ([field, msg]) => `• ${field}: ${msg}`,
        );
        await alert({
          title: "Validation failed",
          message: `Please fix the following:\n\n${lines.join("\n")}`,
          tone: "danger",
        });
      } else {
        await alert({
          title: "Couldn't save quotation",
          message: parsed.message,
          tone: "danger",
        });
      }
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

  // Issue 8 — the form is ready once an apparel/pattern is chosen (pricing
  // needs it). Parts/design are optional and no longer gate the form.
  const hasSelections = !!selectedApparelPattern;

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
          <OrderInfoSection
            formData={formData}
            hideShirtColor={true}
            onFieldChange={(field, value) => setOrderInfo((prev) => ({ ...prev, [field]: value }))}
            clientSearchTerm={clientSearchTerm}
            onClientSearchChange={handleClientSearchChange}
            filteredClients={filteredClients}
            normalizeClientBrands={normalizeClientBrands}
            onSelectClient={handleSelectClient}
            selectedClientId={selectedClientId}
            selectedClientBrands={selectedClientBrands}
          />

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

              {/* Custom-pattern reference upload (Issue 6). Shown only when the
                  chosen fit is "Custom" — lets the CSR attach the client's
                  drawn/reference pattern (file or link) for the GA/production. */}
              {isCustomFit && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
                  <label className="block text-xs font-semibold text-primary">
                    Custom Pattern Reference
                  </label>
                  <p className="text-[11px] text-gray-500">
                    Attach the client's drawn or reference pattern (a one-time ₱500 custom fee applies).
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomPatternImage((p) => ({ ...p, inputType: "file" }))}
                      className={`px-2 py-1 text-[11px] rounded border ${(customPatternImage.inputType || "file") === "file" ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200"}`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomPatternImage((p) => ({ ...p, inputType: "link" }))}
                      className={`px-2 py-1 text-[11px] rounded border ${customPatternImage.inputType === "link" ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200"}`}
                    >
                      Link
                    </button>
                  </div>
                  {customPatternImage.inputType === "link" ? (
                    <input
                      type="url"
                      value={customPatternImage.link || ""}
                      onChange={(e) => setCustomPatternImage((p) => ({ ...p, link: e.target.value }))}
                      placeholder="https://drive.google.com/... or Canva link"
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                    />
                  ) : (
                    <FileUpload
                      label="Upload Pattern Reference"
                      name="custom-pattern-image"
                      value={customPatternImage.file ? [customPatternImage.file] : []}
                      onChange={(e) => setCustomPatternImage((p) => ({ ...p, file: e.target.value?.[0] || null }))}
                      acceptedTypes="image/*"
                      multiple={false}
                      hideUploadWhenHasFiles
                      hidePreviewWhenEmpty
                      className="px-0"
                    />
                  )}
                </div>
              )}

              {/* Issue 7: Brand + Care/Size label spec (shared component). */}
              <LabelSpecSection
                brandLabel={brandLabel}
                careLabel={careLabel}
                onBrandLabelChange={setBrandLabel}
                onCareLabelChange={setCareLabel}
                labelDesign={labelDesign}
                onLabelDesignChange={setLabelDesign}
              />

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
                          {specialPrints.map((sp) => (
                            <option key={sp.id} value={sp.name}>
                              {sp.name}
                            </option>
                          ))}
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

                  {/* Embroidery (Addendum 4.3): Small = flat editable rate;
                      Large = manual price entered by CSR. */}
                  {selectedMethodKey === "embroidery" && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Embroidery Size</label>
                        <select
                          value={methodConfig.embroidery_size}
                          onChange={(e) =>
                            setMethodConfig((prev) => ({ ...prev, embroidery_size: e.target.value }))
                          }
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="small">Small (pocket / left chest) — flat rate</option>
                          <option value="large">Large — manual price</option>
                        </select>
                      </div>

                      {methodConfig.embroidery_size === "large" && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Manual Price / piece (₱)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={methodConfig.embroidery_manual_price || ""}
                            onChange={(e) =>
                              setMethodConfig((prev) => ({ ...prev, embroidery_manual_price: e.target.value }))
                            }
                            placeholder="Subcontractor quote + markup"
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Sublimation (Addendum 4.4): Jersey/Mesh full use editable
                      flat rates; partial uses a manual price (~₱200). */}
                  {selectedMethodKey === "sublimation" && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Sublimation Type</label>
                        <select
                          value={methodConfig.sublimation_type}
                          onChange={(e) =>
                            setMethodConfig((prev) => ({ ...prev, sublimation_type: e.target.value }))
                          }
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="jersey_full">Full Jersey — flat rate</option>
                          <option value="mesh_shorts_full">Full Mesh Shorts — flat rate</option>
                          <option value="partial">Partial / Other — manual price</option>
                        </select>
                      </div>

                      {methodConfig.sublimation_type === "partial" && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Manual Price / piece (₱)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={methodConfig.sublimation_manual_price || ""}
                            onChange={(e) =>
                              setMethodConfig((prev) => ({ ...prev, sublimation_manual_price: e.target.value }))
                            }
                            placeholder="e.g. 200"
                            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* DTF (Addendum 4.2): per-square-inch rate set by Superadmin.
                      Each placement's design size + piece count is entered in the
                      print parts section below; this note guides the CSR. */}
                  {selectedMethodKey === "dtf" && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                      <p className="text-xs text-amber-800">
                        DTF is priced per square inch. Enter each placement&apos;s
                        design <strong>width</strong>, <strong>height</strong>, and
                        <strong> pieces</strong> in the print details below. The rate
                        is set by the Superadmin in Pricing Settings.
                      </p>
                    </div>
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
                <label className="block text-xs font-medium text-gray-600 mb-1">Parts (optional)</label>
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
                                className={`px-2 py-1 text-[11px] rounded border ${(part.imageInputType || "file") === "file"
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white text-gray-600 border-gray-200"
                                  }`}
                              >
                                File Upload
                              </button>
                              <button
                                type="button"
                                onClick={() => updateColorInputType(part.colorId, "link")}
                                className={`px-2 py-1 text-[11px] rounded border ${part.imageInputType === "link"
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
                            {/* Generic unit-count / price inputs. Hidden for DTF,
                                which uses the dedicated Width/Height/Pieces block
                                below (per-square-inch pricing, Addendum 4.2). */}
                            {selectedMethodKey !== "dtf" && (
                              <>
                                <label className="block text-xs font-medium text-gray-600 mb-1">{printMethodLabels.unitLabel}</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={part.unitCount ?? ""}
                                  onChange={(e) => updateUnitCount(part.colorId, e.target.value)}
                                  onBlur={() => normalizeUnitCount(part.colorId)}
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
                              </>
                            )}

                            {selectedPrintMethodId === silkscreenMethodId && selectedPrintArea === "Full" && (
                              <>
                                <div className="pt-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Number of Full Colors</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={part.fullUnitCount ?? ""}
                                    onChange={(e) => updateFullUnitCount(part.colorId, e.target.value)}
                                    onBlur={() => normalizeFullUnitCount(part.colorId)}
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

                            {/* DTF placement dimensions (Addendum 4.2). Per
                                placement: design width × height (inches) and
                                piece count. Charge = (w × h) × rate × pieces. */}
                            {selectedMethodKey === "dtf" && (
                              <div className="pt-2 space-y-2 border-t border-dashed border-gray-200 mt-2">
                                <p className="text-[11px] font-semibold text-gray-500">DTF Design Size (inches)</p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.1"
                                      value={part.width ?? 0}
                                      onChange={(e) => updateWidth(part.colorId, e.target.value)}
                                      placeholder="in"
                                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.1"
                                      value={part.height ?? 0}
                                      onChange={(e) => updateHeight(part.colorId, e.target.value)}
                                      placeholder="in"
                                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Pieces (for this placement)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={part.pieces ?? 0}
                                    onChange={(e) => updatePieces(part.colorId, e.target.value)}
                                    placeholder="qty"
                                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                                  />
                                </div>
                              </div>
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
              <div className="px-4 py-3 bg-primary/5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-primary">
                  <i className="fas fa-tshirt mr-2"></i>Per-Color Quantity Breakdown
                </h3>
                <button
                  type="button"
                  onClick={addColorGroup}
                  className="px-2.5 py-1 text-xs rounded-lg bg-primary text-white hover:bg-primary/90"
                >
                  <i className="fas fa-plus mr-1"></i>Add Color
                </button>
              </div>
              <div className="p-3 space-y-3">
                {colorBreakdowns.map((group, gIdx) => {
                  const groupQty = (group.sizes || []).reduce(
                    (sum, s) => sum + (parseInt(s.quantity, 10) || 0),
                    0,
                  );
                  return (
                    <div
                      key={group.id}
                      className="rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <div className="px-3 py-2 bg-light/40 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">
                          Color {gIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={group.color || ""}
                          onChange={(e) => updateColorName(group.id, e.target.value)}
                          placeholder="e.g. Black"
                          className="flex-1 min-w-[7rem] px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSwatchPickerGroupId(group.id)}
                            title="Pick from fabric swatches"
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded bg-light/60 text-primary border border-gray-200 hover:bg-primary/10 whitespace-nowrap"
                          >
                            <i className="fas fa-palette"></i>
                            <span className="sm:hidden">Pick</span>
                          </button>
                          <span className="text-[11px] text-gray-500 whitespace-nowrap">
                            {groupQty} pcs
                          </span>
                          <button
                            type="button"
                            onClick={() => removeColorGroup(group.id)}
                            disabled={colorBreakdowns.length <= 1}
                            title={
                              colorBreakdowns.length <= 1
                                ? "At least one color is required"
                                : "Remove this color"
                            }
                            className="px-2.5 py-1.5 text-xs rounded bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-light/50 border-b border-gray-200">
                            <tr>
                              <th className="px-2 py-2 text-left">Size</th>
                              <th className="px-2 py-2 text-right w-24">Qty</th>
                              <th className="px-2 py-2 text-right w-28">Price/Pc</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {(group.sizes || []).map((row) => (
                              <tr key={row.id} className="hover:bg-light/30">
                                <td className="px-2 py-1.5 text-gray-700">
                                  {row.size_label}
                                </td>
                                <td className="px-2 py-1.5">
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.quantity ?? 0}
                                    onChange={(e) =>
                                      updateColorSizeQty(
                                        group.id,
                                        row.size_id,
                                        e.target.value,
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
                                    value={rowPricePerPiece({
                                      size_label: row.size_label,
                                      size_id: row.size_id,
                                    })}
                                    className="w-full px-1 py-1 text-xs text-right border border-gray-200 rounded bg-gray-50 text-gray-600"
                                    readOnly
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
                <p className="text-[11px] text-gray-400">
                  Price/Pc is the same for every color — it depends on the print,
                  not the garment color. Quantities are tracked per color so
                  production knows how many of each to cut and make.
                </p>
                <SwatchPickerModal
                  open={!!swatchPickerGroupId}
                  currentValue={
                    colorBreakdowns.find((g) => g.id === swatchPickerGroupId)?.color || ""
                  }
                  onClose={() => setSwatchPickerGroupId(null)}
                  onSelect={(name) => {
                    if (swatchPickerGroupId) updateColorName(swatchPickerGroupId, name);
                    setSwatchPickerGroupId(null);
                  }}
                />
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
                                  ?.name || item.size_label || "Unknown";

                              // Prefer the backend preview's computed numbers
                              // for this size so every figure agrees with the
                              // headline total; fall back to the local estimate.
                              const pv = previewItemForRow(item);
                              const basePrice = pv?.base_price ?? item.apparelPatternPrice ?? 0;
                              const printTotal = pv?.print_parts_total ?? item.colorPrice ?? 0;
                              const pricePerPiece = pv?.price_per_piece ?? item.pricePerPiece ?? 0;
                              const rowTotal =
                                pv?.total_amount ??
                                item.total ??
                                pricePerPiece * (item.quantity ?? 0);

                              return (
                                <tr key={item.id} className="hover:bg-white/50">
                                  <td className="px-3 py-2 font-medium text-primary">{sizeName}</td>
                                  <td className="px-3 py-2 text-center">{item.quantity}</td>
                                  <td className="px-3 py-2 text-right">
                                    ₱{Number(basePrice).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right">₱{item.necklinePrice.toLocaleString()}</td>
                                  <td className="px-3 py-2 text-right">₱{Number(printTotal).toLocaleString()}</td>
                                  <td className="px-3 py-2 text-right">₱{item.unitPrice.toLocaleString()}</td>
                                  <td className="px-3 py-2 text-right font-semibold">₱{Number(pricePerPiece).toLocaleString()}</td>
                                  <td className="px-3 py-2 text-right font-bold text-primary">₱{Number(rowTotal).toLocaleString()}</td>
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
                      <span className="text-sm font-medium">₱{itemsSubtotal.toLocaleString()}</span>
                    </div>
                    {addonsSubtotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Addons</span>
                        <span className="text-sm font-medium">₱{addonsSubtotal.toLocaleString()}</span>
                      </div>
                    )}
                    {sampleSubtotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Sample</span>
                        <span className="text-sm font-medium">₱{sampleSubtotal.toLocaleString()}</span>
                      </div>
                    )}
                    {customPatternFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Custom pattern fee</span>
                        <span className="text-sm font-medium">₱{customPatternFee.toLocaleString()}</span>
                      </div>
                    )}
                    {dtfOrderTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">DTF print</span>
                        <span className="text-sm font-medium">₱{dtfOrderTotal.toLocaleString()}</span>
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
              Select an Apparel/Pattern to start creating your quotation. Parts/design are optional.
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
      {dialog}
    </AdminLayout>
  );
};

export default Quotation;