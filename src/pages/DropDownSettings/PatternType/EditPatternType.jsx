import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import FileUpload from "../../../components/form/FileUpload";
import { typesInitialState } from "../../../constants/formInitialState/typesInitialState";
import { typesSchema } from "../../../validations/typesSchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { patternTypeApi } from "../../../api/patternTypeApi";
import AlertMessage from "../../../components/common/AlertMessage";

const EditPatternType = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(typesInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    fetchPatternType();
  }, []);

  const fetchPatternType = async () => {
    try {
      const response = await patternTypeApi.show(id);
      const data = response.data;
      setFormData({
        name: data.name || "",
        description: data.description || "",
        pattern_images: [],
      });
      setExistingImages(data.pattern_images || []);
    } catch (error) {
      setServerError("Failed to load pattern type.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setServerError("");

    // Custom validation for edit - pattern_images not required if existing images exist
    const validationSchema = {
      ...typesSchema,
      pattern_images: {
        ...typesSchema.pattern_images,
        required: existingImages.length === 0,
        custom: (value) => {
          if (existingImages.length === 0 && (!value || value.length === 0)) {
            return "At least one pattern image is required.";
          }
          return null;
        },
      },
    };

    const validationErrors = validateForm(formData, validationSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      
      if (formData.pattern_images.length > 0) {
        formData.pattern_images.forEach((file, index) => {
          formDataToSend.append(`pattern_images[${index}]`, file);
        });
      }

      await patternTypeApi.update(id, formDataToSend);
      setSubmitSuccess(true);

      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        navigate("/admin/settings/pattern-type");
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to update pattern type.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    fetchPatternType();
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Pattern Type">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-600 text-sm font-medium">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      icon="fa-cog"
      pageTitle="Edit Pattern Type"
      path={`/admin/settings/pattern-type/edit/${id}`}
      links={[
        { label: "Home", href: "/" },
        { label: "Drop Down Settings", href: "#" },
        { label: "Pattern Type", href: "/admin/settings/pattern-type" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Pattern type updated successfully!"
            message="The pattern type has been successfully updated in the system."
          />
        )}

        {serverError && (
          <AlertMessage
            type="error"
            title={serverError}
            message="Please check the form and try again."
          />
        )}

        <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-2 mb-4">
          Pattern Type Details
        </h1>

        <Input
          label="Pattern Type Title"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter pattern type name"
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          error={errors.description}
          onChange={handleChange}
          rows={15}
          resizable
          required
          placeholder="Enter pattern type description"
        />

        {existingImages.length > 0 && (
          <div className="px-6 mb-4">
            <label className="text-primary text-sm font-semibold flex items-center mb-2">
              Existing Pattern Images
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {existingImages.map((image, index) => (
                <div key={index} className="relative border border-gray-300 rounded p-2">
                  <img
                    src={image.url || image}
                    alt={`Pattern ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <FileUpload
          label="Add New Pattern Images"
          name="pattern_images"
          value={formData.pattern_images}
          onChange={handleChange}
          acceptedTypes="image/*"
          multiple={true}
          error={errors.pattern_images}
          required={existingImages.length === 0}
        />
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

export default EditPatternType;
