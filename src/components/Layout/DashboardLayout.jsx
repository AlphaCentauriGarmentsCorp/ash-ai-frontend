import AppSidebar from "./AppSidebar"
import Topbar from "./Topbar"
import PageHeader from "./PageHeader"

export default function DashboardLayout({ children, title, breadcrumb, icon }) {
  return (
    <div className="d-flex vh-100 overflow-hidden">
      <AppSidebar />

      <div className="flex-grow-1 d-flex flex-column" style={{ height: "100vh" }}>
        <Topbar />

        <PageHeader
          title={title}
          breadcrumb={breadcrumb}
          icon={icon}
        />

        <div className="overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
