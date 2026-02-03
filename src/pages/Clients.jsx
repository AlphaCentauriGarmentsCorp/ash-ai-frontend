import DashboardLayout from "../components/Layout/DashboardLayout"
import { useNavigate } from "react-router-dom"

import { Users, Plus, Trash2, Search, SlidersHorizontal, Pencil } from "lucide-react"

export default function Clients() {
  const navigate = useNavigate()

  return (
    <DashboardLayout
      title="Clients"
      breadcrumb="Home / Customers"
      icon={<Users size={18} />}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          <button
            className="btn btn-dark d-flex align-items-center gap-2"
            onClick={() => navigate("/clients/new")}
          >
            <Plus size={16} />
            New client
          </button>

          <button className="btn btn-outline-danger d-flex align-items-center gap-2">
            <Trash2 size={16} />
            Remove Clients
          </button>
        </div>

        <div className="input-group" style={{ width: "340px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by client name, brand..."
            style={{ fontSize: "0.85rem" }}
          />
          <span className="input-group-text bg-white">
            <Search size={16} />
          </span>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="fw-semibold mb-0">List</h6>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted d-flex align-items-center gap-1" style={{ fontSize: "0.8rem" }}>
            <SlidersHorizontal size={14} />
            Filter:
          </span>

          <select className="form-select form-select-sm rounded-3">
            <option>All Clients</option>
          </select>
        </div>
      </div>

      <div
        className="card rounded-4"
        style={{
          border: "1px solid rgba(0, 28, 52, 0.1)",
        }}
      >
        <div className="table-responsive">
          <table className="table mb-0">
            <thead
              style={{
                background: "#eef7ff",
                fontSize: "0.85rem",
              }}
            >
              <tr>
                <th>Clothing/Company</th>
                <th>Name</th>
                <th>Contact No.</th>
                <th>Email</th>
                <th style={{ width: "60px" }} />
              </tr>
            </thead>

            <tbody style={{ fontSize: "0.85rem" }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <tr key={i}>
                  <td>{i % 2 === 0 ? "KUSH" : "NIKE"}</td>
                  <td>{i % 2 === 0 ? "Ethan Young" : "Abdulaziz De Borja"}</td>
                  <td>09123456789</td>
                  <td>{i % 2 === 0 ? "ethanyoung@gmail.com" : "abdulazizdb@gmail.com"}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => navigate("/clients/new")}
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="d-flex justify-content-center mt-4 gap-2">
        <button className="btn btn-outline-secondary btn-sm">‹</button>
        <button className="btn btn-dark btn-sm">1</button>
        <button className="btn btn-outline-secondary btn-sm">2</button>
        <button className="btn btn-outline-secondary btn-sm">3</button>
        <button className="btn btn-outline-secondary btn-sm">4</button>
        <button className="btn btn-outline-secondary btn-sm">5</button>
        <button className="btn btn-outline-secondary btn-sm">Last</button>
        <button className="btn btn-outline-secondary btn-sm">›</button>
      </div>
    </DashboardLayout>
  )
}
