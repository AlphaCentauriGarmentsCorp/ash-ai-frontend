import React from "react";
import { Section } from "../common/Section";
import Input from "../../../../../components/form/Input";
import Select from "../../../../../components/form/Select";

export const FabricDetailsSection = ({
  formData,
  handleChange,
  errors,
  fabricTypeOptions,
  fabricSupplierOptions,
  optionsLoading,
}) => (
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
          !formData.fabric_type
            ? "Select fabric type first"
            : fabricSupplierOptions.length === 0
              ? "No suppliers available"
              : "Select fabric supplier"
        }
        searchable
        error={errors.fabric_supplier}
        required
        disabled={!formData.fabric_type || optionsLoading}
      />

      <Input
        label="Fabric Color"
        name="fabric_color"
        value={formData.fabric_color || ""}
        onChange={handleChange}
        error={errors.fabric_color}
        placeholder="Enter fabric color"
        type="text"
        required
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

      <Input
        label="Thread Color"
        name="thread_color"
        value={formData.thread_color || ""}
        onChange={handleChange}
        error={errors.thread_color}
        placeholder="Enter thread color"
        type="text"
        required
      />

      <Input
        label="Ribbing Color"
        name="ribbing_color"
        value={formData.ribbing_color || ""}
        onChange={handleChange}
        error={errors.ribbing_color}
        placeholder="Enter ribbing color"
        type="text"
        required
      />
    </div>
  </Section>
);
