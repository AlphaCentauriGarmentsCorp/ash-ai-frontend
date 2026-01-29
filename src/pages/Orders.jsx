import DashboardLayout from "../components/Layout/DashboardLayout"
import { useNavigate } from "react-router-dom"
import { useMemo, useState, useEffect } from "react"
import {
  ClipboardList,
  Plus,
  RefreshCcw,
  History,
  Search,
  SlidersHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react"

const MOCK_ORDERS = Array.from({ length: 23 }).map((_, i) => ({
  id: `ORD-2025-82593${i}`,
  type: i % 2 === 0 ? "reefer" : "sorbetes",
  priority: ["high", "medium", "low"][i % 3],
  clothing: i % 4 === 0 ? "Reefer" : "Adidas",
  design: "The Reefer",
  status: ["draft", "production", "pending", "confirmed"][i % 4],
  leadTime: "1425 hrs",
  legend: i % 4 === 0 ? "orange" : "black",
}))

const PAGE_SIZE = 7

export default function Orders() {
  const navigate = useNavigate()

  const [limit, setLimit] = useState(7)
  const [inputValue, setInputValue] = useState("7")
  const [page, setPage] = useState(1)

  const [orderType, setOrderType] = useState("all")
  const [taskStatus, setTaskStatus] = useState("all")
  const [priority, setPriority] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const isAll = limit === "all"

  const filteredData = useMemo(() => {
    let data = [...MOCK_ORDERS]

    if (orderType !== "all") {
      data = data.filter((o) => o.type === orderType)
    }

    if (taskStatus !== "all") {
      data = data.filter((o) => o.status === taskStatus)
    }

    if (priority !== "all") {
      data = data.filter((o) => o.priority === priority)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      data = data.filter((o) => o.id.toLowerCase().includes(q))
    }

    return data
  }, [orderType, taskStatus, priority, searchQuery])

  useEffect(() => {
    setPage(1)
  }, [orderType, taskStatus, priority, limit, searchQuery])

  const cappedData = isAll ? filteredData : filteredData.slice(0, limit)

  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(cappedData.length / PAGE_SIZE))

  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const visibleData = isAll ? cappedData : cappedData.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <DashboardLayout
      title="Orders"
      breadcrumb="Daily Operations / Orders"
      icon={<ClipboardList size={18} />}
    >
      <div className="card bg-info bg-opacity-10 border-2 border-dark p-4 rounded-4">
        <div className="d-flex flex-column gap-3 mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <button
                className="btn btn-dark d-flex align-items-center gap-2 rounded-3 px-3"
                onClick={() => navigate("/orders/new")}
              >
                <Plus size={16} />
                New order
              </button>

              <button className="btn btn-outline-dark d-flex align-items-center gap-2 rounded-3 px-3">
                <RefreshCcw size={16} />
                Refresh
              </button>
            </div>

            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-outline-dark d-flex align-items-center gap-2 rounded-3 px-3">
                <History size={16} />
                Order History
              </button>

              <div className="input-group" style={{ width: "260px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search for orders..."
                  style={{ fontSize: "0.85rem" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="input-group-text bg-white">
                  <Search size={16} />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-3" style={{ fontSize: "0.85rem" }}>
            <span className="text-muted">Legends:</span>

            <span className="badge bg-white border d-flex align-items-center gap-2 px-3" style={{ color: "#000" }}>
              Reefer
              <span className="rounded-circle" style={{ width: 10, height: 10, background: "#f97316" }} />
            </span>

            <span className="badge bg-white border d-flex align-items-center gap-2 px-3" style={{ color: "#000" }}>
              Sorbetes
              <span className="rounded-circle" style={{ width: 10, height: 10, background: "#000" }} />
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="text-muted d-flex align-items-center gap-1">
              <SlidersHorizontal size={14} />
              Filter:
            </span>

            <select
              className="form-select form-select-sm"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="sorbetes">Sorbetes</option>
              <option value="reefer">Reefer</option>
            </select>

            <select
              className="form-select form-select-sm"
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value)}
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending Approval</option>
              <option value="production">In Production</option>
              <option value="confirmed">Confirmed</option>
              <option value="draft">Draft</option>
            </select>

            <select
              className="form-select form-select-sm"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-4 border mb-3">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead style={{ background: "#eef7ff" }}>
                <tr>
                  <th>P.O No.</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Clothing</th>
                  <th>Design Name</th>
                  <th>Status</th>
                  <th>Lead Time Left</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visibleData.map((o) => (
                  <tr key={o.id}>
                    <td className="d-flex align-items-center gap-2">
                      <span
                        className="rounded-circle"
                        style={{
                          width: 10,
                          height: 10,
                          background: o.legend === "orange" ? "#f97316" : "#000",
                        }}
                      />
                      {o.id}
                    </td>
                    <td className="text-capitalize">{o.type}</td>
                    <td className="text-capitalize">{o.priority}</td>
                    <td>{o.clothing}</td>
                    <td>{o.design}</td>
                    <td className="text-capitalize">{o.status}</td>
                    <td>{o.leadTime}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-secondary me-1">
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-secondary me-1">
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-sm btn-outline-danger">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="position-relative mt-2">
          {!isAll && totalPages > 1 && (
            <div className="d-flex justify-content-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${safePage === i + 1 ? "btn-dark" : "btn-outline-secondary"}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          <div className="position-absolute top-50 end-0 translate-middle-y d-flex align-items-center gap-2">
            <span className="text-muted">Show</span>
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ width: "90px" }}
              placeholder="7 / all"
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value.toLowerCase()
                setInputValue(val)

                if (val === "all") {
                  setLimit("all")
                  setPage(1)
                  return
                }

                const num = Number(val)
                if (!isNaN(num) && num > 0) {
                  setLimit(num)
                  setPage(1)
                }
              }}
            />
            <span className="text-muted">entries</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
