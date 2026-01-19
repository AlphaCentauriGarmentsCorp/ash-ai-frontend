import { Routes, Route, Navigate } from 'react-router-dom'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { SidebarProvider } from './context/SidebarContext'
import { AuthProvider } from './context/AuthContext'
import Login from './components/Login'
import OTPVerification from './components/OTPVerification'
import ForgotPassword from './components/ForgotPassword'
import PasswordConfirmation from './components/PasswordConfirmation'
import CreateNewPassword from './components/CreateNewPassword'
import PasswordResetSuccess from './components/PasswordResetSuccess'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import NewOrder from './pages/NewOrder'
import Clients from './pages/Clients'
import NewClient from './pages/NewClient'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Routes>
          {/* Auth Routes - No Sidebar */}
          <Route path="/login" element={<Login />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/password-confirmation" element={<PasswordConfirmation />} />
          <Route path="/create-new-password" element={<CreateNewPassword />} />
          <Route path="/password-reset-success" element={<PasswordResetSuccess />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<NewOrder />} />

            <Route path="/csr/orders" element={<Orders />} />
            <Route path="/csr/orders/new" element={<NewOrder />} />
            <Route path="/csr/orders/completed" element={<Orders />} />
            <Route path="/csr/orders/history" element={<Orders />} />
            <Route path="/csr/orders/for-delivery" element={<Orders />} />

            <Route path="/admin/orders" element={<Orders />} />

            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/new" element={<NewClient />} />

            <Route path="/csr/clients" element={<Clients />} />
            <Route path="/csr/clients/contacts" element={<Clients />} />
            <Route path="/csr/clients/notes" element={<Clients />} />

            <Route path="/admin/clients" element={<Clients />} />
          </Route>

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  )
}

export default App
