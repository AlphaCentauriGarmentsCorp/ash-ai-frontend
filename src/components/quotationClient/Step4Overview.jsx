import React from "react";
import Input from "../form/Input";
import Select from "../form/Select";

const Step4Overview = ({ formData, onChange, errors }) => {
  const urgencyOptions = [
    { value: "normal", label: "Normal (2-3 weeks)" },
    { value: "urgent", label: "Urgent (1 week)" },
    { value: "rush", label: "Rush (3-5 days)" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Review & Submit
        </h2>
        <p className="text-gray-600">
          Review your quotation details and provide contact information
        </p>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-clipboard-list text-primary"></i>
          Quotation Summary
        </h3>

        <div className="space-y-4">
          {/* Design Locations */}
          <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
            <i className="fas fa-tshirt text-primary mt-1"></i>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Design Locations</p>
              <p className="text-sm text-gray-600 mt-1">
                {formData.hasFrontDesign && formData.hasBackDesign
                  ? "Front & Back"
                  : formData.hasFrontDesign
                    ? "Front Only"
                    : formData.hasBackDesign
                      ? "Back Only"
                      : "None Selected"}
              </p>
            </div>
          </div>

          {/* Design Type */}
          {formData.designType && (
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
              <i className="fas fa-paint-brush text-primary mt-1"></i>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Design Method</p>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.designType === "upload"
                    ? "Upload Own Design"
                    : formData.designType === "template"
                      ? "Template Selection"
                      : "Custom Design Creation"}
                </p>
                {formData.uploadedDesigns && formData.uploadedDesigns.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.uploadedDesigns.length} file(s) uploaded
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Colors */}
          <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
            <i className="fas fa-palette text-primary mt-1"></i>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Colors</p>
              <p className="text-sm text-gray-600 mt-1">
                T-Shirt: {formData.tshirtColor || "Not selected"}
              </p>
              {formData.printColors && formData.printColors.length > 0 && (
                <p className="text-sm text-gray-600">
                  Print: {formData.printColors.join(", ")}
                </p>
              )}
              {formData.colorCount && (
                <p className="text-xs text-gray-500 mt-1">
                  {formData.colorCount} color(s) in design
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-user text-primary"></i>
          Your Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="clientName"
            placeholder="Enter your name"
            value={formData.clientName}
            onChange={onChange}
            required
            error={errors.clientName}
            icon={<i className="fas fa-user text-sm"></i>}
          />

          <Input
            label="Email Address"
            name="clientEmail"
            type="email"
            placeholder="your@email.com"
            value={formData.clientEmail}
            onChange={onChange}
            required
            error={errors.clientEmail}
            icon={<i className="fas fa-envelope text-sm"></i>}
          />

          <Input
            label="Phone Number"
            name="clientPhone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.clientPhone}
            onChange={onChange}
            required
            error={errors.clientPhone}
            icon={<i className="fas fa-phone text-sm"></i>}
          />

          <Input
            label="Company Name"
            name="clientCompany"
            placeholder="Your company (optional)"
            value={formData.clientCompany}
            onChange={onChange}
            icon={<i className="fas fa-building text-sm"></i>}
          />
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-cog text-primary"></i>
          Additional Details
        </h3>

        <div className="space-y-4">
          <Select
            label="Urgency Level"
            name="urgency"
            options={urgencyOptions}
            value={formData.urgency}
            onChange={onChange}
            placeholder="Select urgency"
            required
            error={errors.urgency}
          />

          <Input
            label="Preferred Delivery Date"
            name="preferredDeliveryDate"
            type="date"
            value={formData.preferredDeliveryDate}
            onChange={onChange}
            error={errors.preferredDeliveryDate}
          />

          <div>
            <label className="text-primary text-sm font-semibold flex items-center mb-2">
              Additional Notes
            </label>
            <textarea
              name="additionalNotes"
              placeholder="Any other requirements, questions, or special requests..."
              value={formData.additionalNotes}
              onChange={onChange}
              rows="4"
              className="text-sm mt-1 border rounded-lg py-2 px-4 w-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary bg-white text-gray-800 border-gray-300 hover:border-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <i className="fas fa-check-circle text-green-600 text-xl mt-1"></i>
          <div>
            <p className="text-sm font-semibold text-green-900 mb-1">
              Ready to Submit
            </p>
            <p className="text-xs text-green-700">
              Once you submit, our team will review your quotation request and
              get back to you within 24 hours with pricing and timeline details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Overview;
