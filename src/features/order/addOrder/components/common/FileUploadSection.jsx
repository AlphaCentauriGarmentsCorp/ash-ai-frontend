import React from "react";
import FileUpload from "../../../../../components/form/FileUpload";

export const FileUploadSection = ({
  label,
  name,
  value,
  onChange,
  error,
  acceptedTypes,
}) => (
  <div className="py-4">
    <FileUpload
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      acceptedTypes={acceptedTypes || "image/*,.ai,.psd,.pdf,.png,.jpg,.jpeg"}
      maxSize={25 * 1024 * 1024}
      multiple={true}
      error={error}
    />
  </div>
);
