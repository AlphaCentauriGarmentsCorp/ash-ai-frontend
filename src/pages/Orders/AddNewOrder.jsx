import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  brands,
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
  priorityList,
  freebiesOthersList,
  paymentMethods,
  apparelPlacementMeasurements,
  paymentPlans,
} from "../../constants/formOptions/orderOptions";

// Constants
const DEFAULT_DEADLINE_DAYS = 14;
const DEFAULT_DEPOSIT_PERCENTAGE = 60;

// Helper functions
const getDefaultDeadline = () => {
  const date = new Date();
  date.setDate(date.getDate() + DEFAULT_DEADLINE_DAYS);
  return date.toISOString().split("T")[0];
};

const createSizeObjects = () =>
  defaultSize.map((size) => ({
    id: crypto.randomUUID(),
    name: size.size,
    costPrice: size.cost_price,
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0,
  }));

const parseAddress = (address) => {
  const parts = address?.split(",").map((part) => part.trim()) || [];
  return {
    street: parts[0] || "",
    barangay: parts[1] || "",
    city: parts[2] || "",
    province: parts[3] || "",
    postal: parts[4] || "",
  };
};

const calculateUnitPrice = (costPrice, quantity) =>
  (parseFloat(costPrice) || 0) * (parseFloat(quantity) || 0);

