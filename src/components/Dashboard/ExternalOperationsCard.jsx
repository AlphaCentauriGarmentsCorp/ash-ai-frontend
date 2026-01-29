import { Truck, HardHat } from "lucide-react"

export default function ExternalOperationsCard() {
  return (
    <div className="card bg-info bg-opacity-10 border-2 border-dark p-4 rounded-4 mb-4">
      <h3 style={{ color: "#001C34", fontSize: "1.1rem", fontWeight: "600" }}>
        External Operations
      </h3>
      <p className="text-muted" style={{ fontSize: "0.8rem" }}>
        Manage deliveries and subcontract tasks
      </p>

      <div className="row g-3">
        <div className="col-6">
          <div className="btn btn-dark w-100 d-flex flex-column align-items-center gap-2 py-4">
            <div
              className="rounded-circle bg-white text-dark d-flex align-items-center justify-content-center"
              style={{ width: "42px", height: "42px" }}
            >
              <Truck size={22} />
            </div>
            <span>Delivery</span>
          </div>
        </div>

        <div className="col-6">
          <div className="btn btn-dark w-100 d-flex flex-column align-items-center gap-2 py-4">
            <div
              className="rounded-circle bg-white text-dark d-flex align-items-center justify-content-center"
              style={{ width: "42px", height: "42px" }}
            >
              <HardHat size={22} />
            </div>
            <span>Subcontract</span>
          </div>
        </div>
      </div>
    </div>
  )
}
