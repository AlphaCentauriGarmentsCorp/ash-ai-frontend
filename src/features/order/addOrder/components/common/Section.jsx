import React from "react";

export const Section = ({ title, children }) => (
  <>
    <h1 className="font-semibold text-xl border-b text-primary border-gray-300 pb-1">
      {title}
    </h1>
    <div className="p-4">{children}</div>
  </>
);
