import { useNavigate } from "react-router-dom"
import { ShoppingBag, Users, Wallet, BarChart } from "lucide-react"

const icons = {
  orders: ShoppingBag,
  clients: Users,
  payroll: Wallet,
  finance: BarChart,
}

export default function QuickActionCard({ title, type }) {
  const navigate = useNavigate()
  const Icon = icons[type]
  const handleClick = () => {
    if (type === "orders") navigate("/orders")
  }

  return (
    <div className="card bg-dark text-white p-4 rounded-4"
      style={{ minHeight: "170px", cursor: "pointer", position: "relative" }}
      onClick={handleClick}>
      <div 
        className="rounded-circle bg-white text-dark d-flex align-items-center justify-content-center" 
        style={{ position: "absolute", top: "16px", right: "16px", width: "36px", height: "36px" }}
      >
        <Icon size={18} />
      </div>

      <h3 className="mt-5 mb-auto" style={{ fontSize: "1.15rem", fontWeight: "600" }}>{title}</h3>

      <small className="text-white-50">View full details</small>
    </div>
  )
}
