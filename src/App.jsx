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
import AllOrders from "./pages/Orders/AllOrders";
import PatternType from "./pages/DropDownSettings/PatternType/PatternType";
import AddPatternType from "./pages/DropDownSettings/PatternType/AddPatternType";
import ApparelType from "./pages/DropDownSettings/ApparelType/ApparelType";
import AddApparelType from "./pages/DropDownSettings/ApparelType/AddApparelType";
import ServiceTypeList from "./pages/DropDownSettings/ServiceType/ServiceType";
import AddServiceType from "./pages/DropDownSettings/ServiceType/AddServiceType";
import PrintMethod from "./pages/DropDownSettings/PrintMethod/PrintMethod";
import AddPrintMethod from "./pages/DropDownSettings/PrintMethod/AddPrintMethod";
import SizeLabel from "./pages/DropDownSettings/SizeLabel/SizeLabel";
import AddSizeLabel from "./pages/DropDownSettings/SizeLabel/AddSizeLabel";
import PrintLabelPlacement from "./pages/DropDownSettings/PrintLabelPlacements/PrintLabelPlacement";
import AddPrintLabelPlacement from "./pages/DropDownSettings/PrintLabelPlacements/AddPrintLabelPlacement";

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
          path="/orders"
          element={
            <ProtectedRoute>
              <AllOrders />
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
              <ServiceTypeList />
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

        <Route
          path="/admin/settings/print-method"
          element={
            <ProtectedRoute>
              <PrintMethod />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/print-method/new"
          element={
            <ProtectedRoute>
              <AddPrintMethod />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/size-label"
          element={
            <ProtectedRoute>
              <SizeLabel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/size-label/new"
          element={
            <ProtectedRoute>
              <AddSizeLabel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/print-label-placements"
          element={
            <ProtectedRoute>
              <PrintLabelPlacement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/print-label-placements/new"
          element={
            <ProtectedRoute>
              <AddPrintLabelPlacement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
