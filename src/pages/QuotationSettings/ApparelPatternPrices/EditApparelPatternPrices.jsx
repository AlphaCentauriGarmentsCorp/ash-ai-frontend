import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../layouts/Admin/AdminLayout";
import Select from "../../../components/form/Select";
import FormActions from "../../../components/form/FormActions";
import Input from "../../../components/form/Input";
import AlertMessage from "../../../components/common/AlertMessage";
import { apparelTypeApi } from "../../../api/apparelTypeApi";
import { patternTypeApi } from "../../../api/patternTypeApi";
import { apparelPatternPricesApi } from "../../../api/apparelPatternPricesApi";
import { apparelPatternPricesInitialState } from "../../../constants/formInitialState/apparelPatternPricesInitialState";
import {
  apparelPatternPricesSchema,
  validateApparelPatternPricesUniqueness,
} from "../../../validations/apparelPatternPricesSchema";
import { validateForm, hasErrors } from "../../../utils/validation";

const EditApparelPatternPrices = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(apparelPatternPricesInitialState);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const [apparelTypes, setApparelTypes] = useState([]);
  const [patternTypes, setPatternTypes] = useState([]);
  const [existingRows, setExistingRows] = useState([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [apparelRes, patternRes, showRes, existingRes] = await Promise.all([
        apparelTypeApi.index(),
        patternTypeApi.index(),
        apparelPatternPricesApi.show(id),
        apparelPatternPricesApi.index(),
      ]);

      const apparelData = apparelRes.data || apparelRes || [];
      const patternData = patternRes.data || patternRes || [];
      const showData = showRes.data || showRes || {};
      const existingData = existingRes.data || existingRes || [];

      setApparelTypes(
        apparelData.map((item) => ({
          value: item.id,
          label: item.name,
          title: item.description,
        })),
      );

      setPatternTypes(
        patternData.map((item) => ({
          value: item.id,
          label: item.name,
          title: item.description,
        })),
      );

      setExistingRows(existingData);

      setFormData({
        apparel_type_id: showData.apparel_type_id || "",
        pattern_type_id: showData.pattern_type_id || "",
        price: showData.price ?? "",
      });
    } catch (error) {
      console.error(error);
      setServerError("Failed to load apparel pattern price data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

    const validationErrors = validateForm(formData, apparelPatternPricesSchema);
    const uniqueErrors = validateApparelPatternPricesUniqueness(
      formData,
      existingRows,
      id,
      apparelTypes,
      patternTypes,
    );
    const mergedErrors = { ...validationErrors, ...uniqueErrors };

    if (hasErrors(mergedErrors)) {
      setErrors(mergedErrors);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await apparelPatternPricesApi.update(id, {
        apparel_type_id: Number(formData.apparel_type_id),
        pattern_type_id: Number(formData.pattern_type_id),
        price: Number(formData.price),
      });

      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        navigate("/quotation/settings/apparel-pattern-prices");
      }, 1500);
    } catch (err) {
      const serverMessage = err.response?.data?.message || "";
      const isDuplicateConstraint =
        /duplicate entry|integrity constraint|app_pattern_name_unique/i.test(
          String(serverMessage),
        );

      if (isDuplicateConstraint) {
        setErrors({
          apparel_type_id:
            "This apparel and pattern combination already exists.",
          pattern_type_id:
            "This apparel and pattern combination already exists.",
        });
      } else 
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setServerError(
          err.response?.data?.message ||
            "Failed to update apparel pattern price.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    fetchData();
    setErrors({});
    setSubmitSuccess(false);
    setServerError("");
  };

  if (isLoading) {
    return (
      <AdminLayout pageTitle="Edit Apparel Pattern Prices">
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
      pageTitle="Edit Apparel Pattern Prices"
      path={`/quotation/settings/apparel-pattern-prices/edit/${id}`}
      links={[
        { label: "Home", href: "/" },
        { label: "Quotation Settings", href: "#" },
        {
          label: "Apparel Pattern Prices",
          href: "/quotation/settings/apparel-pattern-prices",
        },
      ]}
    >
      <div className="bg-light p-3 lg:p-7 rounded-lg border border-gray-300">
        {submitSuccess && (
          <AlertMessage
            type="success"
            title="Apparel pattern price updated successfully!"
            message="The apparel pattern price has been updated in the system."
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
          Apparel Pattern Price Details
        </h1>

        <Select
          label="Apparel Type"
          name="apparel_type_id"
          options={apparelTypes}
          onChange={handleChange}
          value={formData.apparel_type_id}
          searchable
          error={errors.apparel_type_id}
          icon={<i className="fas fa-shirt text-gray"></i>}
          disabled={isSubmitting}
        />

        <Select
          label="Pattern Type"
          name="pattern_type_id"
          options={patternTypes}
          onChange={handleChange}
          value={formData.pattern_type_id}
          searchable
          error={errors.pattern_type_id}
          icon={<i className="fas fa-ruler-combined text-gray"></i>}
          disabled={isSubmitting}
        />

        <Input
          label="Price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          error={errors.price}
          type="number"
          placeholder="Enter price"
          min="0"
          max="999999.99"
          step="0.01"
          required
        />
      </div>

      <FormActions
        onSubmit={handleSubmit}
        onReset={handleReset}
        onCancel={() => navigate(-1)}
        showCancel
        cancelText="Back"
        isSubmitting={isSubmitting}
        submitText="Update"
        resetText="Reset"
        submittingText="Updating..."
      />
    </AdminLayout>
  );
};

export default EditApparelPatternPrices;
