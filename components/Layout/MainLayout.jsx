import { Outlet } from 'react-router-dom'
import AppSidebar from './AppSidebar'
import RoleSwitcher from '../RoleSwitcher'
import './MainLayout.css'

export default function MainLayout() {
  return (
    <div className="main-layout">
      <AppSidebar />
      <div className="main-content">
        <div className="main-header">
          <RoleSwitcher />
        </div>
        <Outlet />
      </div>
    </div>
  )
}
