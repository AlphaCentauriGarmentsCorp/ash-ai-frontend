import React, { useState } from "react";
import { Section } from "../common/Section";
import Input from "../../../../../components/form/Input";
import Select from "../../../../../components/form/Select";
import SwatchPickerModal from "../../../../../components/quotation/SwatchPickerModal";

/**
 * Issue 21 — the three garment-material colour fields reuse the Issue 4
 * fabric-swatch picker (the exact modal the quotation pages use). Typing a
 * custom colour is still allowed; the palette button is the faster path.
 * Picks are recorded for the ★ Most used shelf by the modal itself, and the
 * value written back is a plain colour-name string, so the
 * "same_fabric_color" propagation in useOrderForm keeps working untouched.
 */
const ColorPickField = ({
  label,
  name,
  value,
  error,
  handleChange,
  onOpenPicker,
}) => (
  <div className="flex items-end gap-2">
    <div className="flex-1 min-w-0">
      <Input
        label={label}
        name={name}
        value={value || ""}
        onChange={handleChange}
        error={error}
        placeholder={`Enter ${label.toLowerCase()}`}
        type="text"
        required
      />
    </div>
    <button
      type="button"
      onClick={onOpenPicker}
      title="Pick from fabric swatches"
      className="mb-4 h-[38px] w-[42px] flex items-center justify-center text-sm rounded-lg bg-light/60 text-primary border border-gray-300 hover:bg-primary/10"
    >
      <i className="fas fa-palette"></i>
    </button>
  </div>
);

export const FabricDetailsSection = ({
  formData,
  handleChange,
  errors,
  fabricTypeOptions,
  fabricSupplierOptions,
  optionsLoading,
}) => {
  // Which colour field the swatch picker is open for:
  // "fabric_color" | "thread_color" | "ribbing_color" | null
  const [pickerFor, setPickerFor] = useState(null);

  const applySwatch = (colorName) => {
    if (pickerFor) {
      // Synthetic event keeps the useOrderForm handleChange contract
      // (incl. the same_fabric_color propagation on fabric_color).
      handleChange({ target: { name: pickerFor, value: colorName } });
    }
    setPickerFor(null);
  };

  return (
    <Section title="Fabric Details">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-1 sm:col-span-2">
          <Select
            label="Fabric Type"
            name="fabric_type"
            options={fabricTypeOptions}
            value={formData.fabric_type || ""}
            onChange={handleChange}
            placeholder="Select fabric type"
            searchable
            error={errors.fabric_type}
            required
            loading={optionsLoading}
          />
        </div>

        <Select
          label="Fabric Supplier"
          name="fabric_supplier"
          options={fabricSupplierOptions}
          value={formData.fabric_supplier || ""}
          onChange={handleChange}
          placeholder={
            fabricSupplierOptions.length === 0
              ? "No suppliers available"
              : "Select fabric supplier"
          }
          searchable
          error={errors.fabric_supplier}
          required
          disabled={optionsLoading}
        />

        <ColorPickField
          label="Fabric Color"
          name="fabric_color"
          value={formData.fabric_color}
          error={errors.fabric_color}
          handleChange={handleChange}
          onOpenPicker={() => setPickerFor("fabric_color")}
        />
        <div></div>
        <div className="-mt-6 flex items-start">
          <div className="flex justify-center items-center gap-3">
            <input
              type="checkbox"
              name="same_fabric_color"
              id="same_fabric_color"
              checked={formData.same_fabric_color || false}
              onChange={handleChange}
              className="border-gray-300 border"
            />
            <label
              htmlFor="same_fabric_color"
              className="text-primary/55 text-xs"
            >
              Keep the same color for other
            </label>
          </div>
        </div>

        <ColorPickField
          label="Thread Color"
          name="thread_color"
          value={formData.thread_color}
          error={errors.thread_color}
          handleChange={handleChange}
          onOpenPicker={() => setPickerFor("thread_color")}
        />

        <ColorPickField
          label="Ribbing Color"
          name="ribbing_color"
          value={formData.ribbing_color}
          error={errors.ribbing_color}
          handleChange={handleChange}
          onOpenPicker={() => setPickerFor("ribbing_color")}
        />
      </div>

      <SwatchPickerModal
        open={!!pickerFor}
        currentValue={(pickerFor && formData[pickerFor]) || ""}
        onClose={() => setPickerFor(null)}
        onSelect={applySwatch}
      />
    </Section>
  );
};
