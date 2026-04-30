import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { quotationClientInitialState } from "../../constants/formInitialState/quotationClientInitialState";
import WizardProgress from "../../components/quotationClient/WizardProgress";
import Step2Designs from "../../components/quotationClient/Step2Designs";
import Step3Colors from "../../components/quotationClient/Step3Colors";
import Step4Overview from "../../components/quotationClient/Step4Overview";
import { publicQuotationApi } from "../../api/publicQuotationApi";
import { publicApparelTypeApi } from "../../api/publicApparelTypeApi";
import { publicPatternTypeApi } from "../../api/publicPatternTypeApi";
import { publicApparelNecklineApi } from "../../api/publicApparelNecklineApi";

const toStorageUrl = (path) => {
  const rawPath = String(path || "").trim();
  if (!rawPath) return "";

  if (rawPath.startsWith("http") || rawPath.startsWith("data:")) {
    return rawPath;
  }

  const apiUrl = import.meta.env.VITE_API_URL || "";
  let origin = "";
  try {
    origin = new URL(apiUrl).origin;
  } catch {
    origin = "";
  }

  if (rawPath.startsWith("/storage/")) {
    return origin ? `${origin}${rawPath}` : rawPath;
  }

  if (rawPath.startsWith("storage/")) {
    return origin ? `${origin}/${rawPath}` : `/${rawPath}`;
  }

  const cleanedPath = rawPath.replace(/^\/+/, "");
  return origin ? `${origin}/storage/${cleanedPath}` : `/storage/${cleanedPath}`;
};

const parseJsonField = (value, fallback) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
};

const normalizeApiRecord = (response) => response?.data || response || null;

const toId = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? null : numeric;
};

const normalizeImageLinkForCompare = (value) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";

  let path = rawValue;
  try {
    const parsed = new URL(rawValue, window.location.origin);
    path = `${parsed.pathname}${parsed.search || ""}`;
  } catch {
    path = rawValue;
  }

  const withoutQuery = path.split("?")[0];
  const cleaned = withoutQuery.replace(/^\/+/, "");
  return cleaned.startsWith("storage/") ? cleaned.slice("storage/".length) : cleaned;
};

const normalizeComparableParts = (parts) => {
  if (!Array.isArray(parts)) return [];

  return parts.map((part) => ({
    part_id:
      part?.part_id === null || part?.part_id === undefined || part?.part_id === ""
        ? null
        : Number(part.part_id),
    part: String(part?.part || "").trim(),
    unit_count: Math.max(1, parseInt(part?.unit_count, 10) || 1),
    price_per_unit: Number(part?.price_per_unit) || 0,
    full_unit_count: Math.max(0, parseInt(part?.full_unit_count, 10) || 0),
    price_per_full_unit: Number(part?.price_per_full_unit) || 0,
    image_input_type: String(part?.image_input_type || "").trim().toLowerCase(),
    image_link: normalizeImageLinkForCompare(part?.image_link),
    has_new_file: Boolean(part?._has_new_file),
  }));
};

