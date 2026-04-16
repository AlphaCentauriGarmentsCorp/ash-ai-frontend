import React, { useState } from "react";
import { quotationClientInitialState } from "../../constants/formInitialState/quotationClientInitialState";
import WizardProgress from "../../components/quotationClient/WizardProgress";
import Step1FrontBack from "../../components/quotationClient/Step1FrontBack";
import Step2Designs from "../../components/quotationClient/Step2Designs";
import Step3Colors from "../../components/quotationClient/Step3Colors";
import Step4Overview from "../../components/quotationClient/Step4Overview";

const QuotationClient = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(quotationClientInitialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const steps = [
    {
      title: "Parts",
      description: "Select garment parts",
      component: Step1FrontBack,
    },
    {
      title: "Design Upload",
      description: "Upload designs",
      component: Step2Designs,
    },
    {
      title: "Colors",
      description: "Specify colors",
      component: Step3Colors,
    },
    {
      title: "Overview",
      description: "Review and submit",
      component: Step4Overview,
    },
  ];

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

    switch (step) {
      case 1:
        if (!formData.hasFrontPart && !formData.hasBackPart) {
          newErrors.general = "Please select at least one part";
        }
        break;

      case 2:
        if (formData.hasFrontPart) {
          if (!formData.frontDesignFile && !formData.frontDesignUrl) {
            newErrors.frontDesign = "Please upload a front design file or provide a URL";
          }
        }
        if (formData.hasBackPart) {
          if (!formData.backDesignFile && !formData.backDesignUrl) {
            newErrors.backDesign = "Please upload a back design file or provide a URL";
          }
        }
        break;

      case 3:
        if (formData.hasFrontPart && !formData.frontColorCount) {
          newErrors.frontColorCount = "Please specify the number of colors";
        }
        if (formData.hasBackPart && !formData.backColorCount) {
          newErrors.backColorCount = "Please specify the number of colors";
        }
        break;

      case 4:
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

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Form submitted:", formData);

      // Show success state
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewRequest = () => {
    setFormData(quotationClientInitialState);
    setCurrentStep(1);
    setIsSubmitted(false);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Success Screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
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

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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

          {(errors.frontDesign || errors.backDesign) && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <i className="fas fa-exclamation-circle text-red-600 mt-1"></i>
              <div>
                {errors.frontDesign && (
                  <p className="text-sm font-medium text-red-800">
                    {errors.frontDesign}
                  </p>
                )}
                {errors.backDesign && (
                  <p className="text-sm font-medium text-red-800">
                    {errors.backDesign}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step Content */}
          <CurrentStepComponent
            formData={formData}
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
