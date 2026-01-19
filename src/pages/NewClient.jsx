import DashboardLayout from "../components/Layout/DashboardLayout"
import { Users } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function NewClient() {
  const navigate = useNavigate()

  return (
    <DashboardLayout
      title="Edit Clients"
      breadcrumb="Home / Edit Clients"
      icon={<Users size={18} />}
    >
      <div className="card rounded-4 p-4" style={{ background: "#eef7ff" }}>
        <h6 className="fw-semibold mb-3">Client Information</h6>

        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label">First Name</label>
            <input className="form-control" placeholder="Enter first name" />
          </div>

          <div className="col-md-6">
            <label className="form-label">Last Name</label>
            <input className="form-control" placeholder="Enter last name" />
          </div>

          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input className="form-control" placeholder="Enter email" />
          </div>

          <div className="col-md-6">
            <label className="form-label">Contact Number</label>
            <input className="form-control" placeholder="Enter contact number" />
          </div>
        </div>

        <h6 className="fw-semibold mb-3">Clothing / Company</h6>

        <div className="mb-3 d-flex gap-2">
          <input className="form-control" placeholder="Enter brand name here..." />
          <button className="btn btn-sm text-white" style={{ backgroundColor: "#264660" }}>
            + Add brand
          </button>
        </div>

        <div className="mb-4">
          <label className="form-label">Logo</label>
          <input type="file" className="form-control" />
        </div>

        <h6 className="fw-semibold mb-3">Address</h6>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Street Address</label>
            <input className="form-control" placeholder="Enter street address" />
          </div>

          <div className="col-md-6">
            <label className="form-label">City</label>
            <input className="form-control" placeholder="Enter city" />
          </div>

          <div className="col-md-6">
            <label className="form-label">Province</label>
            <input className="form-control" placeholder="Enter province" />
          </div>

          <div className="col-md-6">
            <label className="form-label">Postal Code</label>
            <input className="form-control" placeholder="Enter postal code" />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">Notes</label>
          <textarea className="form-control" rows="4" placeholder="Additional notes about this brand" />
        </div>

        <div className="d-flex justify-content-center gap-2">
          <button className="btn btn-outline-secondary" onClick={() => navigate("/clients")}>
            Cancel
          </button>
          <button className="btn btn-dark">Submit</button>
        </div>
      </div>
    </DashboardLayout>
  )
}
