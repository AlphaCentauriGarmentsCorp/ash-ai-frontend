import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import FileUpload from "../../components/form/FileUpload";
import Textarea from "../../components/form/Textarea";
import FormActions from "../../components/form/FormActions";

import { orderInitialState } from "../../constants/formInitialState/orderInitialState";
import {
  options as optionList,
  defaultSize,
  brands,
  companyList,
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
} from "../../constants/formOptions/orderOptions";

export default function AddNewClient() {
  const calculateUnitPrice = (costPrice, quantity) => {
    const cost = parseFloat(costPrice) || 0;
    const qty = parseFloat(quantity) || 0;
    return cost * qty;
  };

  const [formData, setFormData] = useState({
    ...orderInitialState,
    options: "",
    option_color: "",
    livesOnSite: false,
    selectedOptions: [],
    // Add separate file fields as arrays
    design_files: [],
    design_mockup: [],
    placement_measurements: [],
    payments: [],
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

  // Calculate summary whenever sizes change
  useEffect(() => {
    calculateSummary();
  }, [formData.sizes]);

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

    setSummary({
      totalQuantity,
      averageUnitPrice,
      totalAmount,
      totalCost,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    updateField(name, fieldValue);
  };

  const updateField = (name, value) => {
    // Skip if this is a file field (file fields use handleFileChange)
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

    if (errors[name]) {
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
    // Validation
    if (!formData.options) {
      setErrors({ options: "Please select an option" });
      return;
    }

    if (!formData.option_color) {
      setErrors({ option_color: "Please enter a color" });
      return;
    }

    // Determine the color to use
    const colorToUse =
      formData.livesOnSite && formData.selectedOptions.length > 0
        ? formData.selectedOptions[0].color
        : formData.option_color;

    // Find the selected option label
    const selectedOption = optionList.find(
      (opt) => opt.value === formData.options,
    );
    const optionName = selectedOption ? selectedOption.label : formData.options;

    // Create new option object
    const newOption = {
      id: Date.now(), // Simple ID for removal
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

    // Clear any errors
    setErrors({});
  };

  // Remove an option from selectedOptions
  const removeOption = (id) => {
    setFormData((prev) => ({
      ...prev,
      selectedOptions: prev.selectedOptions.filter(
        (option) => option.id !== id,
      ),
    }));
  };

  // Add a new size
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

  // Remove a size
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

    // Check if at least one option is added
    if (formData.selectedOptions.length === 0) {
      setServerError("Please add at least one option before submitting.");
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      // Prepare the final data structure
      const submitData = {
        ...orderInitialState,
        selectedOptions: formData.selectedOptions.map((option) => ({
          name: option.name,
          color: option.color,
          applyToAll: option.applyToAll,
        })),
        sizes: formData.sizes.filter((size) => size.quantity > 0),
        summary: summary,
      };

      // Replace with your actual API call
      console.log("Submitting data:", submitData);
      // await clientService.createClient(submitData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitSuccess(true);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setServerError(
        err.message || "An error occurred while submitting the form.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      ...orderInitialState,
      options: "",
      option_color: "",
      livesOnSite: false,
      selectedOptions: [],
      // Reset file fields too
      design_files: [],
      design_mockup: [],
      placement_measurements: [],
      payments: [],
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

    // Clear error for this field
    if (errors[name]) {
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

          {serverError && (
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
              options={clientList}
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
              options={companyList}
              value={formData.client}
              onChange={handleChange}
              placeholder="Select client"
              searchable
              error={errors.client}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              <Select
                label="Brand"
                name="Brand"
                options={brands}
                value={formData.brand}
                onChange={handleChange}
                placeholder="Select client"
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
              value={formData.client}
              onChange={handleChange}
              placeholder="Select client"
              searchable
              error={errors.client}
              required
            />

            <Select
              label="Shipping Method"
              name="shipping_method"
              options={shippingMethodList}
              value={formData.client}
              onChange={handleChange}
              placeholder="Select client"
              searchable
              error={errors.client}
              required
            />

            <Input
              label="Receiver’s Name"
              name="receiver_name"
              value={formData.deadline}
              onChange={handleChange}
              error={errors.deadline}
              placeholder="Eneter name of receiver"
              type="text"
              required
            />

            <Input
              label="Contact Number"
              name="contact_number"
              value={formData.deadline}
              onChange={handleChange}
              error={errors.deadline}
              placeholder="Eneter contact number"
              type="number"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
            <div className="col-span-4">
              <Input
                label="Street"
                name="street_address"
                value={formData.deadline}
                onChange={handleChange}
                error={errors.deadline}
                placeholder="Eneter name of receiver"
                type="text"
                required
              />
            </div>

            <Input
              label="Province"
              name="province_address"
              value={formData.deadline}
              onChange={handleChange}
              error={errors.deadline}
              placeholder="Eneter name of receiver"
              type="text"
              required
            />
            <Input
              label="City"
              name="city_address"
              value={formData.deadline}
              onChange={handleChange}
              error={errors.deadline}
              placeholder="Eneter name of receiver"
              type="text"
              required
            />
            <Input
              label="Barangay"
              name="barangay_address"
              value={formData.deadline}
              onChange={handleChange}
              error={errors.deadline}
              placeholder="Eneter name of receiver"
              type="text"
              required
            />
            <Input
              label="Postal Code"
              name="postal_address"
              value={formData.deadline}
              onChange={handleChange}
              error={errors.deadline}
              placeholder="Eneter name of receiver"
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
                value={formData.deadline}
                onChange={handleChange}
                error={errors.deadline}
                placeholder="Eneter name of receiver"
                type="text"
                required
              />
            </div>
            <Select
              label="Apparel Type"
              name="courier"
              options={apparelTypeList}
              value={formData.client}
              onChange={handleChange}
              placeholder="Select client"
              searchable
              error={errors.client}
              required
            />
            <Select
              label="Pattern Type"
              name="courier"
              options={patternTypeList}
              value={formData.client}
              onChange={handleChange}
              placeholder="Select client"
              searchable
              error={errors.client}
              required
            />
            <Select
              label="Service Type"
              name="courier"
              options={serviceTypeList}
              value={formData.client}
              onChange={handleChange}
              placeholder="Select client"
              searchable
              error={errors.client}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
              <Select
                label="Print Method"
                name="courier"
                options={printMethodList}
                value={formData.client}
                onChange={handleChange}
                placeholder="Select client"
                searchable
                error={errors.client}
                required
              />
              <Select
                label="Print Service"
                name="courier"
                options={printServiceList}
                value={formData.client}
                onChange={handleChange}
                placeholder="Select client"
                searchable
                error={errors.client}
                required
              />
            </div>
            <Select
              label="Size Label"
              name="courier"
              options={sizeLabelList}
              value={formData.client}
              onChange={handleChange}
              placeholder="Select client"
              searchable
              error={errors.client}
              required
            />
            <Select
              label="Print Label Placement"
              name="courier"
              options={printLabelPlacementList}
              value={formData.client}
              onChange={handleChange}
              placeholder="Select client"
              searchable
              error={errors.client}
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
                name="courier"
                options={fabricTypeList}
                value={formData.client}
                onChange={handleChange}
                placeholder="Select client"
                searchable
                error={errors.client}
                required
              />
            </div>

            <Select
              label="Fabric Supplier"
              name="courier"
              options={fabricSupplierList}
              value={formData.client}
              onChange={handleChange}
              placeholder="Select client"
              searchable
              error={errors.client}
              required
            />
            <Input
              label="Fabric Color"
              name="receiver_name"
              value={formData.deadline}
              onChange={handleChange}
              error={errors.deadline}
              placeholder="Eneter name of receiver"
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
                  checked={formData.livesOnSite}
                  onChange={handleChange}
                  className="border-gray-300 border"
                />
                <label
                  htmlFor="livesOnSite"
                  className="text-primary/55 text-xs"
                >
                  Keep the same color for other
                </label>
              </div>
            </div>
            <Input
              label="Thread Color"
              name="receiver_name"
              value={formData.deadline}
              onChange={handleChange}
              error={errors.deadline}
              placeholder="Eneter name of receiver"
              type="text"
              required
            />
            <Input
              label="Ribbing Color"
              name="receiver_name"
              value={formData.deadline}
              onChange={handleChange}
              error={errors.deadline}
              placeholder="Eneter name of receiver"
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

            <div className="px-6 py-4">
              <Select
                label="Placement Measurements"
                name="courier"
                options={clientList}
                value={formData.client}
                onChange={handleChange}
                placeholder="Select Placement Measurements"
                searchable
                error={errors.client}
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
              name="option_color"
              placeholder="Enter Options Color"
              value={formData.option_color}
              onChange={handleChange}
              error={errors.option_color}
              type="text"
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

            <div className="col-span-2">
              <Select
                label="Others"
                name="courier"
                options={freebiesOthersList}
                value={formData.client}
                onChange={handleChange}
                placeholder="Select client"
                searchable
                error={errors.client}
              />
            </div>
          </div>

          <h1 className="font-semibold text-xl border-b text-primary mt-5 border-gray-300 pb-1">
            Pricing & Payment Control
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <Input
              label="Deposit %"
              name="option_color"
              placeholder="Enter Options Color"
              value="60%"
              onChange={handleChange}
              error={errors.option_color}
              type="text"
              readOnly
            />

            <Select
              label="Payment Method"
              name="courier"
              options={paymentMethods}
              value={formData.client}
              onChange={handleChange}
              placeholder="Select client"
              searchable
              error={errors.client}
              required
            />

            <div className="col-span-2">
              <Input
                label="Estimated Total"
                name="option_color"
                placeholder="Enter Options Color"
                value={formData.option_color}
                onChange={handleChange}
                error={errors.option_color}
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
          submittingText="Creating Account..."
        />
      </form>
    </AdminLayout>
  );
}
