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

  const steps = [
    {
      title: "Front & Back",
      description: "Choose design locations",
      component: Step1FrontBack,
    },
    {
      title: "Designs",
      description: "Upload or select designs",
      component: Step2Designs,
    },
    {
      title: "Colors",
      description: "Select colors",
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
        if (!formData.hasFrontDesign && !formData.hasBackDesign) {
          newErrors.general = "Please select at least one design location";
        }
        break;

      case 2:
        if (!formData.designType) {
          newErrors.designType = "Please select a design method";
        }
        if (
          formData.designType === "upload" &&
          (!formData.uploadedDesigns || formData.uploadedDesigns.length === 0)
        ) {
          newErrors.uploadedDesigns = "Please upload at least one design file";
        }
        if (
          formData.designType === "template" &&
          !formData.selectedTemplate
        ) {
          newErrors.selectedTemplate = "Please select a template";
        }
        break;

      case 3:
        if (!formData.tshirtColor) {
          newErrors.tshirtColor = "Please select a t-shirt color";
        }
        if (!formData.colorCount) {
          newErrors.colorCount = "Please select the number of print colors";
        }
        break;

      case 4:
        if (!formData.clientName || formData.clientName.trim() === "") {
          newErrors.clientName = "Name is required";
        }
        if (!formData.clientEmail || formData.clientEmail.trim() === "") {
          newErrors.clientEmail = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.clientEmail)) {
          newErrors.clientEmail = "Please enter a valid email";
        }
        if (!formData.clientPhone || formData.clientPhone.trim() === "") {
          newErrors.clientPhone = "Phone number is required";
        }
        if (!formData.urgency) {
          newErrors.urgency = "Please select urgency level";
        }
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

      console.log("Quotation submitted:", formData);

      // Show success message
      alert(
        "Thank you! Your quotation request has been submitted successfully. We'll contact you within 24 hours."
      );

      // Reset form
      setFormData(quotationClientInitialState);
      setCurrentStep(1);
    } catch (error) {
      console.error("Error submitting quotation:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Request a Quotation
              </h1>
              <p className="text-gray-600 mt-1">
                Get a custom quote for your t-shirt printing needs
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg">
                <p className="text-xs font-medium">Need Help?</p>
                <p className="text-sm font-semibold">
                  <i className="fas fa-phone mr-1"></i>
                  1-800-TSHIRT
                </p>
              </div>
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
                      Submit Quotation
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="fas fa-question-circle text-blue-600 text-xl mt-1"></i>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Questions about the quotation process?
              </p>
              <p className="text-xs text-blue-700">
                Our team is here to help! Contact us at{" "}
                <a
                  href="mailto:quotes@example.com"
                  className="underline font-medium"
                >
                  quotes@example.com
                </a>{" "}
                or call{" "}
                <a href="tel:1-800-874478" className="underline font-medium">
                  1-800-TSHIRT
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-600">
            © 2024 T-Shirt Printing Co. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuotationClient;
