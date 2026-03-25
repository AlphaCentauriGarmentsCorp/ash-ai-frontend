import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Loader from "../../components/common/Loader";
import { orderService } from "../../services/orderService";
import { useOrderForm } from "../../features/order/addOrder/hooks/useOrderForm";
import { useOrderCalculations } from "../../features/order/addOrder/hooks/useOrderCalculations";
import { useClients } from "../../features/order/addOrder/hooks/useClients";
import { useDropdownOptions } from "../../features/order/addOrder/hooks/useDropdownOptions";
import { useFabricMaterials } from "../../features/order/addOrder/hooks/useFabricMaterials";
import { useOptions } from "../../features/order/addOrder/hooks/useOptions";
import { useSampleSizes } from "../../features/order/addOrder/hooks/useSampleSizes"; // Add this import
import { OrderForm } from "../../features/order/addOrder/components/OrderForm";
import {
  createSizeObjects,
  calculateUnitPrice,
  calculateSampleSummary, // Add this
} from "../../features/order/addOrder/utils/orderHelpers";

export default function AddNewOrder() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  // Initialize sample sizes hook
  const {
    samples: sampleSizes,
    errors: sampleErrors,
    summary: sampleSummary,
    addSample: handleAddSample,
    removeSample: handleRemoveSample,
    updateSampleField: handleSampleFieldChange,
    validate: validateSamples,
    resetSamples,
  } = useSampleSizes(formData.samples || [], (updatedSamples) => {
    // Update formData when samples change
    setFormData((prev) => ({
      ...prev,
      samples: updatedSamples,
    }));
  });

  const {
    clients,
    rawClients,
    clientBrands,
    clientsLoading,
    serverError: clientsError,
    updateClientBrands,
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
    optionsLoading: fabricLoading,
    updateSupplierOptions,
  } = useFabricMaterials();

  const {
    selectedOptions,
    optionsErrors,
    addOption,
    removeOption,
    setOptionsErrors,
  } = useOptions();

  // Combine all calculations
  const calculations = useOrderCalculations(
    formData.sizes,
    formData.deposit_percentage,
  );

  // Combine all calculations with sample summary
  const combinedSummary = {
    ...calculations,
    samples: sampleSummary,
    totalPieces: calculations.totalQuantity || 0,
    totalAmount: (calculations.totalAmount || 0) + sampleSummary.totalAmount,
  };

  useEffect(() => {
    setErrors((prev) => ({ ...prev, ...optionsErrors, samples: sampleErrors }));
  }, [optionsErrors, sampleErrors, setErrors]);

  useEffect(() => {
    if (formData.client) {
      updateClientBrands(formData.client, (updates) => {
        setFormData((prev) => ({ ...prev, ...updates }));
      });
    }
  }, [formData.client, updateClientBrands, setFormData]);

  useEffect(() => {
    updateSupplierOptions(
      formData.fabric_type,
      formData.fabric_supplier,
      (updates) => {
        setFormData((prev) => ({ ...prev, ...updates }));
      },
    );
  }, [
    formData.fabric_type,
    formData.fabric_supplier,
    updateSupplierOptions,
    setFormData,
  ]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await fetchDropdownOptions();
      } catch (error) {
        console.error("Failed to load initial data:", error);
        setServerError("Failed to load initial data.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchDropdownOptions, setServerError]);

  const handleSizeChange = useCallback(
    (id, field, value) => {
      setFormData((prev) => ({
        ...prev,
        sizes: prev.sizes.map((size) => {
          if (size.id !== id) return size;

          const updatedSize = { ...size, [field]: value };

          if (field === "costPrice" || field === "quantity") {
            const cost =
              parseFloat(field === "costPrice" ? value : size.costPrice) || 0;
            const qty =
              parseFloat(field === "quantity" ? value : size.quantity) || 0;
            updatedSize.unitPrice = calculateUnitPrice(cost, qty);
            updatedSize.totalPrice = updatedSize.unitPrice;
          }

          return updatedSize;
        }),
      }));
    },
    [setFormData],
  );

  const handleAddSize = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      sizes: [
        ...prev.sizes,
        {
          id: crypto.randomUUID(),
          name: "",
          costPrice: 0,
          quantity: 0,
          unitPrice: 0,
          totalPrice: 0,
        },
      ],
    }));
  }, [setFormData]);

  const handleRemoveSize = useCallback(
    (id) => {
      setFormData((prev) => ({
        ...prev,
        sizes: prev.sizes.filter((size) => size.id !== id),
      }));
    },
    [setFormData],
  );

  const handleAddOption = useCallback(
    (optionValue, optionColor, sameOptionColor) => {
      return addOption(optionValue, optionColor, sameOptionColor);
    },
    [addOption],
  );

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    setServerError("");
    setSubmitSuccess(false);

    // Validate main form
    const isFormValid = validate();

    // Validate samples
    const areSamplesValid = validateSamples();

    if (!isFormValid || !areSamplesValid) {
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Include calculated fields
        total_quantity: combinedSummary.totalPieces,
        total_amount: combinedSummary.totalAmount,
        average_unit_price: calculations.averageUnitPrice,
        // Map selected options
        selectedOptions: selectedOptions.map(({ name, color, applyToAll }) => ({
          name,
          color,
          applyToAll,
        })),
        // Filter sizes with quantity > 0
        sizes: formData.sizes.filter((size) => size.quantity > 0),
        // Include samples (filter out empty ones if needed)
        samples: sampleSizes.filter(
          (sample) => sample.size && sample.quantity > 0,
        ),
      };

      console.log("Submitting data:", submitData);

      await orderService.createOrder(submitData);

      setSubmitSuccess(true);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission error details:", err);

      if (err.response) {
        if (err.response.data?.errors) {
          setErrors(err.response.data.errors);
        }
        setServerError(
          err.response.data?.message ||
            `Server error: ${err.response.status} - ${err.response.statusText}`,
        );
      } else if (err.request) {
        setServerError(
          "No response from server. Please check your connection.",
        );
      } else {
        setServerError(
          err.message || "An error occurred while submitting the form.",
        );
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = useCallback(() => {
    resetForm();
    resetSamples();
    setSubmitSuccess(false);
  }, [resetForm, resetSamples]);

  if (loading) {
    return (
      <Loader
        pageTitle="Add Order"
        path="/"
        links={[
          { label: "Home", href: "/" },
          { label: "Orders", href: "/orders" },
        ]}
      />
    );
  }

  return (
    <AdminLayout
      pageTitle="Add Order"
      path="/"
      links={[
        { label: "Home", href: "/" },
        { label: "Orders", href: "/orders" },
      ]}
    >
      <OrderForm
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        serverError={serverError}
        handleChange={handleChange}
        handleDepositPercentageChange={handleDepositPercentageChange}
        handleFileChange={handleFileChange}
        handleSizeChange={handleSizeChange}
        handleAddSize={handleAddSize}
        handleRemoveSize={handleRemoveSize}
        handleAddOption={handleAddOption}
        handleRemoveOption={removeOption}
        handleSubmit={handleSubmit}
        handleReset={handleReset}
        isSubmitting={isSubmitting}
        submitSuccess={submitSuccess}
        summary={combinedSummary}
        clients={clients}
        clientsLoading={clientsLoading}
        clientBrands={clientBrands}
        optionsLoading={optionsLoading || fabricLoading}
        apparelTypeOptions={apparelTypeOptions}
        patternTypeOptions={patternTypeOptions}
        serviceTypeOptions={serviceTypeOptions}
        printMethodOptions={printMethodOptions}
        sizeLabelOptions={sizeLabelOptions}
        printLabelPlacementOptions={printLabelPlacementOptions}
        fabricTypeOptions={fabricTypeOptions}
        fabricSupplierOptions={fabricSupplierOptions}
        selectedOptions={selectedOptions}
        // Add sample sizes props
        samples={sampleSizes}
        onSampleChange={handleSampleFieldChange}
        onAddSample={handleAddSample}
        onRemoveSample={handleRemoveSample}
        sampleErrors={sampleErrors}
        sampleSummary={sampleSummary}
      />
    </AdminLayout>
  );
}
