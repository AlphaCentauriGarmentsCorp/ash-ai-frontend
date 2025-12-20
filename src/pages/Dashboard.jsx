import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

export default function Dashboard() {
  const { user, userType } = useAuth()

  const roleName = userType?.replace(/_/g, ' ').toUpperCase() || 'User'

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">
          Welcome back, {user?.profile?.first_name || 'User'}! 👋
        </p>
      </div>

      <div className="dashboard-cards">
        {/* Role Card */}
        <div className="dashboard-card">
          <div className="card-icon">
            <iconify-icon icon="mdi:account-circle"></iconify-icon>
          </div>
          <div className="card-content">
            <h3 className="card-title">Your Role</h3>
            <p className="card-value">{roleName}</p>
            <p className="card-subtitle">Department Assignment</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="dashboard-card">
          <div className="card-icon success">
            <iconify-icon icon="mdi:check-circle"></iconify-icon>
          </div>
          <div className="card-content">
            <h3 className="card-title">Status</h3>
            <p className="card-value">Active</p>
            <p className="card-subtitle">System Status: Operational</p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="dashboard-card">
          <div className="card-icon info">
            <iconify-icon icon="mdi:information"></iconify-icon>
          </div>
          <div className="card-content">
            <h3 className="card-title">Profile</h3>
            <p className="card-value">{user?.profile?.last_name}, {user?.profile?.first_name}</p>
            <p className="card-subtitle">{user?.email}</p>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="dashboard-card">
          <div className="card-icon warning">
            <iconify-icon icon="mdi:lightning-bolt"></iconify-icon>
          </div>
          <div className="card-content">
            <h3 className="card-title">Quick Start</h3>
            <p className="card-subtitle">Access your role-specific features from the sidebar</p>
            <div className="quick-actions">
              <button className="quick-action-btn">
                <iconify-icon icon="mdi:help-circle"></iconify-icon>
              </button>
              <button className="quick-action-btn">
                <iconify-icon icon="mdi:cog"></iconify-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="dashboard-section">
        <h2 className="section-title">Recent Activities</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <iconify-icon icon="mdi:login"></iconify-icon>
            </div>
            <div className="activity-content">
              <p className="activity-title">System Login</p>
              <p className="activity-time">Just now</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <iconify-icon icon="mdi:check"></iconify-icon>
            </div>
            <div className="activity-content">
              <p className="activity-title">Navigation Structure Loaded</p>
              <p className="activity-time">Moments ago</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <iconify-icon icon="mdi:bell"></iconify-icon>
            </div>
            <div className="activity-content">
              <p className="activity-title">Dashboard Ready</p>
              <p className="activity-time">System initialized</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