export default function AddNewOrder() {
  // State
  const [formData, setFormData] = useState(() => ({
    ...orderInitialState,
    deadline: getDefaultDeadline(),
    brand: brands[0]?.value || "",
    priority: priorityList[1]?.value || "",
    deposit_percentage: DEFAULT_DEPOSIT_PERCENTAGE,
    remaining_balance: 0,
    estimated_total: 0,
    total_quantity: 0,
    average_unit_price: 0,
    total_cost: 0,
    total_amount: 0,
    sizes: createSizeObjects(),
  }));

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [clients, setClients] = useState([]);
  const [rawClients, setRawClients] = useState([]);
  const [clientBrands, setClientBrands] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  // Memoized values
  const summary = useMemo(
    () => ({
      totalQuantity: formData.total_quantity,
      averageUnitPrice: formData.average_unit_price,
      totalAmount: formData.total_amount,
      totalCost: formData.total_cost,
      remainingBalance: formData.remaining_balance,
      estimatedTotal: formData.estimated_total,
    }),
    [formData],
  );

  // Effects
  useEffect(() => {
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

    const depositPercentage =
      parseFloat(formData.deposit_percentage) || DEFAULT_DEPOSIT_PERCENTAGE;
    const depositAmount = (totalAmount * depositPercentage) / 100;
    const remainingBalance = totalAmount - depositAmount;

    // Update formData with summary values
    setFormData((prev) => ({
      ...prev,
      total_quantity: totalQuantity,
      average_unit_price: sizeCount > 0 ? unitPriceSum / sizeCount : 0,
      total_amount: totalAmount,
      total_cost: totalCost,
      remaining_balance: remainingBalance.toFixed(2),
      estimated_total: totalAmount.toFixed(2),
    }));
  }, [formData.sizes, formData.deposit_percentage]);

  useEffect(() => {
    fetchClients();
  }, []);

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

    const address = parseAddress(selectedClient.address);
    const formattedBrands =
      selectedClient.brands?.map((brand) => ({
        value: brand.name,
        label: brand.name,
      })) || [];

    setClientBrands(formattedBrands);

    setFormData((prev) => ({
      ...prev,
      company: formattedBrands[0]?.value || "",
      receiver_name: selectedClient.name || "",
      contact_number: selectedClient.contact_number || "",
      method:
        shippingMethodList.find((m) => m.value === selectedClient.method)
          ?.value || "",
      courier:
        courierList.find((c) => c.value === selectedClient.courier)?.value ||
        "",
      street_address: address.street,
      barangay_address: address.barangay,
      city_address: address.city,
      province_address: address.province,
      postal_address: address.postal,
    }));
  }, [formData.client, rawClients]);

  // API Calls
  const fetchClients = async () => {
    try {
      setClientsLoading(true);
      const response = await orderService.getClients();
      setRawClients(response.data);
      setClients(
        response.data.map((client) => ({
          value: client.id,
          label: client.name,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      setServerError("Failed to load clients.");
    } finally {
      setClientsLoading(false);
    }
  };

  // Validation (only used during submission)
  const validateField = useCallback((name, value, allData) => {
    const fieldSchema = orderSchema[name];
    if (!fieldSchema) return "";

    const { required, pattern, validation, message, invalidMessage } =
      fieldSchema;

    // Special handling for sizes array
    if (name === "sizes") {
      if (
        fieldSchema.validation &&
        typeof fieldSchema.validation === "function"
      ) {
        return fieldSchema.validation(value)
          ? ""
          : message || `${name} is invalid.`;
      }
      return "";
    }

    if (required && (value === undefined || value === null || value === "")) {
      return message || `${name} is required.`;
    }

    if (pattern && value && !pattern.test(value)) {
      return invalidMessage || `${name} is invalid.`;
    }

    if (validation && typeof validation === "function") {
      return validation(value, allData) ? "" : message || `${name} is invalid.`;
    }

    return "";
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validate all required fields from schema
    Object.keys(orderSchema).forEach((fieldName) => {
      // Handle sizes separately
      if (fieldName === "sizes") {
        const error = validateField("sizes", formData.sizes, formData);
        if (error) newErrors.sizes = error;
        return;
      }

      // Skip file fields if they're not required
      if (
        [
          "design_files",
          "design_mockup",
          "payments",
          "freebies_files",
          "size_label_files",
        ].includes(fieldName)
      ) {
        return;
      }

      const value = formData[fieldName];
      const error = validateField(fieldName, value, formData);
      if (error) newErrors[fieldName] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // Handlers (no validation on change)
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === "checkbox" ? checked : value;

      // Special handling for same_fabric_color
      if (name === "same_fabric_color") {
        setFormData((prev) => ({
          ...prev,
          same_fabric_color: checked,
          ...(checked && {
            thread_color: prev.fabric_color,
            ribbing_color: prev.fabric_color,
          }),
        }));
        return;
      }

      // Special handling for fabric_color with checkbox
      if (name === "fabric_color") {
        setFormData((prev) => ({
          ...prev,
          fabric_color: value,
          ...(prev.same_fabric_color && {
            thread_color: value,
            ribbing_color: value,
          }),
        }));
        return;
      }

      // Default handling
      setFormData((prev) => ({ ...prev, [name]: fieldValue }));

      // Clear server error when user makes changes
      if (serverError) setServerError("");
    },
    [serverError],
  );

  const handleSizeChange = useCallback((id, field, value) => {
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
  }, []);

  const handleDepositPercentageChange = useCallback(
    (e) => {
      const { value } = e.target;
      const percentage = Math.min(100, Math.max(0, parseFloat(value) || 0));

      setFormData((prev) => ({ ...prev, deposit_percentage: percentage }));

      if (serverError) setServerError("");
    },
    [serverError],
  );

  const handleFileChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (serverError) setServerError("");
    },
    [serverError],
  );

  // Option handlers
  const addOption = useCallback(() => {
    const { options, option_color, same_option_color, selectedOptions } =
      formData;

    if (!options) {
      setErrors((prev) => ({ ...prev, options: "Please select an option" }));
      return;
    }

    if (!option_color) {
      setErrors((prev) => ({ ...prev, option_color: "Please enter a color" }));
      return;
    }

    const colorToUse =
      same_option_color && selectedOptions.length > 0
        ? selectedOptions[0].color
        : option_color;

    const selectedOption = optionList.find((opt) => opt.value === options);
    const newOption = {
      id: crypto.randomUUID(),
      name: selectedOption?.label || options,
      color: colorToUse,
      colorValue: colorToUse,
      applyToAll: same_option_color,
    };

    setFormData((prev) => ({
      ...prev,
      selectedOptions: [...prev.selectedOptions, newOption],
      options: "",
      option_color: same_option_color ? prev.option_color : "",
    }));

    // Clear option errors
    setErrors((prev) => {
      const { options, option_color, ...rest } = prev;
      return rest;
    });
  }, [formData]);

  const removeOption = useCallback((id) => {
    setFormData((prev) => ({
      ...prev,
      selectedOptions: prev.selectedOptions.filter(
        (option) => option.id !== id,
      ),
    }));
  }, []);

  // Size handlers
  const addSize = useCallback(() => {
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
  }, []);

  const removeSize = useCallback(
    (id) => {
      if (formData.sizes.length <= 1) {
        alert("You must have at least one size.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        sizes: prev.sizes.filter((size) => size.id !== id),
      }));
    },
    [formData.sizes.length],
  );

  // Form submission
  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    setServerError("");
    setSubmitSuccess(false);
    setErrors({});

    // Validate the form
    const isValid = validateForm();

    if (!isValid) {
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const submitData = {
        ...formData,
        selectedOptions: formData.selectedOptions.map(
          ({ name, color, applyToAll }) => ({
            name,
            color,
            applyToAll,
          }),
        ),
        sizes: formData.sizes.filter((size) => size.quantity > 0),
      };

      await orderService.createOrder(submitData);

      setSubmitSuccess(true);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Submission error:", err);

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
  const handleReset = useCallback(() => {
    setFormData({
      ...orderInitialState,
      deadline: getDefaultDeadline(),
      brand: brands[0]?.value || "",
      priority: priorityList[1]?.value || "",
      deposit_percentage: DEFAULT_DEPOSIT_PERCENTAGE,
      remaining_balance: 0,
      estimated_total: 0,
      total_quantity: 0,
      average_unit_price: 0,
      total_cost: 0,
      total_amount: 0,
      sizes: createSizeObjects(),
    });
    setErrors({});
    setServerError("");
    setSubmitSuccess(false);
  }, []);

  const renderSuccessMessage = () => {
    if (!submitSuccess) return null;

    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
        <div className="flex items-center">
          <i className="fa-solid fa-check-circle text-green-500 mr-3"></i>
          <div>
            <p className="text-green-800 font-medium">
              Order submitted successfully!
            </p>
            <p className="text-green-600 text-sm mt-1">
              {formData.selectedOptions.length} option(s) and{" "}
              {formData.sizes.filter((s) => s.quantity > 0).length} size(s) have
              been saved.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderServerError = () => {
    if (!serverError) return null;

    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center">
          <i className="fa-solid fa-exclamation-circle text-red-500 mr-3"></i>
          <div>
            <p className="text-red-800 font-medium">{serverError}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAddedOptions = () => {
    if (formData.selectedOptions.length === 0) return null;

    return (
      <div className="col-span-1 sm:col-span-2 mt-4">
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
                  />
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
    );
  };

  const renderSizeInputs = () => {
    return formData.sizes.map((size) => (
      <div
        key={size.id}
        className="bg-white px-10 my-7 py-5 border border-gray-200 rounded"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            label="Size"
            name={`Size-${size.name}`}
            placeholder="Enter Size"
            value={size.name || ""}
            onChange={(e) => handleSizeChange(size.id, "name", e.target.value)}
            type="text"
          />

          <Input
            label="Cost Price"
            name={`costPrice-${size.id}`}
            placeholder="Enter cost price"
            value={size.costPrice || 0}
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
            value={size.quantity || 0}
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
            value={size.unitPrice?.toFixed(2) || "0.00"}
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
      </div>
    ));
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
          {renderSuccessMessage()}
          {renderServerError()}

          {/* Order Information */}
          <Section title="Order Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Client"
                name="client"
                options={clients}
                value={formData.client || ""}
                onChange={handleChange}
                placeholder="Select client"
                searchable
                error={errors.client}
                required
              />

              <Input
                label="Deadline"
                name="deadline"
                value={formData.deadline || ""}
                onChange={handleChange}
                error={errors.deadline}
                type="date"
                required
              />

              <Select
                label="Clothing / Company"
                name="company"
                options={clientBrands}
                value={formData.company || ""}
                onChange={handleChange}
                placeholder={
                  !formData.client
                    ? "Select client first"
                    : clientBrands.length === 0
                      ? "No brands available"
                      : "Select brand"
                }
                searchable
                error={errors.company}
                required
                disabled={!formData.client}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Brand"
                  name="brand"
                  options={brands}
                  value={formData.brand || ""}
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
                  value={formData.priority || ""}
                  onChange={handleChange}
                  placeholder="Select Priority"
                  searchable
                  error={errors.priority}
                  required
                />
              </div>
            </div>
          </Section>

          {/* Courier Section */}
          <Section title="Courier">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Preferred Courier"
                name="courier"
                options={courierList}
                value={formData.courier || ""}
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
                value={formData.method || ""}
                onChange={handleChange}
                placeholder="Select shipping method"
                searchable
                error={errors.method}
                required
              />

              <Input
                label="Receiver's Name"
                name="receiver_name"
                value={formData.receiver_name || ""}
                onChange={handleChange}
                error={errors.receiver_name}
                placeholder="Enter name of receiver"
                type="text"
                required
              />

              <Input
                label="Contact Number"
                name="contact_number"
                value={formData.contact_number || ""}
                onChange={handleChange}
                error={errors.contact_number}
                placeholder="Enter contact number"
                type="text"
                required
              />
            </div>

            <AddressFields
              formData={formData}
              handleChange={handleChange}
              errors={errors}
            />
          </Section>

          {/* Product Details */}
          <Section title="Product Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-1 sm:col-span-2">
                <Input
                  label="Design Name"
                  name="design_name"
                  value={formData.design_name || ""}
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
                value={formData.apparel_type || ""}
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
                value={formData.pattern_type || ""}
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
                value={formData.service_type || ""}
                onChange={handleChange}
                placeholder="Select service type"
                searchable
                error={errors.service_type}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Print Method"
                  name="print_method"
                  options={printMethodList}
                  value={formData.print_method || ""}
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
                  value={formData.print_service || ""}
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
                value={formData.size_label || ""}
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
                value={formData.print_label_placement || ""}
                onChange={handleChange}
                placeholder="Select print label placement"
                searchable
                error={errors.print_label_placement}
                required
              />
            </div>
          </Section>

          {/* Fabric Details */}
          <Section title="Fabric Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-1 sm:col-span-2">
                <Select
                  label="Fabric Type"
                  name="fabric_type"
                  options={fabricTypeList}
                  value={formData.fabric_type || ""}
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
                value={formData.fabric_supplier || ""}
                onChange={handleChange}
                placeholder="Select fabric supplier"
                searchable
                error={errors.fabric_supplier}
                required
              />

              <Input
                label="Fabric Color"
                name="fabric_color"
                value={formData.fabric_color || ""}
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
                    checked={formData.same_fabric_color || false}
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
                value={formData.thread_color || ""}
                onChange={handleChange}
                error={errors.thread_color}
                placeholder="Enter thread color"
                type="text"
                required
              />

              <Input
                label="Ribbing Color"
                name="ribbing_color"
                value={formData.ribbing_color || ""}
                onChange={handleChange}
                error={errors.ribbing_color}
                placeholder="Enter ribbing color"
                type="text"
                required
              />
            </div>
          </Section>

          {/* Options Section */}
          <Section title="Add Options">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Options"
                name="options"
                options={optionList}
                value={formData.options || ""}
                onChange={handleChange}
                placeholder="Select option"
                searchable
                error={errors.options}
              />

              <Input
                label="Color"
                name="option_color"
                placeholder="Enter Options Color"
                value={formData.option_color || ""}
                onChange={handleChange}
                error={errors.option_color}
                type="text"
              />

              <div className="-mt-6 flex items-start">
                <div className="flex justify-center items-center gap-3">
                  <input
                    type="checkbox"
                    name="same_option_color"
                    id="same_option_color"
                    checked={formData.same_option_color || false}
                    onChange={handleChange}
                    className="border-gray-300 border"
                  />
                  <label
                    htmlFor="same_option_color"
                    className="text-primary/55 text-xs"
                  >
                    Keep the same color for all options
                  </label>
                </div>
              </div>

              {renderAddedOptions()}

              <div className="col-span-1 sm:col-span-2">
                <button
                  type="button"
                  onClick={addOption}
                  className="bg-secondary w-full py-2 text-white rounded-lg border border-gray-300 text-sm hover:bg-secondary/90"
                >
                  <i className="fa fa-plus mr-1"></i>Add Options
                </button>
              </div>
            </div>
          </Section>

          {/* Sizes Section */}
          <Section title="Sizes & Quantities">
            <div className="p-4">
              {renderSizeInputs()}

              <div className="col-span-2 px-4 mb-6">
                <button
                  type="button"
                  onClick={addSize}
                  className="bg-secondary w-full py-3 text-white rounded-lg border border-gray-300 text-sm hover:bg-secondary/90"
                >
                  <i className="fa fa-plus mr-2"></i>Add New Size
                </button>
              </div>
            </div>
          </Section>

          {/* Summary Section */}
          <Section title="Summary">
            <div className="p-4">
              <div className="bg-white px-10 my-7 py-5 border border-gray-200 rounded">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          </Section>

          {/* Design Files Section */}
          <Section title="Design Files & Mockups">
            <div className="px-2 lg:px-25">
              <FileUploadSection
                label="Design Files"
                name="design_files"
                value={formData.design_files || []}
                onChange={handleFileChange}
                error={errors.design_files}
              />

              <FileUploadSection
                label="Design Mockup"
                name="design_mockup"
                value={formData.design_mockup || []}
                onChange={handleFileChange}
                error={errors.design_mockup}
              />

              <FileUploadSection
                label="Size Label"
                name="size_label_files"
                value={formData.size_label_files || []}
                onChange={handleFileChange}
                error={errors.size_label_files}
              />

              <div className="px-6 py-4">
                <Select
                  label="Placement Measurements"
                  name="placement_measurements"
                  options={apparelPlacementMeasurements}
                  value={formData.placement_measurements || ""}
                  onChange={handleChange}
                  placeholder="Select Placement Measurements"
                  searchable
                  error={errors.placement_measurements}
                />

                <Textarea
                  label="Notes"
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleChange}
                  rows={6}
                  resizable={true}
                />
              </div>
            </div>
          </Section>

          {/* Freebies Section */}
          <Section title="Freebies">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
              <Select
                label="Freebie"
                name="freebie_items"
                options={freebiesOthersList}
                value={formData.freebie_items || ""}
                onChange={handleChange}
                placeholder="Select other freebies"
                searchable
                error={errors.freebie_items}
              />

              <Input
                label="Color"
                name="freebie_color"
                placeholder="Enter freebie color"
                value={formData.freebie_color || ""}
                onChange={handleChange}
                error={errors.freebie_color}
                type="text"
              />

              <div className="col-span-2">
                <Input
                  label="Others"
                  name="freebie_others"
                  placeholder="Enter freebie items"
                  value={formData.freebie_others || ""}
                  onChange={handleChange}
                  error={errors.freebie_others}
                  type="text"
                />
              </div>
            </div>

            <div className="py-4 lg:px-25">
              <FileUploadSection
                label="Freebies Files"
                name="freebies_files"
                value={formData.freebies_files || []}
                onChange={handleFileChange}
                error={errors.freebies_files}
              />
            </div>
          </Section>

          {/* Payment Section */}
          <Section title="Pricing & Payment Control">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
              <Select
                label="Payment Plan"
                name="payment_plan"
                options={paymentPlans}
                value={formData.payment_plan || ""}
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
                value={formData.payment_method || ""}
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
                    onChange={handleDepositPercentageChange}
                    error={errors.deposit_percentage}
                    type="number"
                    min="0"
                    max="100"
                  />

                  <Input
                    label="Remaining Balance"
                    name="remaining_balance"
                    placeholder="Enter remaining balance"
                    value={summary.remainingBalance}
                    readOnly
                  />
                </>
              )}

              <div className="col-span-2">
                <Input
                  label="Estimated Total"
                  name="estimated_total"
                  placeholder="Enter estimated total"
                  value={summary.estimatedTotal}
                  readOnly
                />
              </div>
            </div>

            <div className="p-4 lg:px-25">
              <FileUploadSection
                label="Receipt and Bank Account Details"
                name="payments"
                value={formData.payments || []}
                onChange={handleFileChange}
                error={errors.payments}
              />
            </div>
          </Section>
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

// Helper Components
const Section = ({ title, children }) => (
  <>
    <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
      {title}
    </h1>
    <div className="p-4">{children}</div>
  </>
);

const AddressFields = ({ formData, handleChange, errors }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ">
    <div className="col-span-1 sm:col-span-2 md:col-span-4">
      <Input
        label="Street"
        name="street_address"
        value={formData.street_address || ""}
        onChange={handleChange}
        error={errors.street_address}
        placeholder="Enter street address"
        type="text"
      />
    </div>

    <Input
      label="Province"
      name="province_address"
      value={formData.province_address || ""}
      onChange={handleChange}
      error={errors.province_address}
      placeholder="Enter province"
      type="text"
    />

    <Input
      label="City"
      name="city_address"
      value={formData.city_address || ""}
      onChange={handleChange}
      error={errors.city_address}
      placeholder="Enter city"
      type="text"
    />

    <Input
      label="Barangay"
      name="barangay_address"
      value={formData.barangay_address || ""}
      onChange={handleChange}
      error={errors.barangay_address}
      placeholder="Enter barangay"
      type="text"
    />

    <Input
      label="Postal Code"
      name="postal_address"
      value={formData.postal_address || ""}
      onChange={handleChange}
      error={errors.postal_address}
      placeholder="Enter postal code"
      type="text"
    />
  </div>
);

const FileUploadSection = ({ label, name, value, onChange, error }) => (
  <div className="py-4">
    <FileUpload
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      acceptedTypes="image/*,.ai,.psd,.pdf,.png,.jpg,.jpeg"
      maxSize={25 * 1024 * 1024}
      multiple={true}
      error={error}
    />
  </div>
);
