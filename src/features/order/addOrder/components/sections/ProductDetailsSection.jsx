import React from "react";
import { Section } from "../common/Section";
import Input from "../../../../../components/form/Input";
import Select from "../../../../../components/form/Select";
import LabelSpecSection from "../../../../../components/quotation/LabelSpecSection";
import { printServiceList } from "../../../../../constants/formOptions/orderOptions";

export const ProductDetailsSection = ({
  formData,
  setFormData,
  handleChange,
  errors,
  apparelTypeOptions,
  patternTypeOptions,
  serviceTypeOptions,
  printMethodOptions,
  optionsLoading,
}) => {
  // "High Density" is a silkscreen Special Print, not a standalone print
  // method, so it is excluded from the Print Method dropdown (mirrors the
  // Quotation form). Silkscreen itself stays selectable.
  const filteredPrintMethodOptions = (printMethodOptions || []).filter(
    (opt) =>
      !String(opt.value ?? opt.label ?? "")
        .toLowerCase()
        .includes("high density"),
  );

  return (
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
          options={filteredPrintMethodOptions}
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

    </div>

    {/* Labels (Brand + Care/Size + shared design) — SAME shared component the
        Quotation form uses, so a converted quotation prefills 1:1. */}
    <LabelSpecSection
      brandLabel={formData.brandLabel}
      careLabel={formData.careLabel}
      onBrandLabelChange={(next) => setFormData((p) => ({ ...p, brandLabel: next }))}
      onCareLabelChange={(next) => setFormData((p) => ({ ...p, careLabel: next }))}
      labelDesign={formData.labelDesign}
      onLabelDesignChange={(next) => setFormData((p) => ({ ...p, labelDesign: next }))}
      brandLabelErrors={errors.brandLabel || {}}
      careLabelErrors={errors.careLabel || {}}
    />
  </Section>
  );
};
