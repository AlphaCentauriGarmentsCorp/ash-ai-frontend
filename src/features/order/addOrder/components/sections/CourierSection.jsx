import React from "react";
import { Section } from "../common/Section";
import { AddressFields } from "../common/AddressFields";
import Input from "../../../../../components/form/Input";
import Select from "../../../../../components/form/Select";
import {
  courierList,
  shippingMethodList,
} from "../../../../../constants/formOptions/orderOptions";

export const CourierSection = ({ formData, handleChange, errors }) => (
  <Section title="Courier">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Select
        label="Preferred Courier"
        name="courier"
        options={courierList}
        value={formData.courier || ""}
        onChange={handleChange}
        placeholder="Select courier"
        searchable
        error={errors.courier}
        required
      />

      <Select
        label="Shipping Method"
        name="method"
        options={shippingMethodList}
        value={formData.method || ""}
        onChange={handleChange}
        placeholder="Select shipping method"
        searchable
        error={errors.method}
        required
      />

      <Input
        label="Receiver's Name"
        name="receiver_name"
        value={formData.receiver_name || ""}
        onChange={handleChange}
        error={errors.receiver_name}
        placeholder="Enter name of receiver"
        type="text"
        required
      />

      <Input
        label="Contact Number"
        name="contact_number"
        value={formData.contact_number || ""}
        onChange={handleChange}
        error={errors.contact_number}
        placeholder="Enter contact number"
        type="text"
        required
      />
    </div>

    <AddressFields
      formData={formData}
      handleChange={handleChange}
      errors={errors}
    />
  </Section>
);
