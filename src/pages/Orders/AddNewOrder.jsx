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
import { OrderForm } from "../../features/order/addOrder/components/OrderForm";
import {
  createSizeObjects,
  calculateUnitPrice,
} from "../../features/order/addOrder/utlis/orderHelpers";

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

  const calculations = useOrderCalculations(
    formData.sizes,
    formData.deposit_percentage,
  );

  useEffect(() => {
    setErrors((prev) => ({ ...prev, ...optionsErrors }));
  }, [optionsErrors, setErrors]);

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
    [formData.sizes.length, setFormData],
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

    const isValid = validate();

    if (!isValid) {
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      // Make sure calculations are up to date
      const updatedCalculations = calculations;

      // Prepare data for submission with all required fields
      const submitData = {
        ...formData,
        // Include calculated fields
        total_quantity: updatedCalculations.totalQuantity,
        total_amount: updatedCalculations.totalAmount,
        average_unit_price: updatedCalculations.averageUnitPrice,
        // Map selected options
        selectedOptions: selectedOptions.map(({ name, color, applyToAll }) => ({
          name,
          color,
          applyToAll,
        })),
        // Filter sizes with quantity > 0
        sizes: formData.sizes.filter((size) => size.quantity > 0),
      };

      console.log("Submitting data:", submitData); // Debug log

      await orderService.createOrder(submitData);



      setSubmitSuccess(true);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Optional: Redirect after success
      // setTimeout(() => navigate('/orders'), 2000);
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
    setSubmitSuccess(false);
  }, [resetForm]);

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
        summary={calculations}
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
      />
    </AdminLayout>
  );
}
