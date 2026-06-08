import { useState, useEffect, useCallback } from "react";
import { orderService } from "../../../../services/orderService";
import { parseAddress } from "../utils/orderHelpers";

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [rawClients, setRawClients] = useState([]);
  const [clientBrands, setClientBrands] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const fetchClients = useCallback(async () => {
    try {
      setClientsLoading(true);
      const response = await orderService.getClients();
      setRawClients(response.data);
      setClients(
        response.data.map((client) => ({
          value: client.id,
          label: client.name,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      setServerError("Failed to load clients.");
    } finally {
      setClientsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const updateClientBrands = useCallback(
    (clientId) => {
      if (!clientId) {
        setClientBrands([]);
        return { company: "", method: "", courier: "" };
      }

      const selectedClient = rawClients.find(
        (client) => client.id === clientId,
      );
      if (!selectedClient) return {};

      // Change 6 (option B): prefer the client's real granular address
      // columns; fall back to splitting the legacy `address` string for any
      // row not yet re-saved/backfilled with granular data.
      const legacy = parseAddress(selectedClient.address);
      const address = {
        street: selectedClient.street_address ?? legacy.street,
        barangay: selectedClient.barangay ?? legacy.barangay,
        city: selectedClient.city ?? legacy.city,
        province: selectedClient.province ?? legacy.province,
        postal: selectedClient.postal_code ?? legacy.postal,
      };
      const formattedBrands =
        selectedClient.brands?.map((brand) => ({
          value: brand.name,
          label: brand.name,
        })) || [];

      setClientBrands(formattedBrands);

      return {
        company: formattedBrands[0]?.value || "",
        receiver_name: selectedClient.name || "",
        contact_number: selectedClient.contact_number || "",
        street_address: address.street,
        barangay_address: address.barangay,
        city_address: address.city,
        province_address: address.province,
        postal_address: address.postal,
      };
    },
    [rawClients],
  );

  return {
    clients,
    rawClients,
    clientBrands,
    clientsLoading,
    serverError,
    fetchClients,
    updateClientBrands,
  };
};
