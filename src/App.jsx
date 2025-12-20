
import { Routes, Route, Navigate } from 'react-router-dom'
import { SidebarProvider } from './context/SidebarContext'
import { AuthProvider } from './context/AuthContext'
import Login from './components/Login'
import OTPVerification from './components/OTPVerification'
import ForgotPassword from './components/ForgotPassword'
import PasswordConfirmation from './components/PasswordConfirmation'
import CreateNewPassword from './components/CreateNewPassword'
import PasswordResetSuccess from './components/PasswordResetSuccess'
import MainLayout from './components/Layout/MainLayout'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import Dashboard from './pages/Dashboard'
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

          {/* Protected Routes - With Sidebar Layout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </SidebarProvider>
    </AuthProvider>
  )
}

export default App
