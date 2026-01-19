import { useState, useRef } from "react"
import { ChevronDown, ChevronUp, Settings, LogOut } from "lucide-react"

export default function UserProfile() {
  const [roleOpen, setRoleOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0, width: 0 })
  const userCardRef = useRef(null)

  const roles = [
    "Warehouse Manager",
    "General Manager",
    "Graphic Artists",
  ]

  const handleRoleClick = () => {
    if (userCardRef.current && !roleOpen) {
      const rect = userCardRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      })
    }
    setRoleOpen(!roleOpen)
    setMenuOpen(false)
  }

  const handleMenuClick = () => {
    if (userCardRef.current && !menuOpen) {
      const rect = userCardRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      })
    }
    setMenuOpen(!menuOpen)
    setRoleOpen(false)
  }

  return (
    <div className="position-relative">
      <div 
        className="d-flex align-items-center gap-2 bg-white border border-dark rounded-4 p-2" 
        ref={userCardRef}
        style={{ borderWidth: "2px" }}
      >
        {/* Avatar */}
        <div 
          className="rounded-circle border border-dark d-flex align-items-center justify-content-center" 
          style={{ width: "36px", height: "36px", borderWidth: "2px" }}
        >
          <span 
            className="rounded-circle bg-dark" 
            style={{ width: "16px", height: "16px" }}
          />
        </div>

        {/* Name + Role */}
        <div className="cursor-pointer" onClick={handleRoleClick}>
          <strong className="d-block" style={{ fontSize: "0.9rem" }}>Kurt Russel Q. Santos</strong>
          <span className="d-flex align-items-center gap-1" style={{ fontSize: "0.75rem", color: "#64748b" }}>
            Admin
            <ChevronDown size={14} />
          </span>
        </div>

        {/* Right dropdown toggle */}
        <button
          className="btn btn-link text-dark p-0 ms-auto"
          onClick={handleMenuClick}
        >
          {menuOpen ? <ChevronUp /> : <ChevronDown />}
        </button>
      </div>

      {/* Role dropdown */}
      {roleOpen && (
        <div 
          className="position-fixed bg-white border rounded-2 shadow" 
          style={{ 
            top: dropdownPos.top, 
            left: dropdownPos.left, 
            width: dropdownPos.width,
            zIndex: 9999
          }}
        >
          {roles.map((role) => (
            <button 
              key={role} 
              className="btn btn-link w-100 text-start text-dark text-decoration-none p-2"
              style={{ borderBottom: "1px solid #e2e8f0" }}
            >
              {role}
            </button>
          ))}
        </div>
      )}

      {/* Settings dropdown */}
      {menuOpen && (
        <div 
          className="position-fixed bg-white border rounded-2 shadow" 
          style={{ 
            top: dropdownPos.top, 
            left: dropdownPos.left, 
            width: dropdownPos.width,
            zIndex: 9999
          }}
        >
          <button className="btn btn-link w-100 text-start text-dark text-decoration-none p-2 d-flex align-items-center gap-2">
            <Settings size={16} /> Settings
          </button>
          <button className="btn btn-link w-100 text-start text-dark text-decoration-none p-2 d-flex align-items-center gap-2">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}
