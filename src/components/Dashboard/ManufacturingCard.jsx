import { ArrowRight } from "lucide-react"

const items = [
  "Cutting",
  "Packer",
  "Printing",
  "Inventory",
  "Sewing",
  "Screen Maker",
  "Quality Control (QA)",
  "Sample Maker",
]

export default function ManufacturingCard() {
  return (
    <div className="card bg-info bg-opacity-10 border-2 border-dark p-4 rounded-4 mb-4">
      <h3 style={{ color: "#001C34", fontSize: "1.1rem", fontWeight: "600" }}>Manufacturing</h3>
      <p className="text-muted" style={{ fontSize: "0.8rem" }}>
        Quick access to all production stages
      </p>

      <div className="row g-2">
        {items.map(item => (
          <div key={item} className="col-6">
            <button className="btn btn-dark w-100 d-flex justify-content-between align-items-center" style={{ fontSize: "0.8rem", padding: "0.6rem 0.8rem" }}>
              {item}
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
