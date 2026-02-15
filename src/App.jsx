import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import "./index.css";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import AddEmployeeAccount from "./pages/Accounts/AddNewAccount";
import AllEmployeeAccount from "./pages/Accounts/AllAccount";
import AddNewClient from "./pages/Clients/AddNewClient";
import AllClients from "./pages/Clients/AllClient";
import AddNewOrder from "./pages/Orders/AddNewOrder";
import PatternType from "./pages/drop down settings/Pattern type/Pattern Type";
import AddPatternType from "./pages/drop down settings/Pattern type/AddPatternType";
import ApparelType from "./pages/drop down settings/Apparel type/Apparel Type";
import AddApparelType from "./pages/drop down settings/Apparel type/AddApparelType";
import ServiceType from "./pages/drop down settings/Service type/Service Type";
import AddServiceType from "./pages/drop down settings/Service type/AddServiceType";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary dark:bg-dark-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-15 w-15 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/new"
          element={
            <ProtectedRoute>
              <AddNewOrder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/account/employee"
          element={
            <ProtectedRoute>
              <AllEmployeeAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/employee/new"
          element={
            <ProtectedRoute>
              <AddEmployeeAccount />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <AllClients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients/new"
          element={
            <ProtectedRoute>
              <AddNewClient />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/pattern-type"
          element={
            <ProtectedRoute>
              <PatternType />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/pattern-type/new"
          element={
            <ProtectedRoute>
              <AddPatternType />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/apparel-type"
          element={
            <ProtectedRoute>
              <ApparelType />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/apparel-type/new"
          element={
            <ProtectedRoute>
              <AddApparelType />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/service-type"
          element={
            <ProtectedRoute>
              <ServiceType />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/service-type/new"
          element={
            <ProtectedRoute>
              <AddServiceType />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
