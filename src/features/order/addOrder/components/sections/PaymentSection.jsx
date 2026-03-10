import React from "react";
import { Section } from "../common/Section";
import { FileUploadSection } from "../common/FileUploadSection";
import Input from "../../../../../components/form/Input";
import Select from "../../../../../components/form/Select";
import {
  paymentMethods,
  paymentPlans,
} from "../../../../../constants/formOptions/orderOptions";

export const PaymentSection = ({
  formData,
  handleChange,
  handleDepositPercentageChange,
  handleFileChange,
  errors,
  summary,
}) => (
  <Section title="Pricing & Payment Control">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
      <Select
        label="Payment Plan"
        name="payment_plan"
        options={paymentPlans}
        value={formData.payment_plan || ""}
        onChange={handleChange}
        placeholder="Select payment method"
        searchable
        error={errors.payment_plan}
        required
      />

      <Select
        label="Payment Method"
        name="payment_method"
        options={paymentMethods}
        value={formData.payment_method || ""}
        onChange={handleChange}
        placeholder="Select payment method"
        searchable
        error={errors.payment_method}
        required
      />

      {formData.payment_plan === "downpayment" && (
        <>
          <Input
            label="Deposit %"
            name="deposit_percentage"
            placeholder="Enter deposit percentage"
            value={formData.deposit_percentage}
            onChange={handleDepositPercentageChange}
            error={errors.deposit_percentage}
            type="number"
            min="0"
            max="100"
          />

          <Input
            label="Remaining Balance"
            name="remaining_balance"
            placeholder="Enter remaining balance"
            value={summary.remainingBalance}
            readOnly
          />
        </>
      )}

      <div className="col-span-2">
        <Input
          label="Estimated Total"
          name="estimated_total"
          placeholder="Enter estimated total"
          value={summary.estimatedTotal}
          readOnly
        />
      </div>
    </div>

    <div className="p-4 lg:px-25">
      <FileUploadSection
        label="Receipt and Bank Account Details"
        name="payments"
        value={formData.payments || []}
        onChange={handleFileChange}
        error={errors.payments}
      />
    </div>
  </Section>
);
