import React from "react";
import { Section } from "../common/Section";
import Input from "../../../../../components/form/Input";
import Select from "../../../../../components/form/Select";
import { printServiceList } from "../../../../../constants/formOptions/orderOptions";

export const ProductDetailsSection = ({
  formData,
  handleChange,
  errors,
  apparelTypeOptions,
  patternTypeOptions,
  serviceTypeOptions,
  printMethodOptions,
  sizeLabelOptions,
  printLabelPlacementOptions,
  optionsLoading,
}) => (
  <Section title="Product Details">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="col-span-1 sm:col-span-2">
        <Input
          label="Design Name"
          name="design_name"
          value={formData.design_name || ""}
          onChange={handleChange}
          error={errors.design_name}
          placeholder="Enter design name"
          type="text"
          required
        />
      </div>

      <Select
        label="Apparel Type"
        name="apparel_type"
        options={apparelTypeOptions}
        value={formData.apparel_type || ""}
        onChange={handleChange}
        placeholder="Select apparel type"
        searchable
        error={errors.apparel_type}
        required
        loading={optionsLoading}
      />

      <Select
        label="Pattern Type"
        name="pattern_type"
        options={patternTypeOptions}
        value={formData.pattern_type || ""}
        onChange={handleChange}
        placeholder="Select pattern type"
        searchable
        error={errors.pattern_type}
        required
        loading={optionsLoading}
      />

      <Select
        label="Service Type"
        name="service_type"
        options={serviceTypeOptions}
        value={formData.service_type || ""}
        onChange={handleChange}
        placeholder="Select service type"
        searchable
        error={errors.service_type}
        required
        loading={optionsLoading}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Print Method"
          name="print_method"
          options={printMethodOptions}
          value={formData.print_method || ""}
          onChange={handleChange}
          placeholder="Select print method"
          searchable
          error={errors.print_method}
          required
          loading={optionsLoading}
        />

        <Select
          label="Print Service"
          name="print_service"
          options={printServiceList}
          value={formData.print_service || ""}
          onChange={handleChange}
          placeholder="Select print service"
          searchable
          error={errors.print_service}
          required
        />
      </div>

      <Select
        label="Size Label"
        name="size_label"
        options={sizeLabelOptions}
        value={formData.size_label || ""}
        onChange={handleChange}
        placeholder="Select size label"
        searchable
        error={errors.size_label}
        required
        loading={optionsLoading}
      />

      <Select
        label="Print Label Placement"
        name="print_label_placement"
        options={printLabelPlacementOptions}
        value={formData.print_label_placement || ""}
        onChange={handleChange}
        placeholder="Select print label placement"
        searchable
        error={errors.print_label_placement}
        required
        loading={optionsLoading}
      />
    </div>
  </Section>
);
