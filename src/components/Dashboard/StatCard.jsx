export default function StatCard({
  title,
  value,
  color,
  badgeValue,
  badgeLabel,
}) {
  const colorMap = {
    green: { bg: "bg-success", border: "border-success", text: "text-success" },
    orange: { bg: "bg-warning", border: "border-warning", text: "text-warning" },
    red: { bg: "bg-danger", border: "border-danger", text: "text-danger" },
  }

  const colorClass = colorMap[color]

  return (
    <div className={`card border-2 ${colorClass.border} p-4`} style={{ backgroundColor: `rgba(${color === 'green' ? '34,197,94' : color === 'orange' ? '217,119,6' : '239,68,68'}, 0.1)`, borderRadius: "1rem" }}>
      <p className={`${colorClass.text} mb-2`} style={{ fontSize: "0.85rem" }}>{title}</p>

      <h2 className={`${colorClass.text} mb-3`} style={{ fontSize: "1.8rem", fontWeight: "700" }}>{value}</h2>

      <span className={`badge ${colorClass.bg} rounded-pill`}>
        {badgeValue}
        <span className="ms-1">{badgeLabel}</span>
      </span>
    </div>
  )
}
