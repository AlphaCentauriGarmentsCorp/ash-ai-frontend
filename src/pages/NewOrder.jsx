import DashboardLayout from "../components/Layout/DashboardLayout"
import { PlusCircle, Upload } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function NewOrder() {
  const navigate = useNavigate()

  return (
    <DashboardLayout
      title="Add new order"
      breadcrumb="Daily Operations / Orders / New Order"
      icon={<PlusCircle size={18} />}
    >
      <div className="card p-4 rounded-4 border-0" style={{ background: "#eef6ff" }}>

        {/* ================= ORDER INFORMATION ================= */}
        <Section title="Order Information">
          <div className="row g-3">
            <InputSelect label="Client" col="col-md-4" placeholder="Select Client" />
            <InputDate label="Requested Deadline" col="col-md-3" />
            <InputText
              label="Clothing / Company"
              col="col-md-5"
              disabled
              placeholder="Company or brand will automatically show here"
            />
            <InputSelect label="Brand" col="col-md-3" placeholder="Select brand" />
            <InputSelect label="Priority" col="col-md-3" placeholder="Select Priority" />
          </div>
        </Section>

        {/* ================= PRODUCT DETAILS ================= */}
        <Section title="Product Details">
          <div className="row g-3">
            <InputSelect label="Apparel Type" />
            <InputSelect label="Fabric Type" />
            <InputSelect label="Pattern Type" />
            <InputSelect label="Print Method" />
            <InputSelect label="Service Type" />
            <InputSelect label="Size Label" />

            <InputText label="Fabric Color" placeholder="Enter fabric color" />
            <InputText label="Ribbing Color" placeholder="Enter ribbing color" />
            <InputText label="Needle Color" placeholder="Enter needle color" />

            <div className="col-md-4 d-flex align-items-center mt-2">
              <input type="checkbox" className="form-check-input me-2" />
              <label className="form-check-label text-muted">
                Keep the same color for everybody
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="form-label fw-semibold">Options</label>
            <div className="row">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="col-md-3 mb-2">
                  <input type="checkbox" className="form-check-input me-2" />
                  <label className="form-check-label">with Collar</label>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ================= PRINT AREA ================= */}
        <Section title="Print Area">
          <div className="row g-2 align-items-end">
            <InputSelect label="Select print area" placeholder="Print areas" />
            <InputNumber label="Height" defaultValue={0} />
            <InputNumber label="Width" defaultValue={0} />
            <InputNumber label="X-offset" defaultValue={0} />
            <InputNumber label="Y-offset" defaultValue={0} />

            <div className="col-md-2">
              <button className="btn btn-dark w-100">
                + Add print location
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-between mt-1">
            <small className="text-danger">* Press enter to confirm the print area</small>
            <small className="text-danger">* Press add brand button to add more print location</small>
          </div>
        </Section>

        {/* ================= DESIGN FILES & MOCKUPS ================= */}
        <Section title="Design Files & Mockups">
          <UploadBlock title="Design Files" />
          <UploadBlock title="Design Mockups" />
          <UploadBlock title="Placement Measurements" />

          <div className="mt-3">
            <label className="form-label fw-semibold">Additional Notes</label>
            <textarea className="form-control" rows={4} placeholder="Add notes here" />
          </div>

          <div className="mt-4">
            <label className="form-label fw-semibold">Instructions Files</label>
            <input type="file" className="form-control mb-2" />
            <div className="border rounded p-3 text-center text-muted">Preview will show here</div>
          </div>
        </Section>

        {/* ================= SIZES & QUANTITIES ================= */}
        <Section title="Sizes & Quantities">
          <div className="mb-3 col-md-3">
            <label className="form-label">Total Quantity</label>
            <input className="form-control" defaultValue={0} />
          </div>

          <div className="p-3 rounded" style={{ background: "#dcecf9" }}>
            <label className="form-label fw-semibold">Size Breakdown</label>
            <div className="row g-2">
              {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                <div key={size} className="col">
                  <label className="form-label">{size}</label>
                  <input className="form-control" defaultValue={0} />
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-between mt-3">
              <small>Total: 0 pcs</small>
              <button className="btn btn-dark btn-sm">Auto distribute</button>
            </div>
          </div>
        </Section>

        {/* ================= PRICING & PAYMENT ================= */}
        <Section title="Pricing & Payment Control">
          <div className="row g-3">
            <InputText label="Unit Price" placeholder="₱0.00" />
            <InputText label="Deposit %" placeholder="Deposit percent" />
            <InputText
              label="Estimated Total"
              placeholder="Estimated total of product"
              disabled
            />
            <InputSelect label="Payment Method" placeholder="Select payment method" />
          </div>
        </Section>

        {/* ================= ORDER SUMMARY ================= */}
        <Section title="Order Summary">
          <div className="row g-3">
            <PreviewBox />
            <PreviewBox />
          </div>
        </Section>

        {/* ================= ACTIONS ================= */}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="d-flex gap-3 small text-muted">
            <span>Logs</span>
            <span>Developer’s Monitor</span>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => navigate("/orders")}>
              Cancel
            </button>
            <button className="btn btn-dark">Save</button>
            <button className="btn btn-outline-secondary">Save as draft</button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}

/* ================= REUSABLE UI ================= */

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <h6 className="fw-semibold border-bottom pb-2 mb-3">{title}</h6>
      {children}
    </div>
  )
}

function InputText({ label, placeholder, disabled, col = "col-md-3" }) {
  return (
    <div className={col}>
      <label className="form-label">{label}</label>
      <input className="form-control" placeholder={placeholder} disabled={disabled} />
    </div>
  )
}

function InputNumber({ label, defaultValue, col = "col-md-2" }) {
  return (
    <div className={col}>
      <label className="form-label">{label}</label>
      <input type="number" className="form-control" defaultValue={defaultValue} />
    </div>
  )
}

function InputSelect({ label, placeholder = "Select", col = "col-md-3" }) {
  return (
    <div className={col}>
      <label className="form-label">{label}</label>
      <select className="form-select">
        <option>{placeholder}</option>
      </select>
    </div>
  )
}

function InputDate({ label, col = "col-md-3" }) {
  return (
    <div className={col}>
      <label className="form-label">{label}</label>
      <input type="date" className="form-control" />
    </div>
  )
}

function UploadBlock({ title }) {
  return (
    <div className="mb-4">
      <label className="form-label fw-semibold">{title}</label>
      <div className="border rounded p-4 text-center bg-white mb-2">
        <Upload size={20} className="mb-2 text-muted" />
        <div className="text-muted">Upload {title.toLowerCase()}</div>
      </div>
      <div className="border rounded p-3 text-center text-muted">Preview will show here</div>
    </div>
  )
}

function PreviewBox() {
  return (
    <div className="col-md-6">
      <div className="border rounded p-5 text-center text-muted">Preview will show here</div>
    </div>
  )
}
