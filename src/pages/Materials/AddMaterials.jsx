import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Textarea from "../../components/form/Textarea";
import FormActions from "../../components/form/FormActions";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import { materialsInitialState } from "../../constants/formInitialState/materialsInitialState";
import { materialsSchema } from "../../validations/materialsSchema";
import { validateForm, hasErrors } from "../../utils/validation";
import { materialsApi } from "../../api/materialsApi";
import { supplierApi } from "../../api/supplierApi";
import { MaterialOptions } from "../../constants/formOptions/materialOptions";
const AddMaterials = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(materialsInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [supplierOptions, setSupplierOptions] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setServerError("");

    const validationErrors = validateForm(formData, materialsSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await materialsApi.create(formData);
      setSubmitSuccess(true);

      setFormData(materialsInitialState);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError("Failed to create materials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(materialsInitialState);
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  useEffect(() => {
    fetchSupplier();
  }, [formData.supplier_id]);

  const fetchSupplier = async () => {
    try {
      const response = await supplierApi.index();
      const options = response.data.map((supplier) => ({
        value: supplier.id,
        label: supplier.name,
      }));
      setSupplierOptions(options);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  return (
    <AdminLayout
      pageTitle="Add Materials"
      links={[
        { label: "Home", href: "/" },
        { label: "Materials", href: "/materials" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <i className="fa-solid fa-check-circle text-green-500 mr-3"></i>
              <div>
                <p className="text-green-800 font-medium">
                  Materials added successfully!
                </p>
                <p className="text-green-600 text-sm mt-1">
                  The new materials have been added to system.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Server Error Message */}
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

        <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-2 mb-4">
          Materials Details
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-15 px-7">
          <div className="col-span-2">
            <Input
              label="Material Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              type="text"
              placeholder="Enter materials code name"
              required
            />
          </div>

          <Select
            label="Material Type"
            name="material_type"
            options={MaterialOptions}
            value={formData.material_type}
            onChange={handleChange}
            error={errors.material_type}
            placeholder="Select a Supplier"
            searchable
            required
          />

          <Select
            label="Material Supplier"
            name="supplier_id"
            options={supplierOptions}
            value={formData.supplier_id}
            onChange={handleChange}
            error={errors.supplier_id}
            placeholder="Select a Supplier"
            searchable
            required
          />

          <Input
            label="Price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            error={errors.price}
            type="number"
            placeholder="Enter material price"
            required
          />

          <Input
            label="Unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            error={errors.unit}
            type="text"
            placeholder="Enter material units"
            required
          />

          <Input
            label="Minimun Units"
            name="minimum"
            value={formData.minimum}
            onChange={handleChange}
            error={errors.minimum}
            type="text"
            placeholder="Enter minimum unit to order"
          />

          <Input
            label="Lead Time"
            name="lead"
            value={formData.lead}
            onChange={handleChange}
            error={errors.lead}
            type="text"
            placeholder="Enter material lead time"
          />
        </div>

        <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-2 mb-4 mt-7">
          Notes
        </h1>

        <div className="px-7">
          <Textarea
            label="Notes"
            name="notes"
            value={formData.notes}
            error={errors.notes}
            onChange={handleChange}
            rows={10}
            resizable
            placeholder="Enter materials notes"
          />
        </div>
      </div>

      <FormActions
        onSubmit={handleSubmit}
        onReset={handleReset}
        isSubmitting={isSubmitting}
        submitText="Save"
        resetText="Reset"
        submittingText="Saving..."
      />
    </AdminLayout>
  );
};

export default AddMaterials;
