import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './RoleSwitcher.css'

export default function RoleSwitcher() {
  const { userType, switchRole, AVAILABLE_ROLES } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const getRoleLabel = (role) => {
    return role
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="role-switcher">
      <button
        className="role-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Switch role for testing"
      >
        <span className="role-switcher-icon">🔄</span>
        <span className="role-switcher-label">{getRoleLabel(userType)}</span>
      </button>

      {isOpen && (
        <div className="role-switcher-dropdown">
          <div className="role-switcher-header">
            <h3>Test Roles</h3>
            <button
              className="role-switcher-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="role-switcher-list">
            {AVAILABLE_ROLES.map((role) => (
              <button
                key={role}
                className={`role-switcher-item ${userType === role ? 'active' : ''}`}
                onClick={() => {
                  switchRole(role)
                  setIsOpen(false)
                }}
              >
                <span className="role-switcher-item-name">{getRoleLabel(role)}</span>
                {userType === role && <span className="role-switcher-checkmark">✓</span>}
              </button>
            ))}
          </div>
          <div className="role-switcher-footer">
            <small>Note: This is for development/testing only</small>
          </div>
        </div>
      )}
    </div>
  )
}
