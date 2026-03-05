import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Input from "../../../components/form/Input";
import Textarea from "../../../components/form/Textarea";
import Select from "../../../components/form/Select";
import FileUpload from "../../../components/form/FileUpload";
import ImageUpload from "../../../components/form/ImageUpload";
import FormActions from "../../../components/form/FormActions";
import { equipmentInventoryInitialState } from "../../../constants/formInitialState/equipmentInventoryInitialState";
import { equipmentInventorySchema } from "../../../validations/equipmentInventorySchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { equipmentInventoryApi } from "../../../api/equipmentInventoryApi";
import { equipmentLocationApi } from "../../../api/equipmentLocationApi";

export default function AddNewEquipment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(equipmentInventoryInitialState);
  const [errors, setErrors] = useState({});
  const [LocationOptions, setLocationOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFileChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    updateField(name, fieldValue);
  };

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (serverError) {
      setServerError("");
    }
  };

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    setServerError("");
    setSubmitSuccess(false);
    const validationErrors = validateForm(formData, equipmentInventorySchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);

      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await equipmentInventoryApi.create(formData);
      setSubmitSuccess(true);
      setErrors({});

      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        navigate("/equipment-inventory");
      }, 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to add equipment.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(AccountInitialState);
    setErrors({});
    setServerError("");
    setSubmitSuccess(false);
  };

  const handleImageUpload = (file) => {
    setSelectedImage(file);

    updateField("image", file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl("");
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [formData.location_id]);

  const fetchLocations = async () => {
    try {
      const response = await equipmentLocationApi.index();
      const options = response.data.map((loc) => ({
        value: loc.id,
        label: loc.name,
      }));
      setLocationOptions(options);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  return (
    <AdminLayout
      pageTitle="Add Equipment"
      path="/equipment-inventory/equipment/add"
      links={[
        { label: "Home", href: "/" },
        { label: "Equipment Inventory", href: "/equipment-inventory" },
      ]}
    >
      <form onSubmit={handleSubmit}>
        <div className="bg-light text-red p-3 lg:p-7 rounded-lg border border-gray-300">
          {/* Success Message */}
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <i className="fa-solid fa-check-circle text-green-500 mr-3"></i>
                <div>
                  <p className="text-green-800 font-medium">
                    Equipment added successfully!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    The new equipment has been added to the inventory.
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

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Add New Equipment
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-7 p-4">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-3">
                <Input
                  label="Item Name"
                  name="name"
                  placeholder="Enter item  name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  error={errors.name}
                  type="text"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Quantity"
                    name="quantity"
                    placeholder="Enter quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    error={errors.quantity}
                    required
                    type="number"
                  />

                  <Input
                    label="Color"
                    name="color"
                    placeholder="Enter color"
                    value={formData.color}
                    onChange={handleChange}
                    error={errors.color}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Model / Year"
                    name="model"
                    placeholder="Enter model / year name"
                    value={formData.model}
                    onChange={handleChange}
                    error={errors.model}
                  />

                  <Input
                    label="Material"
                    name="material"
                    placeholder="Enter material"
                    value={formData.material}
                    onChange={handleChange}
                    error={errors.material}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    name="price"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={handleChange}
                    error={errors.price}
                  />

                  <Input
                    label="Penalty"
                    name="penalty"
                    placeholder="Enter penalty"
                    value={formData.penalty}
                    onChange={handleChange}
                    error={errors.penalty}
                  />
                </div>

                <div className="col-span-2">
                  <Textarea
                    label="Design"
                    name="design"
                    value={formData.design}
                    error={errors.design}
                    onChange={handleChange}
                    rows={3}
                    resizable
                    placeholder="Enter design description"
                  />
                </div>

                <div className="col-span-2">
                  <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    error={errors.description}
                    onChange={handleChange}
                    rows={3}
                    resizable
                    placeholder="Enter equipment description"
                  />
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-200 bg-white rounded-lg min-h-50 w-full overflow-hidden">
              {previewUrl ? (
                <div className="w-full h-full min-h-50 relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* File info overlay */}
                  {selectedImage && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 text-xs">
                      <p className="font-medium truncate">
                        {selectedImage.name}
                      </p>
                      <p className="text-gray-300">
                        {(selectedImage.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full min-h-50 flex flex-col items-center justify-center">
                  <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-300 mb-3"></i>
                  <p className="text-gray-400 text-sm">No image selected</p>
                  <p className="text-gray-300 text-xs mt-1">
                    Upload an image to see preview
                  </p>
                </div>
              )}
            </div>
            <Select
              label="Equipment Location"
              name="location_id"
              options={LocationOptions}
              value={formData.location_id}
              onChange={handleChange}
              error={errors.location_id}
              placeholder="Select a location"
              searchable
              required
            />

            <ImageUpload
              label="Item Image"
              name="image"
              accept="image/jpeg,image/png"
              maxSize={2 * 1024 * 1024}
              onChange={handleImageUpload}
            />
          </div>

          <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
            Documents
          </h1>

          <div className="px-4 lg:px-25 mt-6">
            <FileUpload
              label="Receipt Upload"
              name="receipt"
              value={formData.receipt}
              onChange={handleFileChange}
              acceptedTypes="image/*,.ai,.psd,.pdf,.png,.jpg,.jpeg"
              maxSize={25 * 1024 * 1024}
              multiple={true}
              error={errors.receipt}
            />
          </div>
        </div>
        {/* Submit Button */}
        <FormActions
          onSubmit={handleSubmit}
          onReset={handleReset}
          isSubmitting={isSubmitting}
          submitText="Save"
          resetText="Reset"
          submittingText="Adding Equipment..."
        />
      </form>
    </AdminLayout>
  );
}
