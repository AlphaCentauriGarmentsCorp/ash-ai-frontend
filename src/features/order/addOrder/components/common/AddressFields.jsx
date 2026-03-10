import React from "react";
import Input from "../../../../../components/form/Input";

export const AddressFields = ({ formData, handleChange, errors }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    <div className="col-span-1 sm:col-span-2 md:col-span-4">
      <Input
        label="Street"
        name="street_address"
        value={formData.street_address || ""}
        onChange={handleChange}
        error={errors.street_address}
        placeholder="Enter street address"
        type="text"
      />
    </div>

    <Input
      label="Province"
      name="province_address"
      value={formData.province_address || ""}
      onChange={handleChange}
      error={errors.province_address}
      placeholder="Enter province"
      type="text"
    />

    <Input
      label="City"
      name="city_address"
      value={formData.city_address || ""}
      onChange={handleChange}
      error={errors.city_address}
      placeholder="Enter city"
      type="text"
    />

    <Input
      label="Barangay"
      name="barangay_address"
      value={formData.barangay_address || ""}
      onChange={handleChange}
      error={errors.barangay_address}
      placeholder="Enter barangay"
      type="text"
    />

    <Input
      label="Postal Code"
      name="postal_address"
      value={formData.postal_address || ""}
      onChange={handleChange}
      error={errors.postal_address}
      placeholder="Enter postal code"
      type="text"
    />
  </div>
);
