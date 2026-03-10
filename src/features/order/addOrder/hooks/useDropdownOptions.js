import { useState, useCallback } from "react";
import { orderService } from "../../../../services/orderService";

export const useDropdownOptions = () => {
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [apparelTypeOptions, setApparelTypeOptions] = useState([]);
  const [patternTypeOptions, setPatternTypeOptions] = useState([]);
  const [serviceTypeOptions, setServiceTypeOptions] = useState([]);
  const [printMethodOptions, setPrintMethodOptions] = useState([]);
  const [sizeLabelOptions, setSizeLabelOptions] = useState([]);
  const [printLabelPlacementOptions, setPrintLabelPlacementOptions] = useState(
    [],
  );
  const [serverError, setServerError] = useState("");

  const fetchDropdownOptions = useCallback(async () => {
    try {
      setOptionsLoading(true);
      const options = await orderService.getAllDropdownOptions();

      setApparelTypeOptions(options.apparelTypes);
      setPatternTypeOptions(options.patternTypes);
      setServiceTypeOptions(options.serviceTypes);
      setPrintMethodOptions(options.printMethods);
      setSizeLabelOptions(options.sizeLabels);
      setPrintLabelPlacementOptions(options.printLabelPlacements);
    } catch (err) {
      setServerError("Failed to load dropdown options.");
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  return {
    optionsLoading,
    apparelTypeOptions,
    patternTypeOptions,
    serviceTypeOptions,
    printMethodOptions,
    sizeLabelOptions,
    printLabelPlacementOptions,
    serverError,
    fetchDropdownOptions,
  };
};
