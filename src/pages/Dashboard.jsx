import { useAuth } from '../context/AuthContext'
import DashboardLayout from "../components/Layout/DashboardLayout"
import { LayoutDashboard } from "lucide-react"
import ChecklistCard from '../components/Dashboard/ChecklistCard'
import ExternalOperationsCard from '../components/Dashboard/ExternalOperationsCard'
import ManufacturingCard from '../components/Dashboard/ManufacturingCard'
import QuickActionCard from '../components/Dashboard/QuickActionCard'
import StatCard from '../components/Dashboard/StatCard'
import TopSellingCard from '../components/Dashboard/TopSellingCard'
import WorkDistributionCard from '../components/Dashboard/WorkDistributionCard'
import './Dashboard.css'

export default function Dashboard() {
  const { user, userType } = useAuth()

  return (
    <DashboardLayout
      title="Dashboard"
      breadcrumb="Home / Dashboard"
      icon={<LayoutDashboard size={18} />}
    >
      <div className="dashboard">
        {/* Quick Actions - Row 1 */}
        <div className="row g-3 mb-4">
          <div className="col-md-6 col-lg-3">
            <QuickActionCard title="Orders" type="orders" />
          </div>
          <div className="col-md-6 col-lg-3">
            <QuickActionCard title="Clients" type="clients" />
          </div>
          <div className="col-md-6 col-lg-3">
            <QuickActionCard title="Payroll" type="payroll" />
          </div>
          <div className="col-md-6 col-lg-3">
            <QuickActionCard title="Finance" type="finance" />
          </div>
        </div>

        {/* Stats - Row 2 */}
        <div className="row g-3 mb-4">
          <div className="col-md-6 col-lg-3">
            <StatCard title="Total Orders" value="1,234" color="green" badgeValue="+12%" badgeLabel="this week" />
          </div>
          <div className="col-md-6 col-lg-3">
            <StatCard title="Pending Tasks" value="24" color="orange" badgeValue="+4" badgeLabel="today" />
          </div>
          <div className="col-md-6 col-lg-3">
            <StatCard title="Revenue" value="₱45.2K" color="green" badgeValue="+8.2%" badgeLabel="this month" />
          </div>
          <div className="col-md-6 col-lg-3">
            <StatCard title="Issues" value="3" color="red" badgeValue="2" badgeLabel="critical" />
          </div>
        </div>

        {/* Main Content - Row 3 */}
        <div className="row g-3 mb-4">
          <div className="col-lg-6">
            <TopSellingCard />
          </div>
          <div className="col-lg-6">
            <ChecklistCard />
          </div>
        </div>

        {/* Manufacturing & Operations - Row 4 */}
        <div className="row g-3 mb-4">
          <div className="col-lg-6">
            <ManufacturingCard />
          </div>
          <div className="col-lg-6">
            <ExternalOperationsCard />
          </div>
        </div>

        {/* Work Distribution - Row 5 */}
        <div className="row">
          <div className="col-12">
            <WorkDistributionCard />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
