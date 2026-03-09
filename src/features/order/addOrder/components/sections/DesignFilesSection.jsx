import React from "react";
import { Section } from "../common/Section";
import { FileUploadSection } from "../common/FileUploadSection";
import Select from "../../../../../components/form/Select";
import Textarea from "../../../../../components/form/Textarea";
import { apparelPlacementMeasurements } from "../../../../../constants/formOptions/orderOptions";

export const DesignFilesSection = ({
  formData,
  handleChange,
  handleFileChange,
  errors,
}) => (
  <Section title="Design Files & Mockups">
    <div className="px-2 lg:px-25">
      <FileUploadSection
        label="Design Files"
        name="design_files"
        value={formData.design_files || []}
        onChange={handleFileChange}
        error={errors.design_files}
      />

      <FileUploadSection
        label="Design Mockup"
        name="design_mockup"
        value={formData.design_mockup || []}
        onChange={handleFileChange}
        error={errors.design_mockup}
        acceptedTypes=".jpg,.jpeg,.png,.webp"
      />

      <FileUploadSection
        label="Size Label"
        name="size_label_files"
        value={formData.size_label_files || []}
        onChange={handleFileChange}
        error={errors.size_label_files}
      />

      <div className="px-6 py-4">
        <Select
          label="Placement Measurements"
          name="placement_measurements"
          options={apparelPlacementMeasurements}
          value={formData.placement_measurements || ""}
          onChange={handleChange}
          placeholder="Select Placement Measurements"
          searchable
          error={errors.placement_measurements}
        />

        <Textarea
          label="Notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          rows={6}
          resizable={true}
        />
      </div>
    </div>
  </Section>
);
