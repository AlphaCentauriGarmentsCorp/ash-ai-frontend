import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Select from "../../../components/form/Select";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import { printColorsSchema } from "../../../validations/printColorsSchema";
import { validateForm, hasErrors } from "../../../utils/validation";
import { printColorsApi } from "../../../api/printColorsApi";
import { printTypesApi } from "../../../api/printTypesApi";
import AlertMessage from "../../../components/common/AlertMessage";

const EditPrintColors = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    type_id: "",
    color_count: "",
    price: "",
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [printType, setPrintType] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [typesRes, dataRes] = await Promise.all([
          printTypesApi.index(),
          printColorsApi.show(id),
        ]);

        const formattedTypes = (typesRes.data || []).map((item) => ({
          value: item.id,
          label: item.name,
        }));

        setPrintType(formattedTypes);

        const data = dataRes.data;
        setFormData({
          type_id: data.type_id,
          color_count: data.color_count,
          price: data.price,
        });
      } catch (err) {
        console.error(err);
        setServerError("Failed to load data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [id]);

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

    const validationErrors = validateForm(formData, printColorsSchema);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await printColorsApi.update(id, formData);
      setSubmitSuccess(true);

      setTimeout(() => {
        navigate(`/quotation/settings/print-colors`);
      }, 1500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message || "Failed to update print colors.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Size Prices">
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
      pageTitle="Edit Print Colors"
      path="/quotation/settings/print-colors/edit"
      links={[
        { label: "Home", href: "/" },
        { label: "Quotation Settings", href: "#" },
        { label: "Print Colors", href: "/quotation/settings/print-colors" },
        { label: "Edit", href: "#" },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Updated successfully!"
            message="Print color updated."
          />
        )}

        {serverError && <AlertMessage type="error" title={serverError} />}

        <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-2 mb-4">
          Edit Print Colors
        </h1>

        {}
        <Select
          label="Print Type"
          name="type_id"
          options={printType}
          value={formData.type_id}
          onChange={handleChange}
          error={errors.type_id}
          searchable
          disabled={isSubmitting}
          required
        />

        <Input
          label="Color Count"
          name="color_count"
          value={formData.color_count}
          onChange={handleChange}
          error={errors.color_count}
          type="number"
          required
        />

        <Input
          label="Price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
          type="number"
          required
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

export default EditPrintColors;
