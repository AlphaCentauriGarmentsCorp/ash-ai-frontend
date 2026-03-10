import React from "react";
import { Section } from "../common/Section";
import Input from "../../../../../components/form/Input";

export const SummarySection = ({ summary }) => (
  <Section title="Summary">
    <div className="p-4">
      <div className="bg-white px-10 my-7 py-5 border border-gray-200 rounded">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Total Quantity"
            name="totalQuantity"
            placeholder="Total items"
            value={summary.totalQuantity}
            readOnly
            type="text"
          />
          <Input
            label="Average Unit Price"
            name="averageUnitPrice"
            placeholder="Average price"
            value={summary.averageUnitPrice.toFixed(2)}
            readOnly
            type="text"
          />
          <Input
            label="Total Cost"
            name="totalCost"
            placeholder="Total cost"
            value={summary.totalCost.toFixed(2)}
            readOnly
            type="text"
          />
          <Input
            label="Total Amount"
            name="totalAmount"
            placeholder="Total amount"
            value={summary.totalAmount.toFixed(2)}
            readOnly
            type="text"
            className="font-bold text-blue-600"
          />
        </div>
      </div>
    </div>
  </Section>
);
