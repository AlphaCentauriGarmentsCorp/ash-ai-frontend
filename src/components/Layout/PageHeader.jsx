export default function PageHeader({ title, breadcrumb, icon }) {
  return (
    <div
      className="d-flex justify-content-between align-items-center px-4 py-3 bg-white"
      style={{
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      {/* LEFT: Icon + Title */}
      <div className="d-flex align-items-center gap-3">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle"
          style={{
            width: "44px",
            height: "44px",
            border: "2px solid #001C34",
            color: "#001C34",
          }}
        >
          {icon}
        </div>

        <h2
          className="mb-0"
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#001C34",
          }}
        >
          {title}
        </h2>
      </div>

      {/* RIGHT: Breadcrumb */}
      <div
        style={{
          fontSize: "0.85rem",
          color: "#64748b",
        }}
      >
        {breadcrumb}
      </div>
    </div>
  )
}
