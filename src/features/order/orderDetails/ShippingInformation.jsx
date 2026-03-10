import React from "react";

const ShippingInformation = ({ order }) => {
  return (
    <section className="flex-col flex gap-y-2 sm:gap-y-3">
      <h1 className="font-semibold text-base sm:text-lg">
        Shipping Information
      </h1>
      <div className="border border-gray-200 sm:border-gray-300 p-2 sm:p-3 rounded-lg sm:rounded-xl">
        <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">Courier</p>
          <p className="text-xs sm:text-sm font-medium capitalize">
            {order?.courier || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">Method</p>
          <p className="text-xs sm:text-sm font-medium capitalize">
            {order?.method || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">Receiver Name</p>
          <p className="text-xs sm:text-sm font-medium">
            {order?.receiver_name || "N/A"}
          </p>
        </div>
        <div className="flex justify-between border-b border-b-gray-100 p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">Receiver Contact</p>
          <p className="text-xs sm:text-sm font-medium">
            {order?.receiver_contact || "N/A"}
          </p>
        </div>
        <div className="flex justify-between p-1.5 sm:p-2">
          <p className="text-gray-500 text-xs sm:text-sm">Address</p>
          <p className="text-xs sm:text-sm font-medium text-right max-w-45 sm:max-w-xs wrap-break-word">
            {order?.address || "N/A"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ShippingInformation;