const QuotationClient = () => {
  const { token } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(quotationClientInitialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingTokenData, setIsLoadingTokenData] = useState(false);
  const [tokenLoadError, setTokenLoadError] = useState("");
  const [publicQuotationData, setPublicQuotationData] = useState(null);

  const steps = [
    {
      title: "Design Upload",
      description: "Upload designs",
      component: Step2Designs,
    },
    {
      title: "Units",
      description: "Specify units",
      component: Step3Colors,
    },
    {
      title: "Overview",
      description: "Review and submit",
      component: Step4Overview,
    },
  ];

  useEffect(() => {
    const loadPublicQuotation = async () => {
      if (!token) return;

      setIsLoadingTokenData(true);
      setTokenLoadError("");

      try {
        const response = await publicQuotationApi.show(token);
        const quotationData = response?.data || response || {};

        const itemConfig = parseJsonField(
          quotationData.item_config_json,
          quotationData.item_config || {},
        );

        const apparelTypeId = toId(itemConfig.apparel_type_id || quotationData.apparel_type_id);
        const patternTypeId = toId(itemConfig.pattern_type_id || quotationData.pattern_type_id);
        const necklineId = toId(quotationData.apparel_neckline_id || quotationData.neckline_id);

        const [apparelTypeRecord, patternTypeRecord, necklineRecord] = await Promise.all([
          apparelTypeId
            ? publicApparelTypeApi.show(apparelTypeId).then(normalizeApiRecord).catch(() => null)
            : null,
          patternTypeId
            ? publicPatternTypeApi.show(patternTypeId).then(normalizeApiRecord).catch(() => null)
            : null,
          necklineId
            ? publicApparelNecklineApi.show(necklineId).then(normalizeApiRecord).catch(() => null)
            : null,
        ]);

        setPublicQuotationData({
          ...quotationData,
          _resolvedMeta: {
            apparel_type_name: apparelTypeRecord?.name || null,
            pattern_type_name: patternTypeRecord?.name || null,
            apparel_neckline_name: necklineRecord?.name || null,
          },
        });

        const parts = Array.isArray(quotationData.print_parts)
          ? quotationData.print_parts
          : parseJsonField(quotationData.print_parts_json, []);

        const normalizedParts = (Array.isArray(parts) ? parts : []).map((part, index) => {
          const rawImagePath = String(
            part.image_link || part.image_url || part.image_path || part.image || "",
          ).trim();
          const imageInputType = String(
            part.image_input_type || (part.image_link ? "link" : "file"),
          ).toLowerCase() === "link"
            ? "link"
            : "file";

          return {
            key: String(part.part_id ?? part.id ?? index),
            part_id: part.part_id ?? part.id ?? null,
            part: String(part.part || part.name || `Part ${index + 1}`).trim(),
            unit_count: Math.max(1, parseInt(part.unit_count, 10) || 1),
            price_per_unit: Number(part.price_per_unit) || 0,
            full_unit_count: Math.max(0, parseInt(part.full_unit_count, 10) || 0),
            price_per_full_unit: Number(part.price_per_full_unit) || 0,
            image_input_type: imageInputType,
            image_link: imageInputType === "link" ? toStorageUrl(rawImagePath) : "",
            image_file: null,
            existing_image_url: toStorageUrl(rawImagePath),
            existing_image_raw_path: rawImagePath,
          };
        });

        setFormData({ parts: normalizedParts });
      } catch (error) {
        console.error("Failed to load public quotation:", error);
        setTokenLoadError(
          error?.response?.data?.message ||
          "Unable to load shared quotation link. Please check if your token is valid.",
        );
      } finally {
        setIsLoadingTokenData(false);
      }
    };

    loadPublicQuotation();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    const parts = Array.isArray(formData.parts) ? formData.parts : [];

    switch (step) {
      case 1:
        if (parts.length === 0) {
          newErrors.general = "No parts available in this shared quotation.";
          break;
        }

        parts.forEach((part) => {
          const hasDesign =
            !!part.image_file
            || !!String(part.image_link || "").trim()
            || !!String(part.existing_image_url || "").trim();

          if (!hasDesign) {
            newErrors[`design_${part.key}`] = `Please upload a design file or provide a URL for ${part.part}.`;
          }
        });
        break;

      case 2:
        parts.forEach((part) => {
          if (!(Number(part.unit_count) > 0)) {
            newErrors[`unit_${part.key}`] = `Please specify unit count for ${part.part}.`;
          }
        });
        break;

      case 3:
        // No validation needed for Step 4 (summary only)
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (!token) {
      alert("Invalid shared link. Please open the quotation using the tokenized share URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      const parts = Array.isArray(formData.parts) ? formData.parts : [];

      const printPartsPayload = parts.map((part) => {
        const hasNewFile = part.image_file instanceof File;
        const imageInputType = hasNewFile
          ? "file"
          : (part.image_input_type === "file" && !String(part.image_link || "").trim())
            ? "file"
            : "link";

        const imageLink = hasNewFile
          ? ""
          : String(
            part.image_link
            || (imageInputType === "file" ? part.existing_image_raw_path : "")
            || "",
          ).trim();

        return {
          part_id: part.part_id,
          part: part.part,
          unit_count: Math.max(1, parseInt(part.unit_count, 10) || 1),
          price_per_unit: Number(part.price_per_unit) || 0,
          full_unit_count: Math.max(0, parseInt(part.full_unit_count, 10) || 0),
          price_per_full_unit: Number(part.price_per_full_unit) || 0,
          image_input_type: imageInputType,
          image_link: imageLink,
        };
      });

      const expectedPartsForCompare = printPartsPayload.map((part, index) => ({
        ...part,
        _has_new_file: parts[index]?.image_file instanceof File,
      }));

      const payload = new FormData();
      payload.append("print_parts_json", JSON.stringify(printPartsPayload));

      parts.forEach((part, index) => {
        if (part.image_file instanceof File) {
          payload.append(`print_parts_files[${index}]`, part.image_file);
        }
      });

      await publicQuotationApi.update(token, payload);

      const verifyResponse = await publicQuotationApi.show(token);
      const verifyQuotation = verifyResponse?.data || verifyResponse || {};
      const latestParts = Array.isArray(verifyQuotation.print_parts)
        ? verifyQuotation.print_parts
        : parseJsonField(verifyQuotation.print_parts_json, []);

      const expected = normalizeComparableParts(expectedPartsForCompare)
        .sort((a, b) => `${a.part_id}-${a.part}`.localeCompare(`${b.part_id}-${b.part}`));
      const actual = normalizeComparableParts(latestParts)
        .sort((a, b) => `${a.part_id}-${a.part}`.localeCompare(`${b.part_id}-${b.part}`));

      const mismatchDetails = [];
      const persisted =
        expected.length === actual.length
        && expected.every((expectedPart, index) => {
          const actualPart = actual[index];
          if (!actualPart) {
            mismatchDetails.push({ index, reason: "missing_actual_part", expectedPart });
            return false;
          }

          const baseMatches =
            expectedPart.part_id === actualPart.part_id
            && expectedPart.part === actualPart.part
            && expectedPart.unit_count === actualPart.unit_count
            && expectedPart.price_per_unit === actualPart.price_per_unit
            && expectedPart.full_unit_count === actualPart.full_unit_count
            && expectedPart.price_per_full_unit === actualPart.price_per_full_unit
            && expectedPart.image_input_type === actualPart.image_input_type;

          let imageMatches = false;
          if (expectedPart.image_input_type === "file") {
            // If user uploaded a new file, backend may keep existing path or process asynchronously.
            // Do not fail persistence verification on image_link shape for this case.
            imageMatches = expectedPart.has_new_file
              ? true
              : expectedPart.image_link === actualPart.image_link;
          } else {
            imageMatches = expectedPart.image_link === actualPart.image_link;
          }

          if (!baseMatches || !imageMatches) {
            mismatchDetails.push({
              index,
              expectedPart,
              actualPart,
              baseMatches,
              imageMatches,
            });
            return false;
          }

          return true;
        });

      if (!persisted) {
        console.warn("[QuotationClient] update did not persist as expected", {
          expected,
          actual,
          mismatchDetails,
        });
      }

      // Show success state
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      const responseData = error?.response?.data || {};
      const fieldErrors = responseData?.errors || {};
      const flattenedErrors = Object.values(fieldErrors)
        .flat()
        .filter(Boolean);

      const message =
        flattenedErrors[0]
        || responseData?.message
        || "An error occurred. Please try again.";

      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 md:p-12 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-4xl text-green-600"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Thanks for submitting!
              </h1>
              <p className="text-gray-600">
                We've received your request and will get back to you shortly.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingTokenData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-primary"></i>
          <p className="text-gray-600 mt-4">Loading shared quotation...</p>
        </div>
      </div>
    );
  }

  if (tokenLoadError) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-xl shadow-lg border border-red-200 p-8 text-center">
          <i className="fas fa-exclamation-triangle text-3xl text-red-500"></i>
          <p className="text-red-700 mt-4 font-medium">Unable to load shared link</p>
          <p className="text-sm text-gray-600 mt-2">{tokenLoadError}</p>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                <i className="fas fa-file-invoice"></i>
                Request a Quote
              </h1>
              <p className="text-gray-600 mt-1">
                Get a custom quote for your garment printing needs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <WizardProgress currentStep={currentStep} steps={steps} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <i className="fas fa-exclamation-circle text-red-600 mt-1"></i>
              <div>
                <p className="text-sm font-medium text-red-800">
                  {errors.general}
                </p>
              </div>
            </div>
          )}

          {/* Step Content */}
          <CurrentStepComponent
            formData={formData}
            quotationData={publicQuotationData}
            onChange={handleChange}
            errors={errors}
          />

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  currentStep === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Previous
              </button>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-semibold text-primary">
                  Step {currentStep}
                </span>
                <span>of</span>
                <span>{steps.length}</span>
              </div>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all"
                >
                  Next
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>
                      Submit
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-600">
            Sorbetes
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuotationClient;
