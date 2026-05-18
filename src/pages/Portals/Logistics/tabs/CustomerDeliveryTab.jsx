import React from "react";

/**
 * Phase 5-I — Customer Delivery tab (placeholder).
 *
 * Will be expanded in a later phase to handle the final 'delivery'
 * workflow stage where the order ships to the end customer. For now,
 * a coming-soon notice keeps the tab present in the UI so users can
 * see it on the roadmap.
 */
const CustomerDeliveryTab = () => {
  return (
    <section className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
        <i className="fa-solid fa-box-circle-check text-2xl text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        Customer Delivery — Coming Soon
      </h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto">
        Ang Customer Delivery workflow para sa pag-deliver ng finished
        orders sa client ay nasa pipeline. Sa ngayon, lahat ng
        subcontract shipments ay mahahandle mo sa kabilang tab.
      </p>
    </section>
  );
};

export default CustomerDeliveryTab;
