import React from "react";
import FormActions from "../../../../components/form/FormActions";

import { OrderInformationSection } from "./sections/OrderInformationSection";
import { CourierSection } from "./sections/CourierSection";
import { ProductDetailsSection } from "./sections/ProductDetailsSection";
import { FabricDetailsSection } from "./sections/FabricDetailsSection";
import { OptionsSection } from "./sections/OptionsSection";
import { SizesSection } from "./sections/SizesSection";
import { SummarySection } from "./sections/SummarySection";
import { DesignFilesSection } from "./sections/DesignFilesSection";
import { FreebiesSection } from "./sections/FreebiesSection";
import { PaymentSection } from "./sections/PaymentSection";

export const OrderForm = ({
  formData,
  errors,
  serverError,
  handleChange,
  handleDepositPercentageChange,
  handleFileChange,
  handleSizeChange,
  handleAddSize,
  handleRemoveSize,
  handleAddOption,
  handleRemoveOption,
  handleSubmit,
  handleReset,
  isSubmitting,
  submitSuccess,
  summary,
  clients,
  clientsLoading,
  clientBrands,
  optionsLoading,
  apparelTypeOptions,
  patternTypeOptions,
  serviceTypeOptions,
  printMethodOptions,
  sizeLabelOptions,
  printLabelPlacementOptions,
  fabricTypeOptions,
  fabricSupplierOptions,
  selectedOptions,
}) => {
  const renderSuccessMessage = () => {
    if (!submitSuccess) return null;

    return (
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
        <div className="flex items-center">
          <i className="fa-solid fa-check-circle text-green-500 mr-3"></i>
          <div>
            <p className="text-green-800 font-medium">
              Order submitted successfully!
            </p>
            <p className="text-green-600 text-sm mt-1">
              {selectedOptions.length} option(s) and{" "}
              {formData.sizes.filter((s) => s.quantity > 0).length} size(s) have
              been saved.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderServerError = () => {
    if (!serverError) return null;

    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center">
          <i className="fa-solid fa-exclamation-circle text-red-500 mr-3"></i>
          <div>
            <p className="text-red-800 font-medium">{serverError}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-light text-red p-3 lg:p-7 rounded-lg border border-gray-300">
        {renderSuccessMessage()}
        {renderServerError()}

        <OrderInformationSection
          formData={formData}
          handleChange={handleChange}
          errors={errors}
          clients={clients}
          clientsLoading={clientsLoading}
          clientBrands={clientBrands}
        />

        <CourierSection
          formData={formData}
          handleChange={handleChange}
          errors={errors}
        />

        <ProductDetailsSection
          formData={formData}
          handleChange={handleChange}
          errors={errors}
          apparelTypeOptions={apparelTypeOptions}
          patternTypeOptions={patternTypeOptions}
          serviceTypeOptions={serviceTypeOptions}
          printMethodOptions={printMethodOptions}
          sizeLabelOptions={sizeLabelOptions}
          printLabelPlacementOptions={printLabelPlacementOptions}
          optionsLoading={optionsLoading}
        />

        <FabricDetailsSection
          formData={formData}
          handleChange={handleChange}
          errors={errors}
          fabricTypeOptions={fabricTypeOptions}
          fabricSupplierOptions={fabricSupplierOptions}
          optionsLoading={optionsLoading}
        />

        <OptionsSection
          formData={formData}
          handleChange={handleChange}
          errors={errors}
          selectedOptions={selectedOptions}
          onAddOption={handleAddOption}
          onRemoveOption={handleRemoveOption}
        />

        <SizesSection
          sizes={formData.sizes}
          onSizeChange={handleSizeChange}
          onAddSize={handleAddSize}
          onRemoveSize={handleRemoveSize}
          errors={errors}
        />

        <SummarySection summary={summary} />

        <DesignFilesSection
          formData={formData}
          handleChange={handleChange}
          handleFileChange={handleFileChange}
          errors={errors}
        />

        <FreebiesSection
          formData={formData}
          handleChange={handleChange}
          handleFileChange={handleFileChange}
          errors={errors}
        />

        <PaymentSection
          formData={formData}
          handleChange={handleChange}
          handleDepositPercentageChange={handleDepositPercentageChange}
          handleFileChange={handleFileChange}
          errors={errors}
          summary={summary}
        />
      </div>

      <FormActions
        onSubmit={handleSubmit}
        onReset={handleReset}
        isSubmitting={isSubmitting}
        submitText="Save"
        resetText="Reset"
        submittingText="Creating Order..."
      />
    </form>
  );
};
