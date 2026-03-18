import React from "react";
import { Section } from "../common/Section";
import Input from "../../../../../components/form/Input";
import Select from "../../../../../components/form/Select";

export const SampleSizesSection = ({
  samples = [],
  onSampleChange,
  onAddSample,
  onRemoveSample,
  errors = {},
  sizeLabelOptions = [],
}) => {
  const handleSampleFieldChange = (id, field, value) => {
    onSampleChange(id, field, value);
  };

  const getSampleError = (index, field) => {
    return errors?.samples?.[index]?.[field];
  };

  const renderSampleInputs = () => {
    return samples.map((sample, index) => (
      <div
        key={sample.id || index}
        className="bg-white px-10 my-7 py-5 border border-gray-200 rounded"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Size Field */}
          <div>
            {sizeLabelOptions.length < 0 ? (
              <Select
                label="Size"
                name={`sample_size_${sample.id}`}
                options={sizeLabelOptions}
                value={sample.size || ""}
                onChange={(e) =>
                  handleSampleFieldChange(sample.id, "size", e.target.value)
                }
                placeholder="Select size"
                searchable
                error={getSampleError(index, "size")}
              />
            ) : (
              <Input
                label="Size"
                type="text"
                value={sample.size || ""}
                onChange={(e) =>
                  handleSampleFieldChange(sample.id, "size", e.target.value)
                }
                placeholder="Enter size"
                error={getSampleError(index, "size")}
              />
            )}
          </div>

          {/* Quantity Field */}
          <Input
            label="Quantity"
            type="number"
            min="1"
            step="1"
            value={sample.quantity || ""}
            onChange={(e) =>
              handleSampleFieldChange(
                sample.id,
                "quantity",
                parseInt(e.target.value) || 0,
              )
            }
            placeholder="Enter quantity"
            error={getSampleError(index, "quantity")}
          />

          {/* Unit Price Field */}
          <Input
            label="Unit Price"
            type="number"
            min="0"
            step="0.01"
            value={sample.unit_price || ""}
            onChange={(e) =>
              handleSampleFieldChange(
                sample.id,
                "unit_price",
                parseFloat(e.target.value) || 0,
              )
            }
            placeholder="Enter unit price"
            error={getSampleError(index, "unit_price")}
          />

          {/* Total Field (read-only) */}
          <Input
            label="Total"
            type="text"
            value={`${((sample.quantity || 0) * (sample.unit_price || 0)).toFixed(2)}`}
            readOnly
            className="bg-gray-50"
          />

          {/* Remove Button */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => onRemoveSample(sample.id)}
              className="flex items-center mt-3 justify-center border border-red-600 py-2 px-5 rounded-lg text-red-600 hover:bg-red-50"
            >
              <i className="fa fa-minus mr-2"></i>
              Remove
            </button>
          </div>
        </div>
      </div>
    ));
  };

  if (!samples) {
    return null;
  }

  return (
    <Section title="Sample Sizes & Pricing">
      <div className="p-4">
        {samples.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No sample sizes added yet. Click the button below to add one.
          </div>
        ) : (
          renderSampleInputs()
        )}

        {/* Add sample button */}
        <div className="col-span-2 px-4 mb-6">
          <button
            type="button"
            onClick={onAddSample}
            className="bg-secondary w-full py-3 text-white rounded-lg border border-gray-300 text-sm hover:bg-secondary/90"
          >
            <i className="fa fa-plus mr-2"></i>
            Add New Sample Size
          </button>
        </div>

        {/* Summary section */}
        {/* {samples.length > 0 && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="text-base font-semibold text-blue-800 mb-4">
              Sample Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <span className="text-xs text-blue-600 block mb-1">
                  Total Pieces
                </span>
                <p className="text-2xl font-bold text-blue-900">
                  {samples.reduce(
                    (sum, s) => sum + (parseInt(s.quantity) || 0),
                    0,
                  )}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <span className="text-xs text-blue-600 block mb-1">
                  Total Amount
                </span>
                <p className="text-2xl font-bold text-blue-900">
                  $
                  {samples
                    .reduce(
                      (sum, s) =>
                        sum +
                        (parseInt(s.quantity) || 0) *
                          (parseFloat(s.unit_price) || 0),
                      0,
                    )
                    .toFixed(2)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <span className="text-xs text-blue-600 block mb-1">
                  Unique Sizes
                </span>
                <p className="text-2xl font-bold text-blue-900">
                  {samples.length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <span className="text-xs text-blue-600 block mb-1">
                  Average Price/Unit
                </span>
                <p className="text-2xl font-bold text-blue-900">
                  $
                  {samples.length > 0
                    ? (
                        samples.reduce(
                          (sum, s) =>
                            sum +
                            (parseInt(s.quantity) || 0) *
                              (parseFloat(s.unit_price) || 0),
                          0,
                        ) /
                        samples.reduce(
                          (sum, s) => sum + (parseInt(s.quantity) || 0),
                          0,
                        )
                      ).toFixed(2)
                    : "0.00"}
                </p>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </Section>
  );
};
