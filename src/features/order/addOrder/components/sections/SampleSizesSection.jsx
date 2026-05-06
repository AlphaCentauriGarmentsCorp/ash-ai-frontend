import React from "react";
import { Section } from "../common/Section";
import Input from "../../../../../components/form/Input";

export const SampleSizesSection = ({
  samples = [],
  onSampleChange,
  onAddSample,
  onRemoveSample,
  errors = {},
}) => {
  const getSampleError = (index, field) => errors?.samples?.[index]?.[field];

  const renderSampleInputs = () =>
    samples.map((sample, index) => (
      <div
        key={sample.id || index}
        className="bg-white px-6 my-4 py-5 border border-gray-200 rounded"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">

          {/* Sample Apparel / Size */}
          <Input
            label="Sample Apparel"
            type="text"
            value={sample.size || ""}
            onChange={(e) => onSampleChange(sample.id, "size", e.target.value)}
            placeholder="e.g. Sample T-shirt"
            error={getSampleError(index, "size")}
          />

          {/* Unit Price */}
          <Input
            label="Unit Price"
            type="number"
            min="0"
            step="0.01"
            value={sample.unit_price ?? ""}
            onChange={(e) =>
              onSampleChange(sample.id, "unit_price", parseFloat(e.target.value) || 0)
            }
            placeholder="Unit price"
            error={getSampleError(index, "unit_price")}
          />

          {/* Quantity */}
          <Input
            label="Quantity"
            type="number"
            min="1"
            step="1"
            value={sample.quantity ?? ""}
            onChange={(e) =>
              onSampleChange(sample.id, "quantity", parseInt(e.target.value) || 0)
            }
            placeholder="Qty"
            error={getSampleError(index, "quantity")}
          />

          {/* Price/Pc (unit_price × quantity, read-only) */}
          <Input
            label="Price/Pc"
            type="text"
            value={((sample.quantity || 0) * (sample.unit_price || 0)).toFixed(2)}
            readOnly
            className="bg-gray-50"
          />

          {/* Remove */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => onRemoveSample(sample.id)}
              className="flex items-center mt-3 justify-center border border-red-600 py-2 px-4 rounded-lg text-red-600 hover:bg-red-50 text-sm"
            >
              <i className="fa fa-minus mr-2"></i>Remove
            </button>
          </div>
        </div>
      </div>
    ));

  return (
    <Section title="Sample Sizes & Pricing">
      <div className="p-4">
        {samples.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No sample sizes added yet. Click the button below to add one.
          </div>
        ) : (
          renderSampleInputs()
        )}
        <div className="col-span-2 px-4 mb-6">
          <button
            type="button"
            onClick={onAddSample}
            className="bg-secondary w-full py-3 text-white rounded-lg border border-gray-300 text-sm hover:bg-secondary/90"
          >
            <i className="fa fa-plus mr-2"></i>Add New Sample Size
          </button>
        </div>
      </div>
    </Section>
  );
};