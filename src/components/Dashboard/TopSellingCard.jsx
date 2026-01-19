export default function TopSellingCard() {
  return (
    <div className="card bg-info bg-opacity-10 border-2 border-dark p-4 rounded-4">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#001C34" }}>
            Top selling products
          </h3>
          <p
            className="text-muted mb-0"
            style={{ fontSize: "0.75rem" }}
          >
            Our best products for the last 7 days
          </p>
        </div>

        <span
          className="text-muted cursor-pointer"
          style={{ fontSize: "0.75rem" }}
        >
          View full analysis ›
        </span>
      </div>

      {/* Reefer */}
      <div className="mb-3">
        <h4 style={{ fontSize: "0.8rem", color: "#001C34" }}>Reefer</h4>

        <div className="d-flex align-items-center gap-2 bg-white p-2 rounded">
          <img
            src="/vite.svg"
            alt="product"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "6px",
            }}
          />
          <div
            className="flex-grow-1"
            style={{ fontSize: "0.75rem" }}
          >
            <strong className="d-block">₱2,400</strong>
            <span>Reefer clothing - Dark Days (Black)</span>
          </div>
          <div
            className="text-end"
            style={{ fontSize: "0.7rem" }}
          >
            <span className="d-block">Stocks left</span>
            <strong>21</strong>
          </div>
        </div>
      </div>

      {/* Sorbetes */}
      <div className="mb-3">
        <h4 style={{ fontSize: "0.8rem", color: "#001C34" }}>Sorbetes</h4>

        <div style={{ fontSize: "0.75rem" }}>
          <div
            className="d-flex justify-content-between pb-2"
            style={{ borderBottom: "1px solid #dbeafe" }}
          >
            <span>T-shirt</span>
            <span>200 orders</span>
          </div>
          <div
            className="d-flex justify-content-between py-2"
            style={{ borderBottom: "1px solid #dbeafe" }}
          >
            <span>Polo Shirt</span>
            <span>200 orders</span>
          </div>
          <div className="d-flex justify-content-between pt-2">
            <span>Hoodie</span>
            <span>200 orders</span>
          </div>
        </div>
      </div>
    </div>
  );
}
