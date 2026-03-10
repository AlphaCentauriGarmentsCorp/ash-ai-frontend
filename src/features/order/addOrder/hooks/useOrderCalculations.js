import { useState, useEffect, useMemo } from "react";

export const useOrderCalculations = (sizes, depositPercentage) => {
  const calculations = useMemo(() => {
    let totalQuantity = 0;
    let totalAmount = 0;
    let totalCost = 0;
    let unitPriceSum = 0;
    let sizeCount = 0;

    sizes.forEach((size) => {
      const quantity = parseFloat(size.quantity) || 0;
      const costPrice = parseFloat(size.costPrice) || 0;
      const unitPrice = parseFloat(size.unitPrice) || 0;
      const totalPrice = parseFloat(size.totalPrice) || 0;

      if (quantity > 0) {
        totalQuantity += quantity;
        totalAmount += totalPrice;
        totalCost += costPrice * quantity;
        unitPriceSum += unitPrice;
        sizeCount++;
      }
    });

    const depositPercentageNum = parseFloat(depositPercentage) || 60;
    const depositAmount = (totalAmount * depositPercentageNum) / 100;
    const remainingBalance = totalAmount - depositAmount;

    return {
      totalQuantity,
      averageUnitPrice: sizeCount > 0 ? unitPriceSum / sizeCount : 0,
      totalAmount,
      totalCost,
      remainingBalance: remainingBalance.toFixed(2),
      estimatedTotal: totalAmount.toFixed(2),
    };
  }, [sizes, depositPercentage]);

  return calculations;
};
