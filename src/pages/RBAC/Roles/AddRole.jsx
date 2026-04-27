import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Input from "../../../components/form/Input";
import Textarea from "../../../components/form/Textarea";
import FormActions from "../../../components/form/FormActions";
import AlertMessage from "../../../components/common/AlertMessage";
import { roleApi } from "../../../api/roleApi";
import { permissionApi } from "../../../api/permissionApi";

const initialState = {
  name: "",
  guard_name: "web",
  description: "",
};

const AddRole = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setIsLoadingPermissions(true);
    try {
      const response = await permissionApi.index({ per_page: "all" });
      const rows = response?.data || response || [];
      setPermissions(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error("Failed to load permissions:", error);
      setPermissions([]);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  const filteredPermissions = useMemo(() => {
    const query = permissionSearch.trim().toLowerCase();
    if (!query) return permissions;

    return permissions.filter((permission) => {
      const name = String(permission?.name || "").toLowerCase();
      const description = String(permission?.description || "").toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }, [permissions, permissionSearch]);

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Role name is required.";
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

  const handleTogglePermission = (permissionId) => {
    const parsedId = Number(permissionId);

    setSelectedPermissionIds((prev) =>
      prev.includes(parsedId)
        ? prev.filter((id) => id !== parsedId)
        : [...prev, parsedId],
    );
  };

  const handleSelectAllPermissions = () => {
    setSelectedPermissionIds(
      filteredPermissions
        .map((permission) => Number(permission.id))
        .filter((id) => Number.isFinite(id)),
    );
  };

  const handleClearPermissions = () => {
    setSelectedPermissionIds([]);
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
      await roleApi.create({
        name: formData.name.trim(),
        guard_name: formData.guard_name.trim(),
        description: formData.description.trim(),
        permission_ids: selectedPermissionIds,
      });

      setSubmitSuccess(true);
      setFormData(initialState);
      setSelectedPermissionIds([]);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        navigate("/admin/rbac/roles");
      }, 1200);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(err.response?.data?.message || "Failed to create role.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialState);
    setSelectedPermissionIds([]);
    setPermissionSearch("");
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  return (
    <AdminLayout
      icon="fa-user-shield"
      pageTitle="Add Role"
      path="/admin/rbac/roles/new"
      links={[
        { label: "Home", href: "/" },
        { label: "Roles & Permissions", href: "#" },
        { label: "Roles", href: "/admin/rbac/roles" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Role created successfully!"
            message="The role has been added to the system."
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
          Role Details
        </h1>

        <Input
          label="Role Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          type="text"
          placeholder="Enter role name"
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
          placeholder="Enter role description"
        />

        <div className="mt-5 border border-gray-300 rounded-lg p-4 bg-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div>
              <h2 className="text-primary text-sm font-semibold">Permissions</h2>
              <p className="text-xs text-gray-500 mt-1">
                Assign one or more permissions to this role.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllPermissions}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Select Visible
              </button>
              <button
                type="button"
                onClick={handleClearPermissions}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>

          <input
            type="text"
            value={permissionSearch}
            onChange={(e) => setPermissionSearch(e.target.value)}
            placeholder="Search permissions..."
            className="text-sm border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary"
          />

          {isLoadingPermissions ? (
            <p className="text-sm text-gray-500 mt-3">Loading permissions...</p>
          ) : (
            <div className="mt-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {filteredPermissions.length === 0 && (
                <p className="text-sm text-gray-500">No permissions found.</p>
              )}

              {filteredPermissions.map((permission) => {
                const permissionId = Number(permission.id);

                return (
                  <label
                    key={permission.id}
                    className="flex items-start gap-2 py-1.5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={selectedPermissionIds.includes(permissionId)}
                      onChange={() => handleTogglePermission(permissionId)}
                    />
                    <span>
                      <span className="text-sm font-medium text-gray-800">
                        {permission.name}
                      </span>
                      {permission.description && (
                        <span className="text-xs text-gray-500 block">
                          {permission.description}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
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

export default AddRole;
