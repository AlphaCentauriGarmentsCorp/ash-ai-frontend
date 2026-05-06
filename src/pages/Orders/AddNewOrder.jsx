import React, { useEffect, useCallback, useState } from "react";
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

// ── Quotation prefill bridge ──────────────────────────────────────────────────
import { useQuotationPrefill } from "../../features/order/addOrder/hooks/useQuotationPrefill";
import { QuotationSummaryPanel } from "../../features/order/addOrder/components/QuotationSummaryPanel";

// ── Service ───────────────────────────────────────────────────────────────────
import { orderApi } from "../../api/orderApi";

export default function AddNewOrder() {
  const location = useLocation();
  const navigate = useNavigate();

  // Prefill payload: navigate("/orders/new", { state: { prefill: result.order_payload } })
  const rawPrefill = location.state?.prefill ?? null;

  // ── Quotation prefill bridge ─────────────────────────────────────────────
  const { hasPrefill, prefillFormData, quotationMeta } =
    useQuotationPrefill(rawPrefill);

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
    validate,
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
    setFormData((prev) => ({ ...prev, ...scalarPrefill }));

    // Cascade brand/address from client
    if (scalarPrefill.client) {
      const brandDefaults = updateClientBrands(scalarPrefill.client);
      setFormData((prev) => ({
        ...prev,
        ...scalarPrefill,
        ...(brandDefaults || {}),
        company: scalarPrefill.company || brandDefaults?.company || "",
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
  }, [hasPrefill, clientsLoading, clients.length, prefillApplied]);

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
  const handleSubmit = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();

      const formValid = validate();
      const samplesValid = validateSamples();
      if (!formValid || !samplesValid) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

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
          discount_amount: rawPrefill?.discount_amount ?? 0,
          subtotal: rawPrefill?.subtotal ?? summary.totalAmount,
          grand_total: rawPrefill?.grand_total ?? summary.estimatedTotal,
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
          estimated_total: summary.estimatedTotal,
        };

        Object.entries(scalars).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, v);
        });

        // ── JSON blobs ────────────────────────────────────────────────────
        fd.append("sizes", JSON.stringify(formData.sizes));
        fd.append("selectedOptions", JSON.stringify(selectedOptions));
        fd.append("samples", JSON.stringify(samples));

        const appendJson = (key, value) => {
          if (!value) return;
          fd.append(key, typeof value === "string" ? value : JSON.stringify(value));
        };
        appendJson("items_json", rawPrefill?.items_json);
        appendJson("addons_json", rawPrefill?.addons_json);
        appendJson("print_parts_json", rawPrefill?.print_parts_json);
        appendJson("breakdown_json", rawPrefill?.breakdown_json);
        appendJson("item_config_json", rawPrefill?.item_config_json);

        // ── File arrays ───────────────────────────────────────────────────
        ["design_files", "design_mockup", "size_label_files", "freebies_files", "payments"].forEach((key) => {
          (formData[key] || []).forEach((file) => {
            if (file instanceof File) fd.append(`${key}[]`, file);
          });
        });

        await orderApi.create(fd);
        setSubmitSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        if (err?.type === "validation") {
          setErrors(err.errors);
        } else {
          if (err?.response?.data?.errors) setErrors(err.response.data.errors);
          setServerError(
            err?.response?.data?.message ||
            "An error occurred while submitting the order. Please check all required fields."
          );
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      validate, validateSamples, formData, selectedOptions, samples,
      rawPrefill, rawClients, summary, setErrors, setServerError,
    ]
  );

  // ── Boot loading ─────────────────────────────────────────────────────────
  if (clientsLoading && clients.length === 0) {
    return (
      <Loader
        pageTitle={hasPrefill ? "New Order (from Quotation)" : "Add Order"}
        path="/"
        links={[{ label: "Home", href: "/" }, { label: "Orders", href: "/orders" }]}
      />
    );
  }

  return (
    <AdminLayout
      pageTitle={hasPrefill ? "New Order (from Quotation)" : "Add Order"}
      path="/"
      links={[
        { label: "Home", href: "/" },
        { label: "Orders", href: "/orders" },
        { label: hasPrefill ? "New from Quotation" : "Add", href: "#" },
      ]}
    >
      {/* ── Success banner ──────────────────────────────────────────────── */}
      {submitSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <i className="fas fa-check-circle text-green-500 text-lg"></i>
          <div>
            <p className="text-green-800 font-semibold text-sm">Order created successfully!</p>
            <p className="text-green-600 text-xs mt-0.5">The order has been saved and assigned a PO code.</p>
          </div>
          <button
            onClick={() => navigate("/orders")}
            className="ml-auto px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
          >
            View Orders
          </button>
        </div>
      )}

      {/* ── Prefill origin banner ────────────────────────────────────────── */}
      {hasPrefill && !submitSuccess && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-blue-700 text-sm">
          <i className="fas fa-info-circle"></i>
          Pre-filled from Quotation&nbsp;<strong>#{quotationMeta?.quotationId}</strong>.
          Review all sections and fill in any remaining details before saving.
        </div>
      )}

      {/* ── Quotation carried data panel (read-only) ─────────────────────── */}
      {hasPrefill && <QuotationSummaryPanel meta={quotationMeta} />}

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
    </AdminLayout>
  );
}