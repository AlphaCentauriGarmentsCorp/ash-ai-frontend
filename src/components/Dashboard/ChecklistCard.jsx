export default function ChecklistCard() {
  return (
    <div className="card bg-info bg-opacity-10 border p-4 rounded-4" style={{ borderColor: "#bcd5f5" }}>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#001C34" }}>Checklist</h3>
        <span className="text-muted cursor-pointer" style={{ fontSize: "0.75rem" }}>View full checklist ›</span>
      </div>

      <div className="text-center text-muted py-5" style={{ fontSize: "0.8rem" }}>
        No employee data available
      </div>
    </div>
  )
}
