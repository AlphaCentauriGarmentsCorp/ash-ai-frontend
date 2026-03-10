import React from "react";
import { Section } from "../common/Section";
import { FileUploadSection } from "../common/FileUploadSection";
import Input from "../../../../../components/form/Input";
import Select from "../../../../../components/form/Select";
import { freebiesOthersList } from "../../../../../constants/formOptions/orderOptions";

export const FreebiesSection = ({
  formData,
  handleChange,
  handleFileChange,
  errors,
}) => (
  <Section title="Freebies">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      <Select
        label="Freebie"
        name="freebie_items"
        options={freebiesOthersList}
        value={formData.freebie_items || ""}
        onChange={handleChange}
        placeholder="Select other freebies"
        searchable
        error={errors.freebie_items}
      />

      <Input
        label="Color"
        name="freebie_color"
        placeholder="Enter freebie color"
        value={formData.freebie_color || ""}
        onChange={handleChange}
        error={errors.freebie_color}
        type="text"
      />

      <div className="col-span-2">
        <Input
          label="Others"
          name="freebie_others"
          placeholder="Enter freebie items"
          value={formData.freebie_others || ""}
          onChange={handleChange}
          error={errors.freebie_others}
          type="text"
        />
      </div>
    </div>

    <div className="py-4 lg:px-25">
      <FileUploadSection
        label="Freebies Files"
        name="freebies_files"
        value={formData.freebies_files || []}
        onChange={handleFileChange}
        error={errors.freebies_files}
      />
    </div>
  </Section>
);
