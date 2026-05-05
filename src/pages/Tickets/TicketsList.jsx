import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import Table from "../../components/table/Table";
import DeleteConfirmationDialog from "../../components/common/DeleteConfirmationDialog";
import TicketComposer from "../../components/tickets/TicketComposer";
import { useAuth } from "../../hooks/useAuth";
import ticketService from "../../services/ticketService";
import { extractUserRoles } from "../../utils/authz";

const getStatusClassName = (status) => {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "open") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (normalized === "pending") {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }

  if (normalized === "resolved") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  return "bg-gray-100 text-gray-700 border-gray-200";
};

const resolveTicketViewPath = (ticket) => {
  const requestType = String(ticket?.request_type || "").trim().toLowerCase();

  if (requestType === "quotation") {
    return `/tickets/quotation/${ticket.id}`;
  }

  if (requestType === "order") {
    return `/tickets/order/${ticket.id}`;
  }

  return `/tickets/${ticket.id}`;
};

const normalizeTicketList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const directData = payload?.data;
  if (directData && typeof directData === "object") {
    const incoming = Array.isArray(directData.incoming) ? directData.incoming : [];
    const outgoing = Array.isArray(directData.outgoing) ? directData.outgoing : [];
    return [...incoming, ...outgoing];
  }

  const queue = [payload];
  const seen = new Set();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);

    if (Array.isArray(current)) return current;

    const candidates = [current.data, current.tickets, current.items, current.rows, current.results];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
      if (candidate && typeof candidate === "object") {
        const incoming = Array.isArray(candidate.incoming) ? candidate.incoming : [];
        const outgoing = Array.isArray(candidate.outgoing) ? candidate.outgoing : [];
        if (incoming.length > 0 || outgoing.length > 0) {
          return [...incoming, ...outgoing];
        }
      }
      if (candidate && typeof candidate === "object") queue.push(candidate);
    }

    for (const value of Object.values(current)) {
      if (Array.isArray(value)) return value;
      if (value && typeof value === "object") {
        const incoming = Array.isArray(value.incoming) ? value.incoming : [];
        const outgoing = Array.isArray(value.outgoing) ? value.outgoing : [];
        if (incoming.length > 0 || outgoing.length > 0) {
          return [...incoming, ...outgoing];
        }
      }
      if (value && typeof value === "object") queue.push(value);
    }
  }

  return [];
};

const getTicketRoleCandidates = (user) => {
  const rawRoles = [];

  const addRoleValues = (value) => {
    if (!value) return;
    const values = Array.isArray(value) ? value : [value];

    values.forEach((role) => {
      if (typeof role === "string") {
        rawRoles.push(role.trim());
        return;
      }

      if (role && typeof role === "object") {
        rawRoles.push(String(role.name || role.slug || role.code || role.id || "").trim());
      }
    });
  };

  addRoleValues(user?.domain_role);
  addRoleValues(user?.domain_roles);
  addRoleValues(user?.roles);
  addRoleValues(user?.role);
  addRoleValues(user?.role_name);
  addRoleValues(user?.user_role);

  const normalizedRoles = extractUserRoles(user);

  return Array.from(
    new Set([...rawRoles, ...normalizedRoles].map((role) => String(role || "").trim()).filter(Boolean)),
  );
};

export default function TicketsList() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const userRoles = useMemo(() => (user ? getTicketRoleCandidates(user) : []), [user]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      let payload = [];

      if (userRoles.length > 0) {
        const responses = await Promise.all(
          userRoles.map(async (role) => {
            try {
              return await ticketService.byRole(role);
            } catch (err) {
              return [];
            }
          }),
        );

        const merged = [];
        const seenIds = new Set();

        responses.forEach((response) => {
          normalizeTicketList(response).forEach((ticket) => {
            const ticketKey = ticket?.id ?? JSON.stringify(ticket);
            if (seenIds.has(ticketKey)) return;
            seenIds.add(ticketKey);
            merged.push(ticket);
          });
        });

        payload = merged;
      }

      if (payload.length === 0) {
        payload = normalizeTicketList(await ticketService.list());
      }

      setData(payload);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [userRoles]);

  useEffect(() => {
    if (loading) return;

    fetchData();
  }, [fetchData, loading, userRoles]);

  const handleAction = (action, row) => {
    switch (action) {
      case "view":
        navigate(resolveTicketViewPath(row));
        break;
      case "delete":
        setSelectedItem(row);
        setIsDeleteDialogOpen(true);
        break;
      default:
        break;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    setIsDeleting(true);
    try {
      await ticketService.remove(selectedItem.id);
      setData((prev) => prev.filter((d) => d.id !== selectedItem.id));
      setIsDeleteDialogOpen(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete ticket");
    } finally {
      setIsDeleting(false);
      setSelectedItem(null);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "request_type", label: "Request Type" },
    { key: "to_role", label: "To" },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusClassName(
            item.status,
          )}`}
        >
          {item.status || "Unknown"}
        </span>
      ),
    },
    { key: "date_created", label: "Created" },
  ];

  const tableConfig = {
    sortable: true,
    pagination: true,
    search: true,
    filters: false,
    actions: ["view", "delete"],
    pageSize: 10,
    emptyMessage: "No tickets found",
    searchPlaceholder: "Search tickets...",
    showIndex: true,
  };

  return (
    <AdminLayout
      icon="fa-ticket"
      pageTitle="Tickets"
      path="/tickets"
      links={[{ label: "Home", href: "/" }, { label: "Tickets", href: "/tickets" }]}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-primary">Tickets</h2>
          <p className="text-sm text-gray-500">Create and track support requests.</p>
        </div>

        <TicketComposer onCreated={fetchData} />
      </div>

      <Table
        data={data}
        columns={columns}
        config={tableConfig}
        onAction={handleAction}
        isLoading={isLoading}
        PageTitle={<span className="font-semibold">Tickets</span>}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedItem?.request_type}
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
}
