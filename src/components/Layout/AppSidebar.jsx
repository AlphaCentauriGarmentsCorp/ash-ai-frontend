import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSidebar } from '../../context/SidebarContext'
import { useAuth } from '../../context/AuthContext'
import './AppSidebar.css'
import logoImage from '../../assets/images/Ash-Ai3.png'

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, closeMobileSidebar } = useSidebar()
  const { userType } = useAuth()
  const location = useLocation()
  const [openSubmenus, setOpenSubmenus] = useState({})
  const [openSections, setOpenSections] = useState({
    'Sample Operations': true,
  })
  const subMenuRefs = useRef({})

  const menu = [
    {
      section: 'Home',
      items: [
        { name: 'Dashboard', icon: 'mdi:home', path: '/dashboard' },
        { name: 'Clients', icon: 'mdi:account-group-outline', path: '/clients' },
        { name: 'Reefer', icon: 'mdi:tshirt-crew-outline', path: '/clients?brand=reefer' },
        { name: 'Sorbetes', icon: 'mdi:tshirt-crew', path: '/clients?brand=sorbetes' },
      ],
    },
    {
      section: 'Sample Operations',
      items: [
        { name: 'Orders', icon: 'mdi:clipboard-text-outline', path: '/orders' },
        { name: 'Design and Approval', icon: 'mdi:palette-outline', path: '/dashboard?module=design-approval' },
        { name: 'Screen Making', icon: 'mdi:monitor-edit', path: '/dashboard?module=screen-making' },
        { name: 'Screen Checking', icon: 'mdi:check-circle-outline', path: '/dashboard?module=screen-checking' },
        { name: 'Sampling Material', icon: 'mdi:archive-outline', path: '/dashboard?module=sampling-material' },
        { name: 'Printing Operations', icon: 'mdi:printer-outline', path: '/dashboard?module=printing-operations' },
        { name: 'Sampling Embroidery', icon: 'mdi:needle', path: '/dashboard?module=sampling-embroidery' },
        { name: 'Sewing Operations', icon: 'mdi:content-cut', path: '/dashboard?module=sewing-operations' },
        { name: 'Cutting Operations', icon: 'mdi:scissors-cutting', path: '/dashboard?module=cutting-operations' },
        { name: 'Sample Approval', icon: 'mdi:check-decagram-outline', path: '/dashboard?module=sample-approval' },
      ],
    },
  ]

  const isActive = (path) => `${location.pathname}${location.search}` === path

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

  useEffect(() => {
    setOpenSections((prev) => ({
      ...prev,
      'Sample Operations': true,
    }))
  }, [userType])

  const toggleSection = (sectionTitle) => {
    setOpenSections((prev) => ({ ...prev, [sectionTitle]: !prev[sectionTitle] }))
  }

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
    const sectionIsCollapsible = section.section === 'Sample Operations'
    const sectionIsOpen = sectionIsCollapsible ? !!openSections[section.section] : true

    return (
      <div key={section.section} className="sidebar-section">
        {sectionIsCollapsible ? (
          <button
            type="button"
            className={`sidebar-section-title sidebar-section-toggle ${!isExpanded && !isHovered ? 'collapsed' : ''}`}
            onClick={() => toggleSection(section.section)}
          >
            {(isExpanded || isHovered || isMobileOpen) && (
              <>
                <span>{section.section}</span>
                <iconify-icon
                  icon="mdi:chevron-down"
                  className={`sidebar-section-chevron ${sectionIsOpen ? 'rotate-180' : ''}`}
                ></iconify-icon>
              </>
            )}
          </button>
        ) : (
          <h2 className={`sidebar-section-title ${!isExpanded && !isHovered ? 'collapsed' : ''}`}>
            {(isExpanded || isHovered || isMobileOpen) && section.section}
          </h2>
        )}
        <ul className="sidebar-menu-list">
          {sectionIsOpen && section.items.map((item, index) => {
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
        {/* Logo Section */}
        <div className="sidebar-logo-section">
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="sidebar-logo-card">
              <img src={logoImage} alt="Ash-Ai" className="sidebar-logo" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menu.map((section) => renderMenuItems(section))}
        </nav>
      </aside>
    </>
  )
}
