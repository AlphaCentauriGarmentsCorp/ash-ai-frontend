import React from "react";
import { Section } from "../common/Section";
import Input from "../../../../../components/form/Input";

const formatCurrency = (v) =>
  `₱${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const SizesSection = ({
  sizes,
  onSizeChange,
  onAddSize,
  onRemoveSize,
  errors,
}) => {
  const renderSizeInputs = () =>
    sizes.map((size) => (
      <div
        key={size.id}
        className="bg-white px-6 my-4 py-5 border border-gray-200 rounded"
      >
        {/* If this row was pre-filled from a quotation breakdown, show a compact
            read-only summary strip and let the user edit qty/costPrice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">

          {/* Size name */}
          <Input
            label="Size"
            name={`Size-${size.id}`}
            placeholder="e.g. S, M, L, XL"
            value={size.name || ""}
            onChange={(e) => onSizeChange(size.id, "name", e.target.value)}
            type="text"
          />

          {/* Cost Price (price_per_piece from quotation) */}
          <Input
            label="Cost Price"
            name={`costPrice-${size.id}`}
            placeholder="Cost price"
            value={size.costPrice ?? 0}
            onChange={(e) => onSizeChange(size.id, "costPrice", e.target.value)}
            type="number"
            step="0.01"
            min="0"
          />

          {/* Quantity */}
          <Input
            label="Quantity"
            name={`quantity-${size.id}`}
            placeholder="Qty"
            value={size.quantity ?? 0}
            onChange={(e) => onSizeChange(size.id, "quantity", e.target.value)}
            type="number"
            min="0"
          />

          {/* Unit Price (auto-computed, read-only) */}
          <Input
            label="Unit Price"
            name={`unitPrice-${size.id}`}
            value={(Number(size.unitPrice) || 0).toFixed(2)}
            readOnly
            type="text"
          />

          {/* Total (auto-computed, read-only) */}
          <Input
            label="Total"
            name={`totalPrice-${size.id}`}
            value={(Number(size.totalPrice) || 0).toFixed(2)}
            readOnly
            type="text"
          />

          {/* Remove */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => onRemoveSize(size.id)}
              className="flex items-center mt-3 justify-center border border-red-600 py-2 px-4 rounded-lg text-red-600 hover:bg-red-50 text-sm"
            >
              <i className="fa fa-minus mr-2"></i>Remove
            </button>
          </div>
        </div>

        {/* Quotation reference row — shown only when prefill data present */}
        {(size._unit_price > 0 || size._price_per_pc > 0) && (
          <div className="mt-3 flex gap-4 text-[11px] text-blue-600 bg-blue-50 border border-blue-100 rounded px-3 py-1.5">
            <span>
              <i className="fas fa-file-invoice-dollar mr-1"></i>
              Quotation Unit Price: <strong>{formatCurrency(size._unit_price)}</strong>
            </span>
            <span>
              Price/Pc: <strong>{formatCurrency(size._price_per_pc)}</strong>
            </span>
          </div>
        )}
      </div>
    ));

  return (
    <Section title="Sizes & Quantities">
      <div className="p-4">
        {sizes.length === 0 ? (
          <p className="text-center py-6 text-gray-400 text-sm">No sizes added yet.</p>
        ) : (
          renderSizeInputs()
        )}
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