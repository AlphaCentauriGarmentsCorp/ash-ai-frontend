import React, { useEffect, useMemo, useState } from "react";
import useConfirm from "../../hooks/useConfirm";
import { parseApiError } from "../../utils/parseApiError";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import { quotationService } from "../../services/quotationService";
import { quotationApi } from "../../api/quotationApi";
import { quotationShareApi } from "../../api/quotationShareApi";
import { clientApi } from "../../api/clientApi";
import { apparelPartsApi } from "../../api/apparelPartsApi";
import { apparelNecklineApi } from "../../api/apparelNecklineApi";
import { printMethodApi } from "../../api/printMethodApi";
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

const getDefaultSizeUnitPrice = () => 0;

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

// Per-Color Quantity Breakdown: a colour group owns its own size/qty list.
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

// Hydrate per-colour editor state from a saved quotation.
//  - breakdown_json.color_breakdowns present -> rebuild each group, resolving
//    size_id from the size name and preserving saved quantities.
//  - legacy colour-less quote -> ONE implicit group seeded from the existing
//    per-size rows, named after the quote's typed shirt_color (nothing lost).
const hydrateColorGroups = ({
  sizeOptions,
  savedColorBreakdowns,
  existingItems,
  fallbackColor,
}) => {
  const newId = () => `cg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const saved = Array.isArray(savedColorBreakdowns) ? savedColorBreakdowns : [];

  if (saved.length > 0) {
    return saved.map((group) => {
      const byName = new Map();
      (Array.isArray(group?.sizes) ? group.sizes : []).forEach((s) => {
        byName.set(
          normalizeSizeName(s.size ?? s.size_label),
          Math.max(0, parseInt(s.quantity, 10) || 0),
        );
      });
      return {
        id: newId(),
        color: (group?.color || "").trim(),
        sizes: (sizeOptions || []).map((option) => ({
          id: `${option.id}`,
          size_id: option.id,
          size_label: option.name,
          quantity: byName.get(normalizeSizeName(option.name)) || 0,
        })),
      };
    });
  }

  const existingByName = new Map();
  (Array.isArray(existingItems) ? existingItems : []).forEach((it) => {
    existingByName.set(
      normalizeSizeName(it.size_label || it.size),
      Math.max(0, parseInt(it.quantity, 10) || 0),
    );
  });
  return [
    {
      id: newId(),
      color: (fallbackColor || "").trim(),
      sizes: (sizeOptions || []).map((option) => ({
        id: `${option.id}`,
        size_id: option.id,
        size_label: option.name,
        quantity: existingByName.get(normalizeSizeName(option.name)) || 0,
      })),
    },
  ];
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const parseJsonField = (value, fallback) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
};

const toStorageUrl = (path) => {
  const rawPath = String(path || "").trim();
  if (!rawPath) return "";

  if (rawPath.startsWith("http") || rawPath.startsWith("data:")) {
    return rawPath;
  }

  const apiUrl = import.meta.env.VITE_API_URL || "";
  let origin = "";
  try {
    origin = new URL(apiUrl).origin;
  } catch {
    origin = "";
  }

  if (rawPath.startsWith("/storage/")) {
    return origin ? `${origin}${rawPath}` : rawPath;
  }

  if (rawPath.startsWith("storage/")) {
    return origin ? `${origin}/${rawPath}` : `/${rawPath}`;
  }

  const cleanedPath = rawPath.replace(/^\/+/, "");
  return origin ? `${origin}/storage/${cleanedPath}` : `/storage/${cleanedPath}`;
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

const EditQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { confirm, alert, dialog } = useConfirm();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);

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
  // Custom-pattern reference (Issue 6); mirrors the Add page.
  const [customPatternImage, setCustomPatternImage] = useState({
    inputType: "file",
    file: null,
    link: "",
  });

  // ── Issue 7: Brand Label + Care/Size Label spec + one shared design upload.
  // Mirrors the Add page; hydrated from the loaded quotation in loadData().
  const [brandLabel, setBrandLabel] = useState(EMPTY_LABEL);
  const [careLabel, setCareLabel] = useState(EMPTY_LABEL);
  const [labelDesign, setLabelDesign] = useState(EMPTY_LABEL_DESIGN);

  // Print Information State
  const [selectedPrintMethodId, setSelectedPrintMethodId] = useState(null);
  const [selectedSpecialPrint, setSelectedSpecialPrint] = useState("");
  const [selectedPrintArea, setSelectedPrintArea] = useState("Regular");
  const [silkscreenMethodId, setSilkscreenMethodId] = useState(null);

  // Method-specific pricing inputs (Addendum 4.2–4.4) + backend-driven preview.
  const [methodConfig, setMethodConfig] = useState({
    embroidery_size: "small",
    embroidery_manual_price: 0,
    sublimation_type: "partial",
    sublimation_manual_price: 0,
  });
  const [previewTotals, setPreviewTotals] = useState(null);

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

  const isCustomFit = useMemo(
    () => (selectedApparelPattern?.patternName || "").toLowerCase() === "custom",
    [selectedApparelPattern],
  );

  const selectedPrintMethod = useMemo(() => {
    return printMethods.find(
      (method) => Number(method.id) === Number(selectedPrintMethodId),
    ) || null;
  }, [printMethods, selectedPrintMethodId]);

  // Canonical method key, mirroring the backend's resolvePrintMethodKey().
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
      // Silkscreen has its own hardcoded option; "high density" is a special-
      // print sub-option. Sublimation IS a first-class priced method.
      return !name.includes("silkscreen") &&
        !name.includes("high density");
    });
  }, [printMethods]);

  const printMethodLabels = useMemo(() => {
    const methodName = selectedPrintMethod?.name?.toLowerCase() || "";

    if (methodName.includes("dtf")) {
      return {
        colorLabel: "Meters",
      };
    }

    if (methodName.includes("embroidery")) {
      return {
        colorLabel: "Size",
      };
    }

    return {
      colorLabel: "Number of Colors",
    };
  }, [selectedPrintMethod]);

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
    loadData();
  }, [id]);

  // Defensive seed: one implicit colour group if a pattern is selected and
  // none exist (hydration normally fills these on load).
  useEffect(() => {
    if (!selectedApparelPattern || colorBreakdowns.length > 0) {
      return;
    }
    setColorBreakdowns([buildColorGroup({ sizeOptions })]);
  }, [selectedApparelPattern, colorBreakdowns.length, sizeOptions]);

  // Aggregate size list that DRIVES PRICING — summed quantity per size across
  // every colour (pooled silkscreen; garment colour doesn't move price). One
  // row per distinct size, same items_json/preview payload shape as before.
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [quotationRes, masterData, clientsRes, apparelPartsRes, necklinesRes, printMethodsRes] = await Promise.all([
        quotationApi.show(id),
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
      }

      setData({
        ...masterData,
        apparelParts: apparelPartsData,
      });
      setApparelParts(apparelPartsData);
      setNecklines(necklinesData);
      setClients(clientsData);
      setPrintMethods(printMethodsData);

      const quotation = quotationRes.data || quotationRes;

      setOrderInfo({
        client_name: quotation.client_name || "",
        client_email: quotation.client_email || "",
        client_facebook: quotation.client_facebook || quotation.facebook || "",
        brand: quotation.client_brand || "",
        shirt_color: quotation.shirt_color || "",
        apparel_neckline_id:
          quotation.apparel_neckline_id ||
          quotation.neckline_id ||
          quotation.neckline?.id ||
          "",
        free_items: quotation.free_items || "",
        notes: quotation.notes || "",
      });

      const matchedClient = clientsData.find((client) => {
        const byId =
          quotation.client_id && Number(client.id) === Number(quotation.client_id);
        const byName =
          normalizeText(client.name) === normalizeText(quotation.client_name);
        const byEmail =
          quotation.client_email &&
          normalizeText(client.email) === normalizeText(quotation.client_email);
        return byId || byName || byEmail;
      });

      if (matchedClient) {
        const brands = normalizeClientBrands(matchedClient);
        setSelectedClientId(matchedClient.id);
        setClientSearchTerm(matchedClient.name || "");
        setOrderInfo((prev) => ({
          ...prev,
          client_name: matchedClient.name || prev.client_name,
          client_email: matchedClient.email || prev.client_email,
          client_facebook: matchedClient.facebook || prev.client_facebook,
          brand: prev.brand || brands[0] || "",
        }));
      }

      setDiscount({
        type: quotation.discount_type || "percentage",
        value: quotation.discount_price || 0,
      });

      // Load print method information
      const printMethodId = quotation.print_method_id || silkscreenMethod?.id || null;
      setSelectedPrintMethodId(printMethodId);
      setSelectedSpecialPrint(quotation.special_print || "");
      setSelectedPrintArea(quotation.print_area || "Regular");

      // Restore the custom-pattern reference (Issue 6). Stored as a path/link
      // string; surface it as a "link" so the CSR can see/replace it. A newly
      // uploaded file would override it on save.
      if (quotation.custom_pattern_image) {
        setCustomPatternImage({
          inputType: "link",
          file: null,
          link: quotation.custom_pattern_image,
        });
      }

      // Restore the Issue 7 label spec. brand_label / care_label come back as
      // objects (JSON-cast on the backend); merge onto the empty defaults so a
      // partially-filled or missing label still yields a complete shape. The
      // shared design is surfaced via existingPath (Edit shows the saved value;
      // a new file/link on save overrides it).
      if (quotation.brand_label && typeof quotation.brand_label === "object") {
        setBrandLabel({ ...EMPTY_LABEL, ...quotation.brand_label });
      }
      if (quotation.care_label && typeof quotation.care_label === "object") {
        setCareLabel({ ...EMPTY_LABEL, ...quotation.care_label });
      }
      if (quotation.label_design_path) {
        setLabelDesign({
          ...EMPTY_LABEL_DESIGN,
          existingPath: quotation.label_design_path,
        });
      }

      const parsedItems =
        typeof quotation.items_json === "string"
          ? JSON.parse(quotation.items_json || "[]")
          : quotation.items_json || quotation.items || [];

      const parsedItemConfig =
        typeof quotation.item_config_json === "string"
          ? JSON.parse(quotation.item_config_json || "{}")
          : quotation.item_config_json || quotation.item_config || {};

      const parsedAddons =
        typeof quotation.addons_json === "string"
          ? JSON.parse(quotation.addons_json || "[]")
          : quotation.addons_json || quotation.addons || [];

      const parsedParts =
        Array.isArray(quotation.print_parts) && quotation.print_parts.length > 0
          ? quotation.print_parts
          : typeof quotation.print_parts_json === "string"
            ? JSON.parse(quotation.print_parts_json || "[]")
            : quotation.print_parts_json || [];

      const parsedBreakdown = parseJsonField(
        quotation.breakdown_json,
        quotation.breakdown || {},
      );
      const parsedSampleBreakdown =
        quotation.sample_breakdown || parsedBreakdown?.sample_breakdown || {};

      setSampleBreakdown({
        unit_price:
          parsedSampleBreakdown?.unit_price !== undefined &&
            parsedSampleBreakdown?.unit_price !== null &&
            parsedSampleBreakdown?.unit_price !== ""
            ? quotationService.toNumber(parsedSampleBreakdown.unit_price)
            : 1000,
        quantity: Math.max(
          0,
          parseInt(parsedSampleBreakdown.quantity, 10) || 0,
        ),
      });

      const mappedItems = parsedItems.map((item, index) => {
        const apparelPatternPriceId =
          parsedItemConfig.apparel_pattern_price_id ||
          item.apparel_pattern_price_id ||
          item.apparelPatternPriceId ||
          null;

        const apparelTypeId =
          parsedItemConfig.apparel_type_id || item.apparel_type_id || null;

        const patternTypeId =
          parsedItemConfig.pattern_type_id || item.pattern_type_id || null;

        return {
          id: index + 1,
          size_id: item.size_id || sizeOptions[0]?.id || 1,
          size_label: item.size || "",
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          price_per_piece: item.price_per_piece || 0,
          apparel_pattern_price_id: apparelPatternPriceId,
          apparel_type_id: apparelTypeId,
          pattern_type_id: patternTypeId,
        };
      });

      if (parsedItemConfig.apparel_pattern_price_id) {
        setSelectedApparelPatternId(parsedItemConfig.apparel_pattern_price_id);
      } else if (mappedItems.length > 0) {
        const first = mappedItems[0];

        if (first.apparel_pattern_price_id) {
          setSelectedApparelPatternId(first.apparel_pattern_price_id);
        } else {
          const fallbackMatch = (masterData.apparelPatternPrices || []).find((row) => {
            const rowApparelId = Number(
              row.apparel_type_id ?? row.apparelType?.id ?? row.apparel_type?.id,
            );
            const rowPatternId = Number(
              row.pattern_type_id ?? row.patternType?.id ?? row.pattern_type?.id,
            );

            return (
              rowApparelId === Number(first.apparel_type_id) &&
              rowPatternId === Number(first.pattern_type_id)
            );
          });

          if (fallbackMatch) {
            setSelectedApparelPatternId(fallbackMatch.id);
          }
        }
      }

      const addonIds = parsedAddons
        .map((addon) => {
          const found = masterData.addons?.find((a) => a.name === addon.name);
          return found?.id;
        })
        .filter(Boolean);

      setSelectedAddons(addonIds);

      const mappedParts = parsedParts
        .map((part, index) => {
          const partId = Number(part.part_id || part.partId || part.id);
          const partName = normalizeText(part.part);
          const matchedPart = apparelPartsData.find(
            (option) => Number(option.id) === partId,
          ) || apparelPartsData.find(
            (option) => normalizeText(option.name) === partName,
          );

          const fallbackId = matchedPart?.id || partId || part.part || index + 1;
          const partLabel = matchedPart?.name || part.part || "Unknown Part";
          const imagePath =
            part.image_link || part.image_url || part.image_path || part.image || "";
          const resolvedImageLink = toStorageUrl(imagePath);
          const normalizedInputType = String(
            part.image_input_type || (part.image_link ? "link" : "file"),
          ).toLowerCase();

          return {
            colorId: fallbackId,
            partId: fallbackId,
            part: partLabel,
            part_description: matchedPart?.description || "",
            file: null,
            imageInputType: normalizedInputType === "link" ? "link" : "file",
            imageLink: resolvedImageLink,
            existingImageUrl: resolvedImageLink,
            existingImageRawPath: String(imagePath || "").trim(),
            colorCount: Math.max(1, parseInt(part.color_count, 10) || 1),
            pricePerColor:
              part?.price_per_color !== undefined &&
                part?.price_per_color !== null &&
                part?.price_per_color !== ""
                ? quotationService.toNumber(part.price_per_color)
                : 20,
            fullColorCount: Math.max(1, parseInt(part.full_color_count, 10) || 1),
            pricePerFullColor: quotationService.toNumber(part.price_per_full_color || 0),
          };
        })
        .filter(Boolean);


      const selectedPatternCandidate =
        mappedItems.length > 0
          ? apparelPatternOptions.find(
            (row) => Number(row.id) === Number(mappedItems[0].apparel_pattern_price_id),
          ) || null
          : null;

      const resolvedPattern = selectedPatternCandidate || {
        id:
          parsedItemConfig.apparel_pattern_price_id ||
          mappedItems[0]?.apparel_pattern_price_id ||
          null,
        apparelTypeId:
          parsedItemConfig.apparel_type_id || mappedItems[0]?.apparel_type_id || null,
        patternTypeId:
          parsedItemConfig.pattern_type_id || mappedItems[0]?.pattern_type_id || null,
      };

      const normalizedItems = buildDefaultSizeRows({
        sizeOptions,
        selectedApparelPattern: resolvedPattern,
        existingItems: mappedItems,
      });

      setColorBreakdowns(
        hydrateColorGroups({
          sizeOptions,
          savedColorBreakdowns: parsedBreakdown?.color_breakdowns,
          existingItems: normalizedItems,
          fallbackColor: quotation.shirt_color || "",
        }),
      );

      if (mappedParts.length > 0) {
        setSelectedColors(mappedParts);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      await alert({
        title: "Couldn't load quotation",
        message: "Failed to load quotation data. Please try again.",
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Authoritative totals from the backend preview (same engine as save).
  const subtotal = previewTotals?.subtotal ?? localSubtotal;
  const discountAmount = previewTotals?.discount_amount ?? localDiscountAmount;
  const grandTotal = previewTotals?.grand_total ?? localGrandTotal;
  const downPayment = previewTotals?.downpayment ?? grandTotal * 0.6;
  const balance = previewTotals?.balance ?? grandTotal * 0.4;

  // Per-line Payment Summary components from the SAME backend preview as the
  // headline total, so every line reconciles with TOTAL (local is placeholder).
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

  // Authoritative per-size prices from the backend preview (same engine as the
  // total), keyed by size — keeps the Price/Pc column and breakdown in sync
  // with the headline total. Local estimate is only a loading placeholder.
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
          existingImageUrl: "",
          existingImageRawPath: "",
          colorCount: 1,
          pricePerColor: 20,
          fullColorCount: 1,
          pricePerFullColor: 0,
        },
      ];
    });
  };

  const updateColorFile = (colorId, file) => {
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId)
          ? { ...c, file, imageInputType: "file", imageLink: file ? "" : c.imageLink }
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

        return { ...c, imageInputType: "file" };
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

  const updateColorCount = (colorId, count) => {
    // Keep the raw input so the field can be cleared/retyped on mobile without
    // snapping back to 1. Pricing reads via toNumber() (blank -> 0);
    // normalizeColorCount() clamps to a valid count on blur.
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId) ? { ...c, colorCount: count } : c,
      ),
    );
  };

  const normalizeColorCount = (colorId) => {
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId)
          ? { ...c, colorCount: Math.max(1, parseInt(c.colorCount, 10) || 1) }
          : c,
      ),
    );
  };

  const updateFullColorCount = (colorId, count) => {
    // Keep the raw input so the field can be cleared/retyped on mobile without
    // snapping back to 1. Pricing reads via toNumber() (blank -> 0);
    // normalizeFullColorCount() clamps to a valid count on blur.
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId) ? { ...c, fullColorCount: count } : c,
      ),
    );
  };

  const normalizeFullColorCount = (colorId) => {
    setSelectedColors((prev) =>
      prev.map((c) =>
        Number(c.colorId) === Number(colorId)
          ? { ...c, fullColorCount: Math.max(1, parseInt(c.fullColorCount, 10) || 1) }
          : c,
      ),
    );
  };

  // DTF placement dimensions (Addendum 4.2). Mirrors the Add page; read by the
  // backend calculateDtfTotal() via the print_parts_json width/height/pieces.
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
        ? prev.filter((idToRemove) => idToRemove !== addonId)
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

  const extractShareLink = (payload) => {
    const data = payload?.data || payload || {};

    const buildFrontendShareUrl = (tokenValue) => {
      const tokenText = String(tokenValue || "").trim();
      return tokenText ? `${window.location.origin}/share/quotations/${tokenText}` : "";
    };

    const extractTokenFromUrl = (rawUrl) => {
      const urlText = String(rawUrl || "").trim();
      if (!urlText) return "";

      const fromPath = urlText.match(/\/(?:share\/quotations|quotations\/share)\/([^/?#]+)/i);
      if (fromPath?.[1]) return fromPath[1];

      try {
        const parsed = new URL(urlText, window.location.origin);
        return (
          parsed.searchParams.get("token")
          || parsed.searchParams.get("share_token")
          || ""
        );
      } catch {
        return "";
      }
    };

    const directUrl =
      data.share_url ||
      data.public_url ||
      data.upload_url ||
      data.url ||
      data.link ||
      "";

    if (directUrl) {
      const tokenFromUrl = extractTokenFromUrl(directUrl);
      if (tokenFromUrl) {
        return buildFrontendShareUrl(tokenFromUrl);
      }

      const normalizedDirect = String(directUrl).trim();
      if (normalizedDirect.startsWith("/")) {
        return `${window.location.origin}${normalizedDirect}`;
      }

      return normalizedDirect;
    }

    const token =
      data.token ||
      data.share_token ||
      data.access_token ||
      data?.share?.token ||
      data?.shareToken?.token ||
      "";

    return buildFrontendShareUrl(token);
  };

  const handleGenerateShareUploadLink = async () => {
    setIsGeneratingShareLink(true);
    try {
      const response = await quotationShareApi.generate(id, {
        permission: "edit",
        allow_download: false,
      });

      const shareLink = extractShareLink(response);
      if (!shareLink) {
        await alert({
          title: "No link returned",
          message: "A share token was generated, but no public link was returned by the API.",
          tone: "danger",
        });
        return;
      }

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareLink);
        await alert({
          title: "Share link copied",
          message: `Copied to clipboard:\n${shareLink}`,
          tone: "primary",
        });
      } else {
        await alert({
          title: "Share upload link",
          message: `${shareLink}`,
          tone: "primary",
        });
      }
    } catch (error) {
      console.error("Failed to generate share upload link:", error);
      const message =
        error?.response?.data?.message ||
        "Failed to generate share upload link. Please try again.";
      await alert({
        title: "Couldn't create share link",
        message,
        tone: "danger",
      });
    } finally {
      setIsGeneratingShareLink(false);
    }
  };

  const itemConfigPayload = {
    apparel_pattern_price_id: toNullableId(selectedApparelPattern?.id),
    apparel_type_id: toNullableId(selectedApparelPattern?.apparelTypeId),
    pattern_type_id: toNullableId(selectedApparelPattern?.patternTypeId),

    print_method_id: toNullableId(selectedPrintMethodId),
    print_method_name: selectedPrintMethod?.name || null,

    pattern_type_name: selectedApparelPattern?.patternName || null,
    is_custom_fit:
      (selectedApparelPattern?.patternName || "").toLowerCase() === "custom",

    embroidery_size: methodConfig.embroidery_size || "small",
    embroidery_is_large: methodConfig.embroidery_size === "large",
    embroidery_manual_price:
      quotationService.toNumber(methodConfig.embroidery_manual_price) || 0,

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
      color_price: item.colorPrice,
      unit_price: item.unitPrice,
    })),
    // Per-Color Quantity Breakdown (display/allocation only). Positive-qty rows
    // only; backend keeps named-but-empty groups and derives shirt_color.
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

  const formattedAddons = selectedAddons.map((addonId) => {
    const addon = data?.addons?.find((a) => a.id === addonId);
    return {
      id: toNullableId(addon?.id || addonId),
      name: addon?.name || "Unknown",
      price: addon?.price_type === "Free" ? 0 : quotationService.toNumber(addon?.price),
    };
  });

  // Pricing-relevant print parts for the live preview. Translates Edit's
  // colorCount/fullColorCount into the backend's unit_count/full_unit_count.
  const printPartsPreview = (selectedColors || []).map((part) => {
    // Change 12: one explicit print type + one colour count per placement.
    const isFull =
      (part.printSize || selectedPrintArea || "").toLowerCase() === "full";
    const numColors = isFull
      ? quotationService.toNumber(part.fullColorCount || 0)
      : quotationService.toNumber(part.colorCount || 0);
    return {
      part: part.part || `Part ${part.colorId}`,
      print_type: isFull ? "full_print" : "regular",
      num_colors: numColors,
      color_count: numColors,
      unit_count: isFull ? 0 : numColors,
      full_unit_count: isFull ? numColors : 0,
      print_size: isFull ? "full" : "regular",
      is_full_print: isFull,
      width: quotationService.toNumber(part.width || 0),
      height: quotationService.toNumber(part.height || 0),
      pieces: quotationService.toNumber(part.pieces || 0),
    };
  });

  // Debounced live preview from the backend (same engine as save), so editing
  // a quotation shows correct method-aware totals.
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

  const handleUpdate = async () => {
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

    // Issue 8 — Parts/design upload is a SOFT requirement (see Add Quotation).
    if (selectedColors.length === 0) {
      const proceed = await confirm({
        title: "No design added yet",
        message:
          "No apparel part / design has been added yet. Save the quotation anyway?",
        confirmLabel: "Save anyway",
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
        const imageLink = imageInputType === "link"
          ? String(part.imageLink || "").trim()
          : String(part.existingImageRawPath || "").trim();
        const image = imageInputType === "file" ? part.file : null;

        // Change 12: one explicit print type + one colour count per placement.
        const isFull =
          (part.printSize || selectedPrintArea || "").toLowerCase() === "full";
        const numColors = isFull
          ? quotationService.toNumber(part.fullColorCount || 0)
          : quotationService.toNumber(part.colorCount || 0);

        return {
          part_id: toNullableId(partOption?.id ?? part.colorId),
          part: partOption?.name || part.part || `Part ${part.colorId}`,
          print_type: isFull ? "full_print" : "regular",
          num_colors: numColors,
          color_count: numColors,
          price_per_color: quotationService.toNumber(part.pricePerColor),
          full_color_count: isFull ? numColors : 0,
          price_per_full_color: quotationService.toNumber(part.pricePerFullColor || 0),
          // Legacy split kept internally consistent (only the active type
          // carries colours) so the engine and downstream readers agree.
          unit_count: isFull ? 0 : numColors,
          full_unit_count: isFull ? numColors : 0,
          print_size: isFull ? "full" : "regular",
          is_full_print: isFull,
          width: quotationService.toNumber(part.width || 0),
          height: quotationService.toNumber(part.height || 0),
          pieces: quotationService.toNumber(part.pieces || 0),
          image_input_type: imageInputType,
          image_link: imageLink,
          image,
        };
      });

      const formDataToSend = new FormData();
      formDataToSend.append("client_id", selectedClientId);
      formDataToSend.append("client_name", formData.client_name);
      formDataToSend.append("client_email", formData.client_email);
      formDataToSend.append("client_facebook", formData.client_facebook);
      formDataToSend.append("client_brand", formData.brand);
      formDataToSend.append("apparel_type_id", itemConfigPayload.apparel_type_id ?? "");
      formDataToSend.append("pattern_type_id", itemConfigPayload.pattern_type_id ?? "");
      // Per-Color: derive shirt_color from the named colour groups (distinct,
      // in order); fall back to the typed value when none are named.
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
            price_per_color: part.price_per_color,
            full_color_count: part.full_color_count,
            price_per_full_color: part.price_per_full_color,
            unit_count: part.unit_count,
            full_unit_count: part.full_unit_count,
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
          // Single file per print part. Matches `print_parts_files.*` => file rule.
          formDataToSend.append(`print_parts_files[${index}]`, part.image);
        }
      });

      // Custom-pattern reference (Issue 6). A new file overrides; otherwise send
      // the link (which on hydration holds the existing saved path/link).
      if (isCustomFit) {
        if (customPatternImage.inputType === "file" && customPatternImage.file) {
          formDataToSend.append("custom_pattern_image_file", customPatternImage.file);
        } else if (customPatternImage.inputType === "link" && customPatternImage.link?.trim()) {
          formDataToSend.append("custom_pattern_image", customPatternImage.link.trim());
        }
      }

      // ── Issue 7: Brand + Care/Size label spec + one shared design upload.
      // A newly staged file/link overrides the saved design; if the CSR touches
      // neither, we send nothing for the design and the backend keeps the
      // existing value (controller resolveLabelDesign returns null → service
      // falls back to the existing record).
      formDataToSend.append("brand_label_json", JSON.stringify(brandLabel));
      formDataToSend.append("care_label_json", JSON.stringify(careLabel));
      if (labelDesign.inputType === "file" && labelDesign.file) {
        formDataToSend.append("label_design_file", labelDesign.file);
      } else if (labelDesign.inputType === "link" && labelDesign.link?.trim()) {
        formDataToSend.append("label_design_path", labelDesign.link.trim());
      }

      await quotationApi.update(id, formDataToSend);

      navigate("/quotations");
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
      <AdminLayout pageTitle="Edit Quotation">
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

  // Issue 8 — parts/design are optional; only the apparel/pattern is required.
  const hasSelections = !!selectedApparelPattern;

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-primary flex items-center gap-2">
              <i className="fas fa-edit"></i>
              Edit Quotation #{id}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Modify quotation details and pricing</p>
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
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                  Apparel / Pattern Type
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Search Apparel / Pattern</label>
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

              {/* Custom-pattern reference upload (Issue 6); mirrors the Add page. */}
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

              <div className="pt-4 border-t border-gray-100">
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

              <div className="pt-4 border-t border-gray-100">
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

                            {!part.file && part.existingImageUrl && (
                              <div className="rounded-lg border border-gray-200 p-2 bg-gray-50">
                                <p className="text-[11px] text-gray-500 mb-2">Existing image</p>
                                <a href={part.existingImageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                                  <img
                                    src={part.existingImageUrl}
                                    alt={part.part || "Part image"}
                                    className="h-14 w-14 rounded border border-gray-200 object-cover bg-white"
                                  />
                                  <span className="text-xs text-primary hover:underline">View image</span>
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="lg:pt-9 space-y-2">
                            {/* Generic color inputs. Hidden for DTF, which uses
                                the dedicated Width/Height/Pieces block below. */}
                            {selectedMethodKey !== "dtf" && (
                              <>
                                <label className="block text-xs font-medium text-gray-600 mb-1">{printMethodLabels.colorLabel}</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={part.colorCount ?? ""}
                                  onChange={(e) => updateColorCount(part.colorId, e.target.value)}
                                  onBlur={() => normalizeColorCount(part.colorId)}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
                                />
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
                                    value={part.fullColorCount ?? ""}
                                    onChange={(e) => updateFullColorCount(part.colorId, e.target.value)}
                                    onBlur={() => normalizeFullColorCount(part.colorId)}
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
              Select an Apparel/Pattern to edit this quotation. Parts/design are optional.
            </span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate("/quotations")}
            className="px-3 py-1.5 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-gray-50"
          >
            <i className="fas fa-times mr-1"></i>Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerateShareUploadLink}
            disabled={isGeneratingShareLink || saving}
            className="px-3 py-1.5 rounded-md border border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingShareLink ? (
              <>
                <i className="fas fa-spinner fa-spin mr-1"></i>Generating Link...
              </>
            ) : (
              <>
                <i className="fas fa-link mr-1"></i>Share Upload Link
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={saving || !hasSelections || items.length === 0}
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
      {dialog}
    </AdminLayout>
  );
};

export default EditQuotation;