import React, { createContext, useContext, useMemo } from "react";

const TableContext = createContext();

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTableContext must be used within TableProvider");
  }
  return context;
};

export const TableProvider = ({ children, value }) => {
  const contextValue = useMemo(() => value, [value]);
  return (
    <TableContext.Provider value={contextValue}>
      {children}
    </TableContext.Provider>
  );
};