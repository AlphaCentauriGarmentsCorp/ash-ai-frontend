import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Textarea from "../../components/form/Textarea";
import FormActions from "../../components/form/FormActions";
import Input from "../../components/form/Input";
import Select from "../../components/form/Select";
import Loader from "../../components/common/Loader";
import { materialsInitialState } from "../../constants/formInitialState/materialsInitialState";
import { materialsSchema } from "../../validations/materialsSchema";
import { validateForm, hasErrors } from "../../utils/validation";
import { applyApiError } from "../../utils/applyApiError";
import { materialsApi } from "../../api/materialsApi";
import { supplierApi } from "../../api/supplierApi";

const EditMaterials = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    fetchSupplier();
    fetchMaterial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMaterial = async () => {
    try {
      const response = await materialsApi.show(id);
      const material = response.data ?? response;
      setFormData({
        supplier_id: material.supplier_id ?? "",
        name: material.name ?? "",
        material_type: material.material_type ?? "",
        unit: material.unit ?? "",
        price: material.price ?? "",
        stock_on_hand: material.stock_on_hand ?? "",
        minimum: material.minimum ?? "",
        lead: material.lead ?? "",
        notes: material.notes ?? "",
      });
    } catch (error) {
      setServerError("Failed to load material.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSupplier = async () => {
    try {
      const response = await supplierApi.index();
      const options = response.data.map((supplier) => ({
        value: supplier.id,
        label: supplier.name,
      }));
      setSupplierOptions(options);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
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
      await materialsApi.update(id, formData);
      setSubmitSuccess(true);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        navigate("/supplier/materials");
      }, 1200);
    } catch (err) {
      applyApiError(err, { setErrors, setServerError });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    fetchMaterial();
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  if (isLoading) {
    return (
      <Loader
        pageTitle="Edit Materials"
        links={[
          { label: "Home", href: "/" },
          { label: "Materials", href: "/supplier/materials" },
        ]}
      />
    );
  }

  return (
    <AdminLayout
      pageTitle="Edit Materials"
      links={[
        { label: "Home", href: "/" },
        { label: "Materials", href: "/supplier/materials" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <i className="fa-solid fa-check-circle text-green-500 mr-3"></i>
              <div>
                <p className="text-green-800 font-medium">
                  Material updated successfully!
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Your changes have been saved.
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
              placeholder="Enter material name"
              required
            />
          </div>

          <Input
            label="Material Type"
            name="material_type"
            value={formData.material_type}
            onChange={handleChange}
            error={errors.material_type}
            type="text"
            placeholder="Enter material type"
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
          />

          <Input
            label="Price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            error={errors.price}
            type="number"
            placeholder="Enter material price"
          />

          <Input
            label="Unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            error={errors.unit}
            type="text"
            placeholder="Enter material units"
          />

          <Input
            label="Stock on Hand"
            name="stock_on_hand"
            value={formData.stock_on_hand}
            onChange={handleChange}
            error={errors.stock_on_hand}
            type="number"
            placeholder="Enter current stock on hand"
          />

          <Input
            label="Minimum Units"
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
        submitText="Update"
        resetText="Reset"
        submittingText="Updating..."
      />
    </AdminLayout>
  );
};

export default EditMaterials;
