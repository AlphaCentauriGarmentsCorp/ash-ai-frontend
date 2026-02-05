import DashboardLayout from "../components/Layout/DashboardLayout"
import { Save, Upload } from "lucide-react"
import { useNavigate } from "react-router-dom"


export default function AccountsNew() {
  const navigate = useNavigate()

  return (
    <DashboardLayout
      title="Edit Account"
      breadcrumb="Home / Accounts / Edit"
      icon={null}
    >

      <div className="card rounded-4 p-4">
        

        {/* ================= EDIT PERSONAL DATA ================= */}
        <h6 className="fw-semibold mb-3">Edit Personal Data</h6>

        <div className="p-3 rounded-3 mb-4" style={{ background: "#eef7ff" }}>
          <div className="row g-3">
            {/* LEFT FORM */}
            <div className="col-md-9">
              <div className="row g-3">

                <div className="col-md-4">
                  <label className="form-label">First Name</label>
                  <input className="form-control form-control-sm" placeholder="Enter First Name" />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Middle Name</label>
                  <input className="form-control form-control-sm" placeholder="Enter Middle Name" />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Last Name</label>
                  <input className="form-control form-control-sm" placeholder="Enter Last Name" />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Username</label>
                  <input className="form-control form-control-sm" placeholder="Enter Username" />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control form-control-sm" placeholder="Enter Password" />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Contact Number</label>
                  <input className="form-control form-control-sm" placeholder="Enter Contact Number" />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email Address</label>
                  <input className="form-control form-control-sm" placeholder="Enter Email Address" />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Gender</label>
                  <select className="form-select form-select-sm">
                    <option>Select Gender</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Civil Status</label>
                  <select className="form-select form-select-sm">
                    <option>Select Civil Status</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Birthdate</label>
                  <input type="date" className="form-control form-control-sm" />
                </div>

                <div className="col-md-12">
                  <label className="form-label">Profile Image</label>
                  <input type="file" className="form-control form-control-sm" />
                </div>

              </div>
            </div>

            {/* RIGHT PREVIEW */}
            <div className="col-md-3">
              <div
                className="border rounded-3 d-flex align-items-center justify-content-center text-muted"
                style={{
                  height: "100%",
                  minHeight: "260px",
                  background: "#fff",
                  fontSize: "0.85rem",
                }}
              >
                Preview will show here
              </div>
            </div>
          </div>
        </div>

       {/* ================= ADDRESS ================= */}
<div className="p-3 rounded-3 mb-4" style={{ background: "#eef7ff" }}>
  <div className="d-flex justify-content-between align-items-center mb-3">
    <h6 className="fw-semibold mb-0">Address</h6>

    <div className="form-check">
      <input className="form-check-input" type="checkbox" />
      <label className="form-check-label" style={{ fontSize: "0.8rem" }}>
        Lives On-site
      </label>
    </div>
  </div>

  {/* ===== CURRENT ADDRESS ===== */}
  <div className="mb-3">
    <small className="text-muted">Current Address</small>
  </div>

  <div className="row g-3 mb-3">
    <div className="col-md-12">
      <label className="form-label">Street</label>
      <input className="form-control form-control-sm" placeholder="Enter Street" />
    </div>

    <div className="col-md-3">
      <label className="form-label">Province</label>
      <input className="form-control form-control-sm" placeholder="Enter Province" />
    </div>

    <div className="col-md-3">
      <label className="form-label">Barangay</label>
      <input className="form-control form-control-sm" placeholder="Enter Barangay" />
    </div>

    <div className="col-md-3">
      <label className="form-label">City</label>
      <input className="form-control form-control-sm" placeholder="Enter City" />
    </div>

    <div className="col-md-3">
      <label className="form-label">Postal Code</label>
      <input className="form-control form-control-sm" placeholder="Enter Postal Code" />
    </div>
  </div>

  {/* ===== PERMANENT ADDRESS ===== */}
  <div className="mb-3 mt-4">
    <small className="text-muted">Permanent Address</small>
  </div>

  <div className="row g-3">
    <div className="col-md-12">
      <label className="form-label">Street</label>
      <input className="form-control form-control-sm" placeholder="Enter Street" />
    </div>

    <div className="col-md-3">
      <label className="form-label">Province</label>
      <input className="form-control form-control-sm" placeholder="Enter Province" />
    </div>

    <div className="col-md-3">
      <label className="form-label">Barangay</label>
      <input className="form-control form-control-sm" placeholder="Enter Barangay" />
    </div>

    <div className="col-md-3">
      <label className="form-label">City</label>
      <input className="form-control form-control-sm" placeholder="Enter City" />
    </div>

    <div className="col-md-3">
      <label className="form-label">Postal Code</label>
      <input className="form-control form-control-sm" placeholder="Enter Postal Code" />
    </div>
  </div>
</div>

        {/* ================= JOB POSITION & ROLES ================= */}
<div className="p-3 rounded-3 mb-4" style={{ background: "#eef7ff" }}>
  <h6 className="fw-semibold mb-3">Job Position and Roles</h6>

  <div className="row g-3 mb-3">
    <div className="col-md-6">
      <label className="form-label">Job Position</label>
      <input
        className="form-control form-control-sm"
        placeholder="Enter Job Position"
      />
    </div>

    <div className="col-md-6">
      <label className="form-label">Department</label>
      <input
        className="form-control form-control-sm"
        placeholder="Enter Department"
      />
    </div>
  </div>

  <label className="form-label">Role Access</label>

  {/* WHITE BOX INSIDE BLUE */}
  <div
    className="bg-white border rounded-3 p-3"
    style={{ borderColor: "#dbe7f3" }}
  >
    <div className="row">
      {[
        "Admin",
        "General Manager",
        "CSR",
        "Graphic Artist",
        "Finance",
        "Purchasing",
        "Cutter",
        "Driver",
        "Printer",
        "Sewer",
        "QA",
        "Packer",
        "Warehouse Manager",
        "Screen Maker",
        "Sample Maker",
        "Subcontract",
      ].map((role, i) => (
        <div key={i} className="col-md-3 mb-2">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" />
            <label className="form-check-label">{role}</label>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

       {/* ================= DOCUMENTS ================= */}
<div className="p-3 rounded-3 mb-4" style={{ background: "#eef7ff" }}>
  <h6 className="fw-semibold mb-3">Documents</h6>

  <div className="row g-3 mb-4">
    <div className="col-md-4">
      <label className="form-label">Pag-ibig No.</label>
      <input
        className="form-control form-control-sm"
        placeholder="Enter Pag-ibig Number"
      />
    </div>

    <div className="col-md-4">
      <label className="form-label">SSS No.</label>
      <input
        className="form-control form-control-sm"
        placeholder="Enter SSS Number"
      />
    </div>

    <div className="col-md-4">
      <label className="form-label">Philhealth No.</label>
      <input
        className="form-control form-control-sm"
        placeholder="Enter Philhealth Number"
      />
    </div>
  </div>

  <label className="form-label">Additional Files</label>

  {/* UPLOAD BOX */}
  <div
    className="bg-white border rounded-3 p-4 text-center mb-3"
    style={{ borderColor: "#dbe7f3" }}
  >
    <div className="mb-2">
      ⬇️
    </div>
    <div className="small text-muted">
      Upload Additional Files
    </div>
    <div className="small text-muted">
      Images, pdf, docs (max 10mb)
    </div>
  </div>

  {/* PREVIEW BOX */}
  <div
    className="bg-white border rounded-3 p-4 text-center"
    style={{ borderColor: "#dbe7f3" }}
  >
    <div className="small text-muted">
      Preview will show here
    </div>
  </div>
</div>


{/* ================= ACTIONS ================= */}
<div className="d-flex justify-content-between align-items-center mt-4">

  {/* LEFT */}
  <small className="text-muted">Logs</small>

  {/* CENTER */}
  <div className="d-flex gap-2">
    <button className="btn btn-outline-secondary px-4" onClick={() => navigate(-1)}>
      Cancel
    </button>

    <button className="btn btn-dark px-4 d-flex align-items-center gap-2">
      <Save size={16} />
      Save
    </button>
  </div>

  {/* RIGHT */}
  <button
    className="btn btn-link text-decoration-none text-muted"
    style={{ fontSize: "0.85rem" }}
  >
    Clear all fields
  </button>

</div>

      </div>
    </DashboardLayout>
  )
}
