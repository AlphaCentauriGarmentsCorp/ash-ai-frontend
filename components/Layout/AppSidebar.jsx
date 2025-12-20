import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSidebar } from '../../context/SidebarContext'
import { useAuth } from '../../context/AuthContext'
import { getMenuByRole } from '../../utils/menuConfig'
import './AppSidebar.css'

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, closeMobileSidebar } = useSidebar()
  const { user, userType } = useAuth()
  const location = useLocation()
  const [openSubmenus, setOpenSubmenus] = useState({})
  const subMenuRefs = useRef({})

  const menu = getMenuByRole(userType)

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    // Automatically expand submenus if an item is active
    const newOpenSubmenus = {}
    menu.forEach((section) => {
      section.items.forEach((item, index) => {
        const key = `${section.section}-${index}`
        if (item.subItems) {
          item.subItems.forEach((subItem, subIndex) => {
            if (isActive(subItem.path)) {
              newOpenSubmenus[key] = true
            }
          })
        }
      })
    })
    setOpenSubmenus((prev) => ({ ...prev, ...newOpenSubmenus }))
  }, [location])

  const toggleSubmenu = (key) => {
    setOpenSubmenus((prev) => {
      const newState = { ...prev, [key]: !prev[key] }
      const element = subMenuRefs.current[key]

      if (!element) return newState

      if (newState[key]) {
        element.style.display = 'block'
        element.style.height = '0px'
        element.style.overflow = 'hidden'

        const targetHeight = element.scrollHeight
        const animation = element.animate([{ height: '0px' }, { height: `${targetHeight}px` }], {
          duration: 300,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        })

        animation.onfinish = () => {
          element.style.height = 'auto'
          element.style.overflow = 'visible'
        }
      } else {
        const startHeight = element.scrollHeight
        element.style.height = `${startHeight}px`
        element.style.overflow = 'hidden'

        const animation = element.animate([{ height: `${startHeight}px` }, { height: '0px' }], {
          duration: 300,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        })

        animation.onfinish = () => {
          element.style.display = 'none'
        }
      }

      return newState
    })
  }

  const renderSubItems = (items, parentKey) => {
    return (
      <ul className="sidebar-submenu">
        {items.map((subItem, index) => {
          const key = `${parentKey}-${index}`
          return (
            <li key={subItem.name}>
              <Link
                to={subItem.path}
                className={`sidebar-subitem ${isActive(subItem.path) ? 'active' : ''}`}
                onClick={closeMobileSidebar}
              >
                <span className="subitem-bullet">•</span>
                {subItem.name}
              </Link>
            </li>
          )
        })}
      </ul>
    )
  }

  const renderMenuItems = (section) => {
    return (
      <div key={section.section} className="sidebar-section">
        <h2 className={`sidebar-section-title ${!isExpanded && !isHovered ? 'collapsed' : ''}`}>
          {(isExpanded || isHovered || isMobileOpen) && section.section}
        </h2>
        <ul className="sidebar-menu-list">
          {section.items.map((item, index) => {
            const key = `${section.section}-${index}`
            const hasSubItems = item.subItems && item.subItems.length > 0
            const isOpen = openSubmenus[key]

            return (
              <li key={item.name} className="sidebar-menu-item">
                {hasSubItems ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(key)}
                      className={`sidebar-link group ${
                        isOpen ? 'active' : ''
                      } ${!isExpanded && !isHovered ? 'justify-center' : 'justify-start'}`}
                    >
                      <iconify-icon icon={item.icon} className="sidebar-icon"></iconify-icon>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <>
                          <span className="sidebar-label">{item.name}</span>
                          <iconify-icon
                            icon="mdi:chevron-down"
                            className={`sidebar-chevron ${isOpen ? 'rotate-180' : ''}`}
                          ></iconify-icon>
                        </>
                      )}
                    </button>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <div
                        ref={(el) => {
                          subMenuRefs.current[key] = el
                        }}
                        className="submenu-container"
                        style={{
                          display: isOpen ? 'block' : 'none',
                          height: isOpen ? 'auto' : '0px',
                        }}
                      >
                        {renderSubItems(item.subItems, key)}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`sidebar-link ${isActive(item.path) ? 'active' : ''} ${
                      !isExpanded && !isHovered ? 'justify-center' : 'justify-start'
                    }`}
                    onClick={closeMobileSidebar}
                  >
                    <iconify-icon icon={item.icon} className="sidebar-icon"></iconify-icon>
                    {(isExpanded || isHovered || isMobileOpen) && <span className="sidebar-label">{item.name}</span>}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  return (
    <>
      {isMobileOpen && <div className="sidebar-overlay" onClick={closeMobileSidebar} />}
      <aside
        className={`sidebar ${isExpanded || isMobileOpen ? 'expanded' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* User Section */}
        <div className="sidebar-user-section">
          <Link to="/profile" className="sidebar-user-link">
            {(isExpanded || isHovered || isMobileOpen) && user ? (
              <>
                <div className="user-avatar">
                  <iconify-icon icon="mdi:account-circle"></iconify-icon>
                </div>
                <div className="user-info">
                  <div className="user-name">{user.profile?.last_name}, {user.profile?.first_name}</div>
                  <div className="user-type">{(userType || 'Unknown').replace(/_/g, ' ')}</div>
                </div>
              </>
            ) : (
              <div className="user-avatar-icon">
                <iconify-icon icon="mdi:account-circle"></iconify-icon>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menu.map((section) => renderMenuItems(section))}
        </nav>
      </aside>
    </>
  )
}
