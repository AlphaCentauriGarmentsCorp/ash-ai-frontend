import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import FileUpload from "../../components/form/FileUpload";
import Textarea from "../../components/form/Textarea";
import FormActions from "../../components/form/FormActions";
import { orderService } from "../../services/orderService";

import { orderInitialState } from "../../constants/formInitialState/orderInitialState";
import { orderSchema } from "../../validations/orderSchema";
import {
  options as optionList,
  defaultSize,
  companyList,
  brands,
  clientList,
  courierList,
  shippingMethodList,
  apparelTypeList,
  patternTypeList,
  serviceTypeList,
  printMethodList,
  printServiceList,
  sizeLabelList,
  printLabelPlacementList,
  fabricTypeList,
  fabricSupplierList,
  colorList,
  priorityList,
  freebiesOthersList,
  paymentMethods,
  apparelPlacementMeasurements,
  paymentPlans,
} from "../../constants/formOptions/orderOptions";

export default function AddNewOrder() {
  const calculateUnitPrice = (costPrice, quantity) => {
    const cost = parseFloat(costPrice) || 0;
    const qty = parseFloat(quantity) || 0;
    return cost * qty;
  };

  const getDefaultDeadline = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    ...orderInitialState,
    deadline: getDefaultDeadline(),
    brand: brands[0]?.value || "",
    priority: priorityList[1]?.value || "",
    deposit_percentage: 60,
    remaining_balance: 0,
    sizes: defaultSize.map((size) => ({
      id: Date.now() + Math.random(),
      name: size.size,
      costPrice: size.cost_price,
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
    })),
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [summary, setSummary] = useState({
    totalQuantity: 0,
    averageUnitPrice: 0,
    totalAmount: 0,
    totalCost: 0,
  });
  const [rawClients, setRawClients] = useState([]);
  const [clientBrands, setClientBrands] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  const fetchClients = async () => {
    try {
      setClientsLoading(true);

      const response = await orderService.getClients();

      // keep raw data (with brands)
      setRawClients(response.data);
      const formattedClients = response.data.map((client) => ({
        value: client.id,
        label: client.name,
      }));

      setClients(formattedClients);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      setServerError("Failed to load clients.");
    } finally {
      setClientsLoading(false);
    }
  };

  useEffect(() => {
    calculateSummary();
    fetchClients();
  }, [formData.sizes]);

  useEffect(() => {
    if (!formData.client) {
      setClientBrands([]);
      setFormData((prev) => ({
        ...prev,
        company: "",
        method: "",
        courier: "",
      }));
      return;
    }

    const selectedClient = rawClients.find(
      (client) => client.id === formData.client,
    );

    if (!selectedClient) return;

    const addressParts = selectedClient.address
      ? selectedClient.address.split(",").map((part) => part.trim())
      : [];

    const street = addressParts[0] || "";
    const barangay = addressParts[1] || "";
    const city = addressParts[2] || "";
    const province = addressParts[3] || "";
    const postal = addressParts[4] || "";

    const formattedBrands =
      selectedClient.brands?.map((brand) => ({
        value: brand.id,
        label: brand.name,
      })) || [];

    setClientBrands(formattedBrands);

    setFormData((prev) => ({
      ...prev,
      company: formattedBrands[0]?.value || "",

      receiver_name: selectedClient.name || "",
      contact_number: selectedClient.contact_number || "",

      // ✅ SAFE MATCHING
      method:
        shippingMethodList.find((m) => m.value === selectedClient.method)
          ?.value || "",

      courier:
        courierList.find((c) => c.value === selectedClient.courier)?.value ||
        "",

      street_address: street,
      barangay_address: barangay,
      city_address: city,
      province_address: province,
      postal_address: postal,
    }));
  }, [formData.client, rawClients]);

  const calculateSummary = () => {
    let totalQuantity = 0;
    let totalAmount = 0;
    let totalCost = 0;
    let unitPriceSum = 0;
    let sizeCount = 0;

    formData.sizes.forEach((size) => {
      const quantity = parseFloat(size.quantity) || 0;
      const costPrice = parseFloat(size.costPrice) || 0;
      const unitPrice = parseFloat(size.unitPrice) || 0;
      const totalPrice = parseFloat(size.totalPrice) || 0;

      if (quantity > 0) {
        totalQuantity += quantity;
        totalAmount += totalPrice;
        totalCost += costPrice * quantity;
        unitPriceSum += unitPrice;
        sizeCount++;
      }
    });

    const averageUnitPrice = sizeCount > 0 ? unitPriceSum / sizeCount : 0;
    const depositPercentage = 60; // default 60%
    const depositAmount = (totalAmount * depositPercentage) / 100;
    const remainingBalance = totalAmount - depositAmount;

    setSummary({
      totalQuantity,
      averageUnitPrice,
      totalAmount,
      totalCost,
    });

    setFormData((prev) => ({
      ...prev,
      deposit_percentage: depositPercentage,
      remaining_balance: remainingBalance.toFixed(2),
      estimated_total: totalAmount.toFixed(2),
    }));
  };

  const validateField = (name, value) => {
    const fieldSchema = orderSchema[name];
    if (!fieldSchema) return "";

    const { required, pattern, validation, message, invalidMessage } =
      fieldSchema;

    // Check if field is required but empty
    if (required && (value === undefined || value === null || value === "")) {
      return message || `${name} is required.`;
    }

    // Check pattern validation
    if (pattern && value && !pattern.test(value)) {
      return invalidMessage || `${name} is invalid.`;
    }

    // Check custom validation
    if (validation && typeof validation === "function") {
      const isValid = validation(value);
      return isValid ? "" : message || `${name} is invalid.`;
    }

    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    let hasError = false;

    const hasSizeWithQuantity = formData.sizes.some((size) => {
      const quantity = parseInt(size.quantity) || 0;
      return quantity > 0;
    });

    if (!hasSizeWithQuantity) {
      newErrors.sizes =
        "At least one size with quantity greater than 0 is required.";
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    updateField(name, fieldValue);

    if (name === "same_fabric_color") {
      setFormData((prev) => {
        if (fieldValue) {
          // Checkbox checked: set all colors to match fabric_color
          return {
            ...prev,
            same_fabric_color: true,
            thread_color: prev.fabric_color,
            ribbing_color: prev.fabric_color,
          };
        } else {
          // Checkbox unchecked: just update checkbox
          return {
            ...prev,
            same_fabric_color: false,
          };
        }
      });
      return;
    }

    // If fabric_color changes and checkbox is checked, propagate to other colors
    if (name === "fabric_color") {
      setFormData((prev) => ({
        ...prev,
        fabric_color: value,
        ...(prev.same_fabric_color
          ? { thread_color: value, ribbing_color: value }
          : {}),
      }));
      return;
    }

    // Default behavior for other fields
    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    const error = validateField(name, fieldValue);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (serverError) {
      setServerError("");
    }
  };

  const updateField = (name, value) => {
    if (
      [
        "design_files",
        "design_mockup",
        "placement_measurements",
        "payments",
      ].includes(name)
    ) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (serverError) {
      setServerError("");
    }
  };

  const handleSizeChange = (id, field, value) => {
    setFormData((prev) => {
      const updatedSizes = prev.sizes.map((size) => {
        if (size.id === id) {
          const updatedSize = { ...size, [field]: value };

          // Recalculate prices when costPrice or quantity changes
          if (field === "costPrice" || field === "quantity") {
            const cost =
              parseFloat(field === "costPrice" ? value : size.costPrice) || 0;
            const qty =
              parseFloat(field === "quantity" ? value : size.quantity) || 0;

            // Now unitPrice is cost * quantity
            updatedSize.unitPrice = calculateUnitPrice(cost, qty);
            // Total price stays the same (unitPrice)
            updatedSize.totalPrice = updatedSize.unitPrice;
          }

          return updatedSize;
        }
        return size;
      });

      return { ...prev, sizes: updatedSizes };
    });
  };

  const addOption = () => {
    setErrors((prev) => ({ ...prev, options: "", option_color: "" }));
    if (!formData.options) {
      setErrors((prev) => ({ ...prev, options: "Please select an option" }));
      return;
    }

    if (!formData.option_color) {
      setErrors((prev) => ({ ...prev, option_color: "Please enter a color" }));
      return;
    }

    const colorToUse =
      formData.livesOnSite && formData.selectedOptions.length > 0
        ? formData.selectedOptions[0].color
        : formData.option_color;

    const selectedOption = optionList.find(
      (opt) => opt.value === formData.options,
    );
    const optionName = selectedOption ? selectedOption.label : formData.options;
    const newOption = {
      id: Date.now(),
      name: optionName,
      color: colorToUse,
      colorValue: colorToUse,
      applyToAll: formData.livesOnSite,
    };

    setFormData((prev) => ({
      ...prev,
      selectedOptions: [...prev.selectedOptions, newOption],
      options: "",
      option_color: formData.livesOnSite ? prev.option_color : "",
    }));

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.selectedOptions;
      return newErrors;
    });
  };

  const removeOption = (id) => {
    setFormData((prev) => ({
      ...prev,
      selectedOptions: prev.selectedOptions.filter(
        (option) => option.id !== id,
      ),
    }));
  };

  const addSize = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [
        ...prev.sizes,
        {
          id: Date.now() + Math.random(),
          name: "",
          costPrice: 0,
          quantity: 0,
          unitPrice: 0,
          totalPrice: 0,
        },
      ],
    }));
  };

  const removeSize = (id) => {
    // Don't allow removal if only one size left
    if (formData.sizes.length <= 1) {
      alert("You must have at least one size.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((size) => size.id !== id),
    }));
  };

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    setServerError("");
    setSubmitSuccess(false);

    // Clear previous validation errors
    setErrors({});

    // Validate the form
    const isValid = validateForm();

    if (!isValid) {
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Show a general error message if there are validation errors
      if (Object.keys(errors).length > 0) {
        setServerError("Please fix the validation errors below.");
      }

      return;
    }

    try {
      const submitData = {
        ...formData,
        selectedOptions: formData.selectedOptions.map((option) => ({
          name: option.name,
          color: option.color,
          applyToAll: option.applyToAll,
        })),
        sizes: formData.sizes.filter((size) => size.quantity > 0),
        summary,
      };

      console.log("Submitting data:", submitData);

      // ✅ REAL API CALL
      await orderService.createOrder(submitData);

      setSubmitSuccess(true);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission error:", err);

      // Handle server validation errors
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }

      setServerError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while submitting the form.",
      );

      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      ...orderInitialState,
      sizes: defaultSize.map((size) => ({
        id: Date.now() + Math.random(),
        name: size.size,
        costPrice: size.cost_price,
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
      })),
    });
    setErrors({});
    setServerError("");
    setSubmitSuccess(false);
    setSummary({
      totalQuantity: 0,
      averageUnitPrice: 0,
      totalAmount: 0,
      totalCost: 0,
    });
  };

  const handleFileChange = (e) => {
    const { name, value } = e.target;

    // Update the specific file field
    setFormData((prev) => ({
      ...prev,
      [name]: value, // value is already an array from FileUpload component
    }));

    // Validate file field
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (serverError) {
      setServerError("");
    }
  };

  const removeFile = (fieldName, index) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index),
    }));
  };

  return (
    <AdminLayout
      pageTitle="Add Order"
      path="/"
      links={[
        { label: "Home", href: "/" },
        { label: "Orders", href: "/orders" },
      ]}
    >
      <form onSubmit={handleSubmit}>
        <div className="bg-light text-red p-3 lg:p-7 rounded-lg border border-gray-300">
          {/* Show validation errors summary */}
          {Object.keys(errors).length > 0 && !submitSuccess && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <i className="fa-solid fa-exclamation-circle text-red-500 mr-3"></i>
                <div>
                  <p className="text-red-800 font-medium">
                    Please fix the following errors:
                  </p>
                  <ul className="text-red-600 text-sm mt-1 list-disc pl-5">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <i className="fa-solid fa-check-circle text-green-500 mr-3"></i>
                <div>
                  <p className="text-green-800 font-medium">
                    Order submitted successfully!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    {formData.selectedOptions.length} option(s) and{" "}
                    {formData.sizes.filter((s) => s.quantity > 0).length}{" "}
                    size(s) have been saved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {serverError && Object.keys(errors).length === 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <i className="fa-solid fa-exclamation-circle text-red-500 mr-3"></i>
                <div>
                  <p className="text-red-800 font-medium">{serverError}</p>
                  <p className="text-red-600 text-sm mt-1">
                    Please check the form and try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Order Information
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <Select
              label="Client"
              name="client"
              options={clients}
              value={formData.client}
              onChange={handleChange}
              placeholder="Select client"
              searchable
              error={errors.client}
              required
            />

            <Input
              label="Deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              error={errors.deadline}
              type="date"
              required
            />
            <Select
              label="Clothing / Company"
              name="company"
              options={clientBrands}
              value={formData.company}
              onChange={handleChange}
              placeholder={
                !formData.client
                  ? "Select client first"
                  : clientBrands.length === 0
                    ? "No brands available"
                    : "Select brand"
              }
              searchable
              error={errors.brand}
              required
              disabled={!formData.client}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Brand"
                name="brand"
                options={brands}
                value={formData.brand}
                onChange={handleChange}
                placeholder="Select brand"
                searchable
                error={errors.brand}
                required
              />

              <Select
                label="Priority"
                name="priority"
                options={priorityList}
                value={formData.priority}
                onChange={handleChange}
                placeholder="Select Priority"
                searchable
                error={errors.priority}
                required
              />
            </div>
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Courier
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <Select
              label="Preferred Courier"
              name="courier"
              options={courierList}
              value={formData.courier}
              onChange={handleChange}
              placeholder="Select courier"
              searchable
              error={errors.courier}
              required
            />

            <Select
              label="Shipping Method"
              name="method"
              options={shippingMethodList}
              value={formData.method}
              onChange={handleChange}
              placeholder="Select shipping method"
              searchable
              error={errors.method}
              required
            />

            <Input
              label="Receiver's Name"
              name="receiver_name"
              value={formData.receiver_name}
              onChange={handleChange}
              error={errors.receiver_name}
              placeholder="Enter name of receiver"
              type="text"
              required
            />

            <Input
              label="Contact Number"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              error={errors.contact_number}
              placeholder="Enter contact number"
              type="text"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
            <div className="col-span-4">
              <Input
                label="Street"
                name="street_address"
                value={formData.street_address}
                onChange={handleChange}
                error={errors.street_address}
                placeholder="Enter street address"
                type="text"
                required
              />
            </div>

            <Input
              label="Province"
              name="province_address"
              value={formData.province_address}
              onChange={handleChange}
              error={errors.province_address}
              placeholder="Enter province"
              type="text"
              required
            />

            <Input
              label="City"
              name="city_address"
              value={formData.city_address}
              onChange={handleChange}
              error={errors.city_address}
              placeholder="Enter city"
              type="text"
              required
            />

            <Input
              label="Barangay"
              name="barangay_address"
              value={formData.barangay_address}
              onChange={handleChange}
              error={errors.barangay_address}
              placeholder="Enter barangay"
              type="text"
              required
            />

            <Input
              label="Postal Code"
              name="postal_address"
              value={formData.postal_address}
              onChange={handleChange}
              error={errors.postal_address}
              placeholder="Enter postal code"
              type="text"
              required
            />
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Product Details
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div className="col-span-2">
              <Input
                label="Design Name"
                name="design_name"
                value={formData.design_name}
                onChange={handleChange}
                error={errors.design_name}
                placeholder="Enter design name"
                type="text"
                required
              />
            </div>

            <Select
              label="Apparel Type"
              name="apparel_type"
              options={apparelTypeList}
              value={formData.apparel_type}
              onChange={handleChange}
              placeholder="Select apparel type"
              searchable
              error={errors.apparel_type}
              required
            />

            <Select
              label="Pattern Type"
              name="pattern_type"
              options={patternTypeList}
              value={formData.pattern_type}
              onChange={handleChange}
              placeholder="Select pattern type"
              searchable
              error={errors.pattern_type}
              required
            />

            <Select
              label="Service Type"
              name="service_type"
              options={serviceTypeList}
              value={formData.service_type}
              onChange={handleChange}
              placeholder="Select service type"
              searchable
              error={errors.service_type}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Print Method"
                name="print_method"
                options={printMethodList}
                value={formData.print_method}
                onChange={handleChange}
                placeholder="Select print method"
                searchable
                error={errors.print_method}
                required
              />

              <Select
                label="Print Service"
                name="print_service"
                options={printServiceList}
                value={formData.print_service}
                onChange={handleChange}
                placeholder="Select print service"
                searchable
                error={errors.print_service}
                required
              />
            </div>

            <Select
              label="Size Label"
              name="size_label"
              options={sizeLabelList}
              value={formData.size_label}
              onChange={handleChange}
              placeholder="Select size label"
              searchable
              error={errors.size_label}
              required
            />

            <Select
              label="Print Label Placement"
              name="print_label_placement"
              options={printLabelPlacementList}
              value={formData.print_label_placement}
              onChange={handleChange}
              placeholder="Select print label placement"
              searchable
              error={errors.print_label_placement}
              required
            />
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Fabric Details
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div className="col-span-2">
              <Select
                label="Fabric Type"
                name="fabric_type"
                options={fabricTypeList}
                value={formData.fabric_type}
                onChange={handleChange}
                placeholder="Select fabric type"
                searchable
                error={errors.fabric_type}
                required
              />
            </div>

            <Select
              label="Fabric Supplier"
              name="fabric_supplier"
              options={fabricSupplierList}
              value={formData.fabric_supplier}
              onChange={handleChange}
              placeholder="Select fabric supplier"
              searchable
              error={errors.fabric_supplier}
              required
            />

            <Input
              label="Fabric Color"
              name="fabric_color"
              value={formData.fabric_color}
              onChange={handleChange}
              error={errors.fabric_color}
              placeholder="Enter fabric color"
              type="text"
              required
            />

            <div></div>

            <div className="-mt-6 flex items-start">
              <div className="flex justify-center items-center gap-3">
                <input
                  type="checkbox"
                  name="same_fabric_color"
                  id="same_fabric_color"
                  checked={formData.same_fabric_color}
                  onChange={handleChange}
                  className="border-gray-300 border"
                />
                <label
                  htmlFor="same_fabric_color"
                  className="text-primary/55 text-xs"
                >
                  Keep the same color for other
                </label>
              </div>
            </div>

            <Input
              label="Thread Color"
              name="thread_color"
              value={formData.thread_color}
              onChange={handleChange}
              error={errors.thread_color}
              placeholder="Enter thread color"
              type="text"
              required
            />

            <Input
              label="Ribbing Color"
              name="ribbing_color"
              value={formData.ribbing_color}
              onChange={handleChange}
              error={errors.ribbing_color}
              placeholder="Enter ribbing color"
              type="text"
              required
            />
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Add Options
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <Select
              label="Options"
              name="options"
              options={optionList}
              value={formData.options}
              onChange={handleChange}
              placeholder="Select option"
              searchable
              error={errors.options}
            />

            <Input
              label="Color"
              name="option_color"
              placeholder="Enter Options Color"
              value={formData.option_color}
              onChange={handleChange}
              error={errors.option_color}
              type="text"
            />

            <div></div>

            <div className="-mt-6 flex items-start">
              <div className="flex justify-center items-center gap-3">
                <input
                  type="checkbox"
                  name="livesOnSite"
                  id="livesOnSite"
                  checked={formData.livesOnSite}
                  onChange={handleChange}
                  className="border-gray-300 border"
                />
                <label
                  htmlFor="livesOnSite"
                  className="text-primary/55 text-xs"
                >
                  Keep the same color for all options
                </label>
              </div>
            </div>

            {/* Display added options */}
            {formData.selectedOptions.length > 0 && (
              <div className="col-span-2 mt-4">
                <h3 className="font-medium text-primary mb-2">
                  Added Options ({formData.selectedOptions.length}):
                </h3>
                <div className="space-y-2">
                  {formData.selectedOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{option.name}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-full border border-gray-300"
                            style={{ backgroundColor: option.color }}
                            title={option.color}
                          ></span>
                          <span className="text-sm text-gray-600">
                            {option.colorValue}
                          </span>
                        </div>
                        {option.applyToAll && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Same color for all
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOption(option.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove option"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="col-span-2">
              <button
                type="button"
                onClick={addOption}
                className="bg-secondary w-full py-2 text-white rounded-lg border border-gray-300 text-sm hover:bg-secondary/90"
              >
                <i className="fa fa-plus mr-1"></i>Add Options
              </button>
            </div>
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Sizes & Quantities
          </h1>

          <div className="p-4">
            {formData.sizes.map((size) => (
              <div
                key={size.id}
                className="bg-white px-10 my-7 py-5 border border-gray-200 rounded"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                  <Input
                    label="Size"
                    name={`Size-${size.name}`}
                    placeholder="Enter Size"
                    value={size.name}
                    onChange={(e) =>
                      handleSizeChange(size.id, "name", e.target.value)
                    }
                    type="text"
                  />

                  <Input
                    label="Cost Price"
                    name={`costPrice-${size.id}`}
                    placeholder="Enter cost price"
                    value={size.costPrice}
                    onChange={(e) =>
                      handleSizeChange(size.id, "costPrice", e.target.value)
                    }
                    type="number"
                    step="0.01"
                    min="0"
                  />

                  <Input
                    label="Quantity"
                    name={`quantity-${size.id}`}
                    placeholder="Enter quantity"
                    value={size.quantity}
                    onChange={(e) =>
                      handleSizeChange(size.id, "quantity", e.target.value)
                    }
                    type="number"
                    min="0"
                  />

                  <Input
                    label="Unit Price"
                    name={`unitPrice-${size.id}`}
                    placeholder="Unit price"
                    value={size.unitPrice.toFixed(2)}
                    readOnly
                    type="text"
                  />

                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeSize(size.id)}
                      className="flex items-center mt-3 justify-center border border-red-600 py-2 px-5 rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <i className="fa fa-minus mr-2"></i>
                      Remove
                    </button>
                  </div>
                </div>

                {/* <div className="mt-3 text-sm text-gray-600">
                  <span className="font-medium">Total for {size.name}: </span>
                  <span className="text-blue-600 font-bold">
                    ${size.totalPrice.toFixed(2)}
                  </span>
                  <span className="ml-4 text-gray-500">
                    ({size.quantity || 0} × ${size.unitPrice.toFixed(2)})
                  </span>
                  <span className="ml-4 text-gray-500">
                    • Cost: ${(size.costPrice * size.quantity).toFixed(2)}
                  </span>
                </div> */}
              </div>
            ))}
          </div>

          <div className="col-span-2 px-4 mb-6">
            <button
              type="button"
              onClick={addSize}
              className="bg-secondary w-full py-3 text-white rounded-lg border border-gray-300 text-sm hover:bg-secondary/90"
            >
              <i className="fa fa-plus mr-2"></i>Add New Size
            </button>
          </div>

          <h1 className="font-semibold text-xl border-b text-primary mt-5 border-gray-300 pb-1">
            Summary
          </h1>

          <div className="p-4">
            <div className="bg-white px-10 my-7 py-5 border border-gray-200 rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                <Input
                  label="Total Quantity"
                  name="totalQuantity"
                  placeholder="Total items"
                  value={summary.totalQuantity}
                  readOnly
                  type="text"
                />
                <Input
                  label="Average Unit Price"
                  name="averageUnitPrice"
                  placeholder="Average price"
                  value={summary.averageUnitPrice.toFixed(2)}
                  readOnly
                  type="text"
                />
                <Input
                  label="Total Cost"
                  name="totalCost"
                  placeholder="Total cost"
                  value={summary.totalCost.toFixed(2)}
                  readOnly
                  type="text"
                />
                <Input
                  label="Total Amount"
                  name="totalAmount"
                  placeholder="Total amount"
                  value={summary.totalAmount.toFixed(2)}
                  readOnly
                  type="text"
                  className="font-bold text-blue-600"
                />
              </div>
            </div>
          </div>

          <h1 className="font-semibold text-xl border-b text-primary mt-5 border-gray-300 pb-1">
            Design Files & Mockups
          </h1>

          <div className="p-4 lg:px-25">
            <div className="py-4">
              <FileUpload
                label="Design Files"
                name="design_files"
                value={formData.design_files}
                onChange={handleFileChange}
                acceptedTypes="image/*,.ai,.psd,.pdf,.png,.jpg,.jpeg"
                maxSize={25 * 1024 * 1024}
                multiple={true}
                error={errors.design_files}
              />
            </div>

            <div className="py-4">
              <FileUpload
                label="Design Mockup"
                name="design_mockup"
                value={formData.design_mockup}
                onChange={handleFileChange}
                acceptedTypes="image/*,.ai,.psd,.pdf,.png,.jpg,.jpeg"
                maxSize={25 * 1024 * 1024}
                multiple={true}
                error={errors.design_mockup}
              />
            </div>

            <div className="py-4">
              <FileUpload
                label="Size Label"
                name="size_label_files"
                value={formData.size_label_files}
                onChange={handleFileChange}
                acceptedTypes="image/*,.ai,.psd,.pdf,.png,.jpg,.jpeg"
                maxSize={25 * 1024 * 1024}
                multiple={true}
                error={errors.size_label_files}
              />
            </div>

            <div className="px-6 py-4">
              <Select
                label="Placement Measurements"
                name="placement_measurements"
                options={apparelPlacementMeasurements}
                value={formData.placement_measurements}
                onChange={handleChange}
                placeholder="Select Placement Measurements"
                searchable
                error={errors.placement_measurements}
              />

              <Textarea
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={6}
                resizable={true}
              />
            </div>
          </div>

          <h1 className="font-semibold text-xl border-b text-primary mt-5 border-gray-300 pb-1">
            Freebies
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <Input
              label="Items"
              name="freebie_items"
              placeholder="Enter freebie items"
              value={formData.freebie_items}
              onChange={handleChange}
              error={errors.freebie_items}
              type="text"
            />

            <Input
              label="Color"
              name="freebie_color"
              placeholder="Enter freebie color"
              value={formData.freebie_color}
              onChange={handleChange}
              error={errors.freebie_color}
              type="text"
            />

            <div className="col-span-2">
              <Select
                label="Others"
                name="freebie_others"
                options={freebiesOthersList}
                value={formData.freebie_others}
                onChange={handleChange}
                placeholder="Select other freebies"
                searchable
                error={errors.freebie_others}
              />
            </div>
          </div>

          <div className="py-4 lg:px-25">
            <FileUpload
              label="Freebies Files"
              name="freebies_files"
              value={formData.freebies_files}
              onChange={handleFileChange}
              acceptedTypes="image/*,.ai,.psd,.pdf,.png,.jpg,.jpeg"
              maxSize={25 * 1024 * 1024}
              multiple={true}
              error={errors.freebies_files}
            />
          </div>

          <h1 className="font-semibold text-xl border-b text-primary mt-5 border-gray-300 pb-1">
            Pricing & Payment Control
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <Select
              label="Payment Plan"
              name="payment_plan"
              options={paymentPlans}
              value={formData.payment_plan}
              onChange={handleChange}
              placeholder="Select payment method"
              searchable
              error={errors.payment_plan}
              required
            />

            <Select
              label="Payment Method"
              name="payment_method"
              options={paymentMethods}
              value={formData.payment_method}
              onChange={handleChange}
              placeholder="Select payment method"
              searchable
              error={errors.payment_method}
              required
            />

            {formData.payment_plan === "downpayment" && (
              <>
                <Input
                  label="Deposit %"
                  name="deposit_percentage"
                  placeholder="Enter deposit percentage"
                  value={formData.deposit_percentage}
                  onChange={handleChange}
                  error={errors.deposit_percentage}
                  type="text"
                />

                <Input
                  label="Remaining Balance"
                  name="remaining_balance"
                  placeholder="Enter remaining balance"
                  value={formData.remaining_balance}
                  onChange={handleChange}
                  error={errors.remaining_balance}
                  type="text"
                />
              </>
            )}

            <div className="col-span-2">
              <Input
                label="Estimated Total"
                name="estimated_total"
                placeholder="Enter estimated total"
                value={formData.estimated_total}
                onChange={handleChange}
                error={errors.estimated_total}
                type="text"
              />
            </div>
          </div>

          <div className="p-4 lg:px-25">
            <FileUpload
              label="Receipt and Bank Account Details"
              name="payments"
              value={formData.payments}
              onChange={handleFileChange}
              acceptedTypes="image/*,.ai,.psd,.pdf,.png,.jpg,.jpeg"
              maxSize={25 * 1024 * 1024}
              multiple={true}
              error={errors.payments}
            />
          </div>
        </div>
        <FormActions
          onSubmit={handleSubmit}
          onReset={handleReset}
          isSubmitting={isSubmitting}
          submitText="Save"
          resetText="Reset"
          submittingText="Creating Order..."
        />
      </form>
    </AdminLayout>
  );
}
