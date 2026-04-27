import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Input from "../../../components/form/Input";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import AlertMessage from "../../../components/common/AlertMessage";
import { permissionApi } from "../../../api/permissionApi";

const initialState = {
  name: "",
  guard_name: "web",
  description: "",
};

const mapPermissionData = (responseData) => {
  const row = responseData?.data || responseData || {};

  return {
    name: row.name || "",
    guard_name: row.guard_name || "web",
    description: row.description || "",
  };
};

const EditPermission = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchPermission();
  }, []);

  const fetchPermission = async () => {
    setIsLoading(true);
    try {
      const response = await permissionApi.show(id);
      setFormData(mapPermissionData(response));
    } catch (error) {
      setServerError("Failed to load permission.");
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Permission name is required.";
    }

    if (!formData.guard_name.trim()) {
      nextErrors.guard_name = "Guard name is required.";
    }

    return nextErrors;
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

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await permissionApi.update(id, {
        name: formData.name.trim(),
        guard_name: formData.guard_name.trim(),
        description: formData.description.trim(),
      });

      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        navigate("/admin/rbac/permissions");
      }, 1200);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to update permission.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    fetchPermission();
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Permission">
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
      icon="fa-lock"
      pageTitle="Edit Permission"
      path={`/admin/rbac/permissions/edit/${id}`}
      links={[
        { label: "Home", href: "/" },
        { label: "Roles & Permissions", href: "#" },
        { label: "Permissions", href: "/admin/rbac/permissions" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Permission updated successfully!"
            message="The permission has been updated in the system."
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
          Permission Details
        </h1>

        <Input
          label="Permission Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter permission name"
          required
        />

        <Input
          label="Guard Name"
          name="guard_name"
          value={formData.guard_name}
          onChange={handleChange}
          error={errors.guard_name}
          type="text"
          placeholder="web"
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          rows={8}
          resizable
          placeholder="Enter permission description"
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

export default EditPermission;
