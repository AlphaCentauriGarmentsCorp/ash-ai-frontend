import React from "react";
import { Section } from "../common/Section";
import Input from "../../../../../components/form/Input";
import Select from "../../../../../components/form/Select";

export const OrderInformationSection = ({
  formData,
  handleChange,
  errors,
  clients,
  clientsLoading,
  clientBrands,
}) => (
  <Section title="Order Information">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Select
        label="Client"
        name="client"
        options={clients}
        value={formData.client || ""}
        onChange={handleChange}
        placeholder="Select client"
        searchable
        error={errors.client}
        required
        loading={clientsLoading}
      />

      <Input
        label="Deadline"
        name="deadline"
        value={formData.deadline || ""}
        onChange={handleChange}
        error={errors.deadline}
        type="date"
        required
      />

      <Select
        label="Brand"
        name="company"
        options={clientBrands}
        value={formData.company || ""}
        onChange={handleChange}
        placeholder={
          !formData.client
            ? "Select client first"
            : clientBrands.length === 0
              ? "No brands available"
              : "Select brand"
        }
        searchable
        error={errors.company}
        required
        disabled={!formData.client || clientsLoading}
      />
    </div>
  </Section>
);
