import DashboardLayout from "../components/Layout/DashboardLayout"
import { Plus, Trash2, Search, SlidersHorizontal, Eye, Pencil, Trash, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

export default function Accounts() {
  const navigate = useNavigate()
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const handleConfirmDelete = () => {
    if (confirmDeleteId !== null) {
      // TODO: implement actual delete
      setConfirmDeleteId(null)
    }
  }

  return (
    <DashboardLayout
      title="Accounts"
      breadcrumb="Home / Accounts"
      icon={<Eye size={18} />}
    >
      {/* TOP BAR */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          {/* ADD */}
          <button
            className="btn btn-dark d-flex align-items-center gap-2"
            onClick={() => navigate("/admin/accounts/new")}
          >
            <Plus size={16} />
            Add Account
          </button>

          {/* REMOVE (BULK) */}
          <button
            className="btn btn-outline-danger d-flex align-items-center gap-2"
            onClick={() => navigate("/admin/accounts/delete")}
          >
            <Trash2 size={16} />
            Remove Accounts
          </button>
        </div>

        <div className="input-group" style={{ width: "340px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search for orders..."
            style={{ fontSize: "0.85rem" }}
          />
          <span className="input-group-text bg-white">
            <Search size={16} />
          </span>
        </div>
      </div>

      {/* LIST + FILTER */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="fw-semibold mb-0">List</h6>

        <div className="d-flex align-items-center gap-2">
          <span
            className="text-muted d-flex align-items-center gap-1"
            style={{ fontSize: "0.8rem" }}
          >
            <SlidersHorizontal size={14} />
            Filter:
          </span>

          <select className="form-select form-select-sm rounded-3">
            <option>All Orders</option>
          </select>

          <select className="form-select form-select-sm rounded-3">
            <option>All tasks</option>
          </select>

          <select className="form-select form-select-sm rounded-3">
            <option>Priority</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div
        className="card rounded-4"
        style={{ border: "1px solid rgba(0, 28, 52, 0.1)" }}
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
                <th>ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Contact Number</th>
                <th>Email</th>
                <th style={{ width: "120px" }} />
              </tr>
            </thead>

            <tbody style={{ fontSize: "0.85rem" }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td>1</td>
                  <td>Gerard Sarmiento</td>
                  <td>bossangel</td>
                  <td>Developer</td>
                  <td>0999-999-9999</td>
                  <td>sample@gmail.com</td>

                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-1">
                      {/* VIEW */}
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => navigate(`/admin/accounts/${i}`)}
                      >
                        <Eye size={14} />
                      </button>

                      {/* EDIT */}
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => navigate(`/admin/accounts/${i}/delete`)}
                      >
                        <Pencil size={14} />
                      </button>

                      {/* DELETE */}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setConfirmDeleteId(i)}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="d-flex justify-content-center mt-4 gap-2">
        <button className="btn btn-outline-secondary btn-sm">‹</button>
        <button className="btn btn-dark btn-sm">1</button>
        <button className="btn btn-outline-secondary btn-sm">2</button>
        <button className="btn btn-outline-secondary btn-sm">3</button>
        <button className="btn btn-outline-secondary btn-sm">4</button>
        <button className="btn btn-outline-secondary btn-sm">Last</button>
        <button className="btn btn-outline-secondary btn-sm">›</button>
      </div>
      {/* DELETE CONFIRM MODAL */}
      {confirmDeleteId !== null && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="bg-white rounded-4 p-4" style={{ width: 420 }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Confirm Deletion</h6>
              <button className="btn btn-sm btn-light" onClick={() => setConfirmDeleteId(null)}>
                <X size={16} />
              </button>
            </div>
            <p className="mb-4" style={{ fontSize: "0.9rem" }}>
              Are you sure you want to delete account ID {confirmDeleteId}? This action cannot be undone.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-outline-secondary" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
