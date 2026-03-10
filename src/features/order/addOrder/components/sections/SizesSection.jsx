import React from "react";
import { Section } from "../common/Section";
import Input from "../../../../../components/form/Input";

export const SizesSection = ({
  sizes,
  onSizeChange,
  onAddSize,
  onRemoveSize,
  errors,
}) => {
  const handleSizeChange = (id, field, value) => {
    onSizeChange(id, field, value);
  };

  const renderSizeInputs = () => {
    return sizes.map((size) => (
      <div
        key={size.id}
        className="bg-white px-10 my-7 py-5 border border-gray-200 rounded"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            label="Size"
            name={`Size-${size.name}`}
            placeholder="Enter Size"
            value={size.name || ""}
            onChange={(e) => handleSizeChange(size.id, "name", e.target.value)}
            type="text"
          />

          <Input
            label="Cost Price"
            name={`costPrice-${size.id}`}
            placeholder="Enter cost price"
            value={size.costPrice || 0}
            onChange={(e) =>
              handleSizeChange(size.id, "costPrice", e.target.value)
            }
            type="number"
            step="0.01"
            min="0"
          />

          <Input
            label="Quantity"
            name={`quantity-${size.id}`}
            placeholder="Enter quantity"
            value={size.quantity || 0}
            onChange={(e) =>
              handleSizeChange(size.id, "quantity", e.target.value)
            }
            type="number"
            min="0"
          />

          <Input
            label="Unit Price"
            name={`unitPrice-${size.id}`}
            placeholder="Unit price"
            value={size.unitPrice?.toFixed(2) || "0.00"}
            readOnly
            type="text"
          />

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => onRemoveSize(size.id)}
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

  return (
    <Section title="Sizes & Quantities">
      <div className="p-4">
        {renderSizeInputs()}

        <div className="col-span-2 px-4 mb-6">
          <button
            type="button"
            onClick={onAddSize}
            className="bg-secondary w-full py-3 text-white rounded-lg border border-gray-300 text-sm hover:bg-secondary/90"
          >
            <i className="fa fa-plus mr-2"></i>Add New Size
          </button>
        </div>
      </div>
    </Section>
  );
};
