import React from "react";
import { formatCurrency } from "../../../utils/formatters";

const Pricing = ({ order }) => {
  return (
    <section className="flex-col flex gap-y-2 sm:gap-y-3">
      <h1 className="font-semibold text-base sm:text-lg">
        Pricing Information
      </h1>
      <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
        <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">Payment Method</p>
          <p className="text-xs sm:text-sm font-medium capitalize">
            {order?.payment_method || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">Payment Plan</p>
          <p className="text-xs sm:text-sm font-medium capitalize">
            {order?.payment_plan || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">Total Quantity</p>
          <p className="text-xs sm:text-sm font-medium">
            {order?.total_quantity || 0}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">Average Unit Price</p>
          <p className="text-xs sm:text-sm font-medium">
            {formatCurrency(order?.average_unit_price)}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">Total Price</p>
          <p className="text-xs sm:text-sm font-medium text-green-600">
            {formatCurrency(order?.total_price)}
          </p>
        </div>
        <div className="flex justify-between p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">
            Deposit ({order?.deposit || 0}%)
          </p>
          <p className="text-xs sm:text-sm font-medium text-blue-600 text-right wrap-break-word max-w-37.5 sm:max-w-none">
            {formatCurrency((order?.total_price * (order?.deposit || 0)) / 100)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
