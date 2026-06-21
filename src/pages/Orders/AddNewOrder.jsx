import React, { useEffect, useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Loader from "../../components/common/Loader";

// ── Feature: OrderForm & its hooks ────────────────────────────────────────────
import { OrderForm } from "../../features/order/addOrder/components/OrderForm";
import { useOrderForm } from "../../features/order/addOrder/hooks/useOrderForm";
import { useClients } from "../../features/order/addOrder/hooks/useClients";
import { useDropdownOptions } from "../../features/order/addOrder/hooks/useDropdownOptions";
import { useFabricMaterials } from "../../features/order/addOrder/hooks/useFabricMaterials";
import { useOptions } from "../../features/order/addOrder/hooks/useOptions";
import { useSampleSizes } from "../../features/order/addOrder/hooks/useSampleSizes";
import { useOrderCalculations } from "../../features/order/addOrder/hooks/useOrderCalculations";
import { useEnginePricing } from "../../features/order/addOrder/hooks/useEnginePricing";

// ── Quotation prefill bridge ──────────────────────────────────────────────────
import { useQuotationPrefill } from "../../features/order/addOrder/hooks/useQuotationPrefill";
import { QuotationSummaryPanel } from "../../features/order/addOrder/components/QuotationSummaryPanel";

// ── Service ───────────────────────────────────────────────────────────────────
import { orderApi } from "../../api/orderApi";

// ── Change 11/13: incomplete-override + structured errors ─────────────────────
import { useAuth } from "../../hooks/useAuth";
import { isSuperAdmin } from "../../utils/authz";
import { parseApiError } from "../../utils/parseApiError";
import { orderSchema } from "../../validations/orderSchema";
import { validateForm } from "../../features/order/addOrder/utils/orderValidation";
import IncompleteOverrideModal from "../../features/order/addOrder/components/IncompleteOverrideModal";
import { mapOrderEditOverlay } from "../../features/order/addOrder/utils/orderEditMapper";
import useConfirm from "../../hooks/useConfirm";

// Fields the backend hard-requires (a superadmin override can NOT skip these):
//   client  -> StoreOrderRequest requires it
//   sizes   -> OrderService enforces >= 1 line item (ORDER_NO_LINE_ITEMS)
const HARD_FLOOR_FIELDS = ["client", "sizes"];

// Turn a schema field key into a friendly label by reusing its "X is required."
// message (e.g. "Design name is required." -> "Design name").
const fieldLabel = (key) => {
  const msg = orderSchema[key]?.message || key;
  return msg.replace(/\s*(field\s*)?is required\.?$/i, "").trim() || key;
};

// Issue 2 — the order fields that may write back to the client master
// (decisions: opt-in confirm at save; address + contact ONLY). Labels feed
// the confirm dialog.
const CLIENT_SYNC_FIELDS = [
  ["contact_number", "Contact Number"],
  ["street_address", "Street"],
  ["barangay_address", "Barangay"],
  ["city_address", "City"],
  ["province_address", "Province"],
  ["postal_address", "Postal Code"],
];

export default function AddNewOrder({ editOrder = null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { confirm, alert, dialog } = useConfirm();

  // Prefill payload: navigate("/orders/new", { state: { prefill: result.order_payload } })
  const isEdit = Boolean(editOrder);
  // In edit mode the order itself drives the prefill plumbing — its OrderResource
  // shape carries the same FK ids + JSON blobs the quotation order_payload does.
  const rawPrefill = editOrder ?? location.state?.prefill ?? null;

  // ── Quotation prefill bridge ─────────────────────────────────────────────
  const { hasPrefill, prefillFormData, quotationMeta } =
    useQuotationPrefill(rawPrefill);

  // Edit mode: production fields useQuotationPrefill doesn't carry (+ real deadline),
  // spread AFTER the quotation prefill so the order's saved values win.
  const editOverlay = useMemo(
    () => (isEdit ? mapOrderEditOverlay(editOrder) : null),
    [isEdit, editOrder]
  );

  // ── Core form state ──────────────────────────────────────────────────────
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    serverError,
    setServerError,
    handleChange,
    handleDepositPercentageChange,
    handleFileChange,
    resetForm,
  } = useOrderForm();

  // ── Reference data ───────────────────────────────────────────────────────
  const {
    clients,
    rawClients,
    clientBrands,
    clientsLoading,
    updateClientBrands,
    fetchClients,
  } = useClients();

  const {
    optionsLoading,
    apparelTypeOptions,
    patternTypeOptions,
    serviceTypeOptions,
    printMethodOptions,
    sizeLabelOptions,
    printLabelPlacementOptions,
    specialPrintOptions,
    apparelPatternPrices,
    fetchDropdownOptions,
  } = useDropdownOptions();

  const {
    fabricTypeOptions,
    fabricSupplierOptions,
    fetchFabricMaterials,
    updateSupplierOptions,
  } = useFabricMaterials();

  const { selectedOptions, setSelectedOptions, optionsErrors, addOption, removeOption } =
    useOptions();

  const {
    samples,
    setSamples,
    errors: sampleErrors,
    addSample,
    removeSample,
    updateSampleField,
    validate: validateSamples,
  } = useSampleSizes();

  // ── Calculations ─────────────────────────────────────────────────────────
  const summary = useOrderCalculations(
    formData.sizes,
    formData.deposit_percentage
  );

  // ── Engine pricing (Option A) ────────────────────────────────────────────
  // Base-price id carried from an approved quotation (if any), used as the
  // first preference when resolving the apparel_pattern_price.
  const prefillPatternPriceId = (() => {
    const raw = rawPrefill?.item_config_json;
    if (!raw) return null;
    try {
      const cfg = typeof raw === "string" ? JSON.parse(raw) : raw;
      return cfg?.apparel_pattern_price_id ?? null;
    } catch {
      return null;
    }
  })();

  const { totals: engineTotals, payload: enginePayload } = useEnginePricing({
    formData,
    apparelPatternPrices,
    prefillPatternPriceId,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Superadmin incomplete-override modal state (Change 11)
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideFields, setOverrideFields] = useState([]);

  // ── Keep estimated_total in formData in sync with live summary ──────────
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      estimated_total: summary.estimatedTotal,
    }));
  }, [summary.estimatedTotal]);

  // ── Boot: fetch all reference data ──────────────────────────────────────
  useEffect(() => {
    fetchClients();
    fetchDropdownOptions();
    fetchFabricMaterials();
  }, [fetchClients, fetchDropdownOptions, fetchFabricMaterials]);

  // ── Apply quotation prefill once clients are loaded ──────────────────────
  const [prefillApplied, setPrefillApplied] = useState(false);
  useEffect(() => {
    if (!hasPrefill || clientsLoading || clients.length === 0 || prefillApplied) return;

    const { _prefillSamples, _prefillAddons, ...scalarPrefill } = prefillFormData;

    // Merge scalar fields
    setFormData((prev) => ({ ...prev, ...scalarPrefill, ...(editOverlay || {}) }));

    // Cascade brand/address from client
    if (scalarPrefill.client) {
      const brandDefaults = updateClientBrands(scalarPrefill.client);
      setFormData((prev) => ({
        ...prev,
        ...scalarPrefill,
        ...(brandDefaults || {}),
        company: scalarPrefill.company || brandDefaults?.company || "",
        ...(editOverlay || {}),
      }));
    }

    // Pre-populate samples from quotation sample_breakdown
    if (_prefillSamples?.length > 0) {
      setSamples?.(_prefillSamples);
    }

    // Pre-populate options/addons from quotation addons_json
    if (_prefillAddons?.length > 0) {
      const mappedOptions = _prefillAddons.map((addon) => ({
        id: crypto.randomUUID(),
        name: addon.name ?? "Addon",
        color: addon.color ?? "#000000",
        colorValue: addon.color ?? "",
        price: addon.price ?? addon.price_per_piece ?? 0,
        quantity: addon.quantity ?? 1,
        total: addon.line_total ?? addon.total ?? 0,
        applyToAll: false,
        isAddon: true,
      }));
      setSelectedOptions?.(mappedOptions);
    }

    setPrefillApplied(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPrefill, clientsLoading, clients.length, prefillApplied, editOverlay]);

  // ── Client change handler ────────────────────────────────────────────────
  const handleClientChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      const updates = updateClientBrands(value);
      setFormData((prev) => ({ ...prev, [name]: value, ...(updates || {}) }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [updateClientBrands, setFormData, setErrors]
  );

  // ── Fabric type change handler ───────────────────────────────────────────
  const handleFabricTypeChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      updateSupplierOptions(value, formData.fabric_supplier, (updates) =>
        setFormData((prev) => ({ ...prev, ...updates }))
      );
    },
    [formData.fabric_supplier, updateSupplierOptions, setFormData]
  );

  // ── Composed handleChange ────────────────────────────────────────────────
  const handleFormChange = useCallback(
    (e) => {
      const { name } = e.target;
      if (name === "client") return handleClientChange(e);
      if (name === "fabric_type") return handleFabricTypeChange(e);
      handleChange(e);
    },
    [handleClientChange, handleFabricTypeChange, handleChange]
  );

  // ── Per-method print config (embroidery / sublimation) ───────────────────
  const handlePrintConfigChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        print_method_config: {
          ...(prev.print_method_config || {}),
          [field]: value,
        },
      }));
      setServerError("");
    },
    [setFormData, setServerError]
  );

  // ── Print placements / colors (feed the pricing engine) ──────────────────
  const handlePrintPartsChange = useCallback(
    (nextParts) => {
      setFormData((prev) => ({ ...prev, print_parts: nextParts }));
      setServerError("");
    },
    [setFormData, setServerError]
  );

  // ── Size handlers ────────────────────────────────────────────────────────
  const handleSizeChange = useCallback(
    (id, field, value) => {
      setFormData((prev) => {
        const sizes = prev.sizes.map((size) => {
          if (size.id !== id) return size;
          const updated = { ...size, [field]: value };
          if (field === "quantity" || field === "costPrice") {
            const qty = parseFloat(field === "quantity" ? value : size.quantity) || 0;
            const cost = parseFloat(field === "costPrice" ? value : size.costPrice) || 0;
            updated.unitPrice = cost;
            updated.totalPrice = cost * qty;
          }
          return updated;
        });
        return { ...prev, sizes };
      });
    },
    [setFormData]
  );

  const handleAddSize = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      sizes: [
        ...prev.sizes,
        { id: crypto.randomUUID(), name: "", costPrice: 0, quantity: 0, unitPrice: 0, totalPrice: 0 },
      ],
    }));
  }, [setFormData]);

  const handleRemoveSize = useCallback(
    (id) => setFormData((prev) => ({ ...prev, sizes: prev.sizes.filter((s) => s.id !== id) })),
    [setFormData]
  );

  // ── Option handlers ──────────────────────────────────────────────────────
  const handleAddOption = useCallback(() => {
    addOption(formData.options, formData.option_color, formData.same_option_color);
  }, [addOption, formData.options, formData.option_color, formData.same_option_color]);

  const handleRemoveOption = useCallback((id) => removeOption(id), [removeOption]);

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    resetForm();
    setPrefillApplied(false); // allow re-applying prefill on next mount
  }, [resetForm]);

  // ── Submit ───────────────────────────────────────────────────────────────
  // Build the FormData and POST the order. When `override` is provided
  // ({ incompleteFields: [...] }) the request carries the superadmin
  // incomplete-override flag so the backend will save + flag the order.
  const submitOrder = useCallback(
    async (override = null) => {
      setIsSubmitting(true);
      setServerError("");

      try {
        const fd = new FormData();

        // ── Resolve client_name from rawClients ──────────────────────────
        const selectedClient = rawClients?.find((c) => String(c.id) === String(formData.client));
        const clientName = selectedClient?.name || rawPrefill?.client_name || "";

        // ── Scalar fields ─────────────────────────────────────────────────
        const scalars = {
          // Traceability
          quotation_id: formData.quotation_id || rawPrefill?.quotation_id || "",
          // Client
          client_id: formData.client || "",
          client_name: clientName,
          client_brand: formData.company || "",
          // Apparel brand (Sorbetes / Reefer / etc)
          brand: formData.brand || "",
          // Apparel + pattern + print method (the form has dropdowns
          // bound to these — submit them so the validator + service
          // can persist them on the order row).
          apparel_type: formData.apparel_type || "",
          pattern_type: formData.pattern_type || "",
          print_method: formData.print_method || "",
          // IDs for backend FK columns
          apparel_type_id: rawPrefill?.apparel_type_id || "",
          pattern_type_id: rawPrefill?.pattern_type_id || "",
          apparel_neckline_id: rawPrefill?.apparel_neckline_id || "",
          print_method_id: rawPrefill?.print_method_id || "",
          // Shirt / print
          shirt_color: formData.shirt_color || rawPrefill?.shirt_color || "",
          special_print: formData.special_print || "",
          print_area: formData.print_area || "",
          free_items: formData.freebie_others || rawPrefill?.free_items || "",
          notes: formData.notes || "",
          // Financials from quotation
          discount_type: rawPrefill?.discount_type || "",
          discount_price: rawPrefill?.discount_price ?? 0,
          discount_amount: engineTotals
            ? Number(engineTotals.discount_amount ?? rawPrefill?.discount_amount ?? 0)
            : (rawPrefill?.discount_amount ?? 0),
          subtotal: engineTotals
            ? Number(engineTotals.subtotal ?? 0)
            : (rawPrefill?.subtotal ?? summary.totalAmount),
          grand_total: engineTotals
            ? Number(engineTotals.grand_total ?? 0)
            : (rawPrefill?.grand_total ?? summary.estimatedTotal),
          // Order form fields
          deadline: formData.deadline || "",
          priority: formData.priority || "",
          courier: formData.courier || "",
          method: formData.method || "",
          receiver_name: formData.receiver_name || "",
          contact_number: formData.contact_number || "",
          street_address: formData.street_address || "",
          province_address: formData.province_address || "",
          city_address: formData.city_address || "",
          barangay_address: formData.barangay_address || "",
          postal_address: formData.postal_address || "",
          design_name: formData.design_name || "",
          service_type: formData.service_type || "",
          print_service: formData.print_service || "",
          size_label: formData.size_label || "",
          print_label_placement: formData.print_label_placement || "",
          fabric_type: formData.fabric_type || "",
          fabric_supplier: formData.fabric_supplier || "",
          fabric_color: formData.fabric_color || "",
          thread_color: formData.thread_color || "",
          ribbing_color: formData.ribbing_color || "",
          freebie_items: formData.freebie_items || "",
          freebie_color: formData.freebie_color || "",
          freebie_others: formData.freebie_others || "",
          deposit_percentage: formData.deposit_percentage ?? 60,
          payment_plan: formData.payment_plan || "",
          payment_method: formData.payment_method || "",
          // Totals (from useOrderCalculations summary)
          total_quantity: summary.totalQuantity ?? 0,
          total_amount: engineTotals
            ? Number(engineTotals.subtotal ?? 0)
            : Number(summary.totalAmount ?? 0),
          average_unit_price: Number(summary.averageUnitPrice ?? 0),
          estimated_total: engineTotals
            ? Number(engineTotals.grand_total ?? 0)
            : summary.estimatedTotal,
        };

        Object.entries(scalars).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, v);
        });

        // ── JSON blobs ────────────────────────────────────────────────────
        fd.append("sizes", JSON.stringify(formData.sizes));
        fd.append("selectedOptions", JSON.stringify(selectedOptions));
        fd.append("samples", JSON.stringify(samples));
        fd.append(
          "print_method_config",
          JSON.stringify(formData.print_method_config || {})
        );

        const appendJson = (key, value) => {
          if (!value) return;
          fd.append(key, typeof value === "string" ? value : JSON.stringify(value));
        };
        appendJson("items_json", rawPrefill?.items_json);
        appendJson("addons_json", rawPrefill?.addons_json);
        // When the engine priced this order, persist the order-built config +
        // engine breakdown so the saved order reflects the live price; else
        // fall back to the quotation's carried blobs.
        appendJson(
          "print_parts_json",
          engineTotals ? enginePayload?.print_parts_json : rawPrefill?.print_parts_json
        );
        appendJson(
          "breakdown_json",
          engineTotals ? engineTotals.breakdown_json : rawPrefill?.breakdown_json
        );
        appendJson(
          "item_config_json",
          engineTotals ? enginePayload?.item_config_json : rawPrefill?.item_config_json
        );

        // ── File arrays ───────────────────────────────────────────────────
        ["design_files", "design_mockup", "size_label_files", "freebies_files", "payments"].forEach((key) => {
          (formData[key] || []).forEach((file) => {
            if (file instanceof File) fd.append(`${key}[]`, file);
          });
        });

        // ── Incomplete-override flag (Change 11) ─────────────────────────
        if (override && Array.isArray(override.incompleteFields)) {
          // Send "1" (not "true"): Laravel's `boolean` rule accepts 1/0/"1"/"0"
          // /true/false but NOT the string "true".
          fd.append("override_incomplete", "1");
          fd.append("incomplete_fields", JSON.stringify(override.incompleteFields));
        }

        // ── Issue 2: opt-in client-master write-back ───────────────────
        // If this edit changed any client-ish field, ask the CSR whether the
        // change should also update the client's saved record — one-off
        // shipping overrides for a single P.O. are legitimate and must NOT
        // silently rewrite the master.
        if (isEdit && editOrder?.client_id) {
          const changed = CLIENT_SYNC_FIELDS.filter(([field]) => {
            const original =
              field === "contact_number"
                ? (editOrder.contact_number ?? editOrder.receiver_contact ?? "")
                : (editOrder[field] ?? "");
            return String(formData[field] ?? "").trim() !== String(original).trim();
          });
          if (changed.length > 0) {
            const ok = await confirm({
              title: "Update the client record too?",
              message:
                "You changed: " + changed.map(([, label]) => label).join(", ") +
                ". Apply these to the client\u2019s saved record as well? " +
                "Choose \u201CThis order only\u201D if it\u2019s a one-off for this P.O.",
              confirmLabel: "Update client record",
              cancelLabel: "This order only",
            });
            if (ok) fd.append("sync_client", "1");
          }
        }

        if (isEdit) {
          await orderApi.update(editOrder.id, fd);
        } else {
          await orderApi.create(fd);
        }
        setSubmitSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        // Structured-error mapping (Change 13).
        const parsed = parseApiError(err);
        if (parsed.type === "validation") {
          setErrors(parsed.fields);
        } else if (Object.keys(parsed.fields || {}).length) {
          // Business errors may carry a field hint (e.g. ORDER_NO_LINE_ITEMS -> sizes)
          setErrors((prev) => ({ ...prev, ...parsed.fields }));
        }
        setServerError(parsed.message);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData, selectedOptions, samples,
      rawPrefill, rawClients, summary, setErrors, setServerError,
      engineTotals, enginePayload, isEdit, editOrder, confirm,
    ]
  );

  // Validate, then either save (clean), block (non-superadmin / hard-floor
  // broken), or offer the superadmin a "save anyway" override for soft fields.
  const handleSubmit = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();

      const formErrors = validateForm(formData);
      const samplesValid = validateSamples();
      const hasFormErrors = Object.keys(formErrors).length > 0;

      if (!hasFormErrors && samplesValid) {
        await submitOrder(null);
        return;
      }

      // Surface inline field errors regardless of the path taken.
      setErrors(formErrors);

      const hardFloorBroken = HARD_FLOOR_FIELDS.some((k) => formErrors[k]);

      // Superadmin may override ONLY soft fields, and only when the hard floor
      // (client + at least one sized line item) and the sample sub-form are OK.
      if (isSuperAdmin(user) && samplesValid && !hardFloorBroken) {
        const softKeys = Object.keys(formErrors).filter(
          (k) => !HARD_FLOOR_FIELDS.includes(k)
        );
        if (softKeys.length > 0) {
          setOverrideFields(softKeys.map(fieldLabel));
          setShowOverrideModal(true);
          return;
        }
      }

      // Everyone else (or hard-floor / sample problems): warn, then block + scroll up.
      const missing = Object.keys(formErrors).map(fieldLabel);
      if (!samplesValid) missing.push("Sample size details");
      window.scrollTo({ top: 0, behavior: "smooth" });
      await alert({
        title: "Missing required information",
        message: missing.length
          ? `Please complete the following before saving: ${missing.join(", ")}.`
          : "Please complete the required fields before saving.",
        tone: "danger",
      });
    },
    [formData, validateSamples, submitOrder, user, setErrors, alert]
  );

  // Confirm the override -> resubmit with the incomplete flag + field list.
  const confirmOverride = useCallback(async () => {
    setShowOverrideModal(false);
    await submitOrder({ incompleteFields: overrideFields });
  }, [overrideFields, submitOrder]);

  // ── Titles (edit vs quotation-prefill vs blank) ─────────────────────────
  const pageTitle = isEdit
    ? `Edit Order ${editOrder?.po_code ?? ""}`.trim()
    : hasPrefill
    ? "New Order (from Quotation)"
    : "Add Order";
  const lastCrumb = isEdit ? "Edit" : hasPrefill ? "New from Quotation" : "Add";

  // ── Boot loading ─────────────────────────────────────────────────────────
  if (clientsLoading && clients.length === 0) {
    return (
      <Loader
        pageTitle={pageTitle}
        path="/"
        links={[{ label: "Home", href: "/" }, { label: "Orders", href: "/orders" }]}
      />
    );
  }

  return (
    <AdminLayout
      pageTitle={pageTitle}
      path="/"
      links={[
        { label: "Home", href: "/" },
        { label: "Orders", href: "/orders" },
        { label: lastCrumb, href: "#" },
      ]}
    >
      {/* ── Success banner ──────────────────────────────────────────────── */}
      {submitSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <i className="fas fa-check-circle text-green-500 text-lg"></i>
          <div>
            <p className="text-green-800 font-semibold text-sm">{isEdit ? "Order updated successfully!" : "Order created successfully!"}</p>
            <p className="text-green-600 text-xs mt-0.5">{isEdit ? "Your changes have been saved." : "The order has been saved and assigned a PO code."}</p>
          </div>
          <button
            onClick={() => navigate(isEdit ? `/order/${editOrder.po_code}` : "/orders")}
            className="ml-auto px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
          >
            {isEdit ? "View Order" : "View Orders"}
          </button>
        </div>
      )}

      {/* ── Edit-mode banner ─────────────────────────────────────────────── */}
      {isEdit && !submitSuccess && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-800 text-sm">
          <i className="fas fa-pen"></i>
          Editing order&nbsp;<strong>{editOrder?.po_code}</strong>. Fill in any
          missing details and save — completing all required fields clears the
          Incomplete flag.
        </div>
      )}

      {/* ── Prefill origin banner ────────────────────────────────────────── */}
      {hasPrefill && !isEdit && !submitSuccess && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-blue-700 text-sm">
          <i className="fas fa-info-circle"></i>
          Pre-filled from Quotation&nbsp;<strong>#{quotationMeta?.quotationId}</strong>.
          Review all sections and fill in any remaining details before saving.
        </div>
      )}

      {/* ── Quotation carried data panel (read-only) ─────────────────────── */}
      {hasPrefill && !isEdit && <QuotationSummaryPanel meta={quotationMeta} />}

      {/* ── Full feature-based OrderForm ─────────────────────────────────── */}
      <OrderForm
        formData={formData}
        errors={{ ...errors, ...optionsErrors }}
        serverError={serverError}
        handleChange={handleFormChange}
        handleDepositPercentageChange={handleDepositPercentageChange}
        handleFileChange={handleFileChange}
        handleSizeChange={handleSizeChange}
        handleAddSize={handleAddSize}
        handleRemoveSize={handleRemoveSize}
        handleAddOption={handleAddOption}
        handleRemoveOption={handleRemoveOption}
        handleSubmit={handleSubmit}
        handleReset={handleReset}
        isSubmitting={isSubmitting}
        submitSuccess={submitSuccess}
        summary={summary}
        clients={clients}
        clientsLoading={clientsLoading}
        clientBrands={clientBrands}
        optionsLoading={optionsLoading}
        apparelTypeOptions={apparelTypeOptions}
        patternTypeOptions={patternTypeOptions}
        serviceTypeOptions={serviceTypeOptions}
        printMethodOptions={printMethodOptions}
        sizeLabelOptions={sizeLabelOptions}
        printLabelPlacementOptions={printLabelPlacementOptions}
        specialPrintOptions={specialPrintOptions}
        onPrintConfigChange={handlePrintConfigChange}
        onPrintPartsChange={handlePrintPartsChange}
        engineTotals={engineTotals}
        fabricTypeOptions={fabricTypeOptions}
        fabricSupplierOptions={fabricSupplierOptions}
        selectedOptions={selectedOptions}
        samples={samples}
        onSampleChange={updateSampleField}
        onAddSample={addSample}
        onRemoveSample={removeSample}
        sampleErrors={sampleErrors}
        // Pass print_parts for DesignFilesSection
        printParts={hasPrefill ? (quotationMeta?.printParts ?? []) : []}
      />

      <IncompleteOverrideModal
        isOpen={showOverrideModal}
        onClose={() => setShowOverrideModal(false)}
        onConfirm={confirmOverride}
        fields={overrideFields}
        isLoading={isSubmitting}
      />
      {dialog}
    </AdminLayout>
  );
}