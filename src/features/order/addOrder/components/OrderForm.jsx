import React from "react";
import FormActions from "../../../../components/form/FormActions";

import { OrderInformationSection } from "./sections/OrderInformationSection";
import { CourierSection } from "./sections/CourierSection";
import { ProductDetailsSection } from "./sections/ProductDetailsSection";
import { PrintInformationSection } from "./sections/PrintInformationSection";
import { FabricDetailsSection } from "./sections/FabricDetailsSection";
import { OptionsSection } from "./sections/OptionsSection";
import { SizesSection } from "./sections/SizesSection";
import { SummarySection } from "./sections/SummarySection";
import { DesignFilesSection } from "./sections/DesignFilesSection";
import { FreebiesSection } from "./sections/FreebiesSection";
import { PaymentSection } from "./sections/PaymentSection";
import { SampleSizesSection } from "./sections/SampleSizesSection";

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
  specialPrintOptions,
  onPrintConfigChange,
  onPrintPartsChange,
  engineTotals,
  fabricTypeOptions,
  fabricSupplierOptions,
  selectedOptions,
  // Sample props
  samples = [],
  onSampleChange,
  onAddSample,
  onRemoveSample,
  sampleErrors,
  // Print parts from quotation for DesignFilesSection
  printParts = [],
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
              {selectedOptions.length} option(s),{" "}
              {formData.sizes.filter((s) => s.quantity > 0).length} size(s), and{" "}
              {samples.length} sample(s) have been saved.
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

        <PrintInformationSection
          formData={formData}
          handleChange={handleChange}
          onPrintConfigChange={onPrintConfigChange}
          onPrintPartsChange={onPrintPartsChange}
          errors={errors}
          specialPrintOptions={specialPrintOptions}
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

        {/* Add Sample Sizes Section here */}
        <SampleSizesSection
          samples={samples}
          onSampleChange={onSampleChange}
          onAddSample={onAddSample}
          onRemoveSample={onRemoveSample}
          errors={{ ...errors, samples: sampleErrors }}
          sizeLabelOptions={sizeLabelOptions}
        />

        <DesignFilesSection
          formData={formData}
          handleChange={handleChange}
          handleFileChange={handleFileChange}
          errors={errors}
          printParts={printParts}
        />

        <FreebiesSection
          formData={formData}
          handleChange={handleChange}
          handleFileChange={handleFileChange}
          errors={errors}
        />

        <SummarySection summary={summary} />

        {engineTotals && (
          <div className="my-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-emerald-800">
                <i className="fa-solid fa-calculator mr-2"></i>
                Computed Price (Pricing Rules)
              </h3>
              <span className="text-xs text-emerald-700">
                Auto-calculated from the apparel, print method & colors
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-emerald-700">Subtotal</p>
                <p className="font-semibold text-emerald-900">
                  ₱{Number(engineTotals.subtotal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              {Number(engineTotals.discount_amount ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-emerald-700">Discount</p>
                  <p className="font-semibold text-emerald-900">
                    −₱{Number(engineTotals.discount_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-emerald-700">Grand Total</p>
                <p className="font-bold text-emerald-900">
                  ₱{Number(engineTotals.grand_total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              {engineTotals.downpayment != null && (
                <div>
                  <p className="text-xs text-emerald-700">Downpayment</p>
                  <p className="font-semibold text-emerald-900">
                    ₱{Number(engineTotals.downpayment ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>

            {Array.isArray(engineTotals.breakdown_json?.items) &&
              engineTotals.breakdown_json.items.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-emerald-700 text-left">
                        <th className="py-1 pr-3">Size</th>
                        <th className="py-1 pr-3">Qty</th>
                        <th className="py-1 pr-3">Price / pc</th>
                        <th className="py-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {engineTotals.breakdown_json.items.map((it, i) => (
                        <tr key={i} className="text-emerald-900">
                          <td className="py-0.5 pr-3">{it.size ?? "—"}</td>
                          <td className="py-0.5 pr-3">{it.quantity ?? 0}</td>
                          <td className="py-0.5 pr-3">
                            ₱{Number(it.price_per_piece ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-0.5">
                            ₱{Number(it.total_amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            <p className="mt-2 text-[11px] text-emerald-700">
              This computed price is saved with the order. The manual size table
              above remains for reference.
            </p>
          </div>
        )}

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